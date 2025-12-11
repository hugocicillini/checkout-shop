// src/actions/payment.actions.ts
"use server";

import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import { createBilling } from "@/lib/abacate-pay";
import { prisma } from "@/lib/prisma";

export async function processPayment(
  orderId: string,
  paymentData: {
    amount: number;
    description: string;
    method: PaymentMethod;
    items: Array<{ name: string; quantity: number; price: number }>;
    customer: {
      name: string;
      email: string;
      cellphone?: string;
      taxId?: string;
    };
  }
) {
  try {
    let billingId = "";
    let checkoutUrl = "";

    // 1. Criar billing no AbacatePay
    if (paymentData.method === "CARD") {
      const billingResult = await createBilling({
        frequency: "ONE_TIME",
        methods: [paymentData.method], // ✅ Usar método selecionado
        products: paymentData.items.map((item, index) => ({
          externalId: `prod-${orderId}-${index}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        customer: {
          name: paymentData.customer.name,
          email: paymentData.customer.email,
          cellphone: "(11) 4002-8922",
          taxId: "456.874.218-82",
        },
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment/return`,
        completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment/completion`,
        externalId: orderId,
        customerId: undefined,
        allowCoupons: false,
        metadata: {
          orderId,
        },
      });

      if (!billingResult.success || !billingResult.data) {
        return {
          success: false,
          error: billingResult.error || "Erro ao criar cobrança",
        };
      }

      billingId = billingResult.data.id;
      checkoutUrl = billingResult.data.url;
    } else {
      billingId = `pix-${orderId}`;
    }

    // 2. Salvar referência no banco
    const payment = await prisma.payment.create({
      data: {
        orderId,
        billingId,
        amount: paymentData.amount,
        status: "PENDING",
        method: paymentData.method as PaymentMethod,
        provider: "ABACATE_PAY",
        checkoutUrl: checkoutUrl || null,
      },
    });

    // 3. Retornar dados
    return {
      success: true,
      data: {
        paymentId: payment.id,
        billingId: payment.billingId,
        checkoutUrl: payment.checkoutUrl,
        status: "PENDING",
      },
    };
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    return {
      success: false,
      error: "Erro ao processar pagamento",
    };
  }
}

export async function getPaymentByOrderId(orderId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      return { success: false, error: "Pagamento não encontrado" };
    }

    return { success: true, data: payment };
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    return { success: false, error: "Erro ao buscar pagamento" };
  }
}

export async function createPixQrCode(orderId: string) {
  try {
    // 1. Buscar payment
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: { include: { items: true, user: true } } },
    });

    if (!payment) {
      return { success: false, error: "Pagamento não encontrado" };
    }

    if (
      payment.pixQrCode &&
      payment.pixQrCodeUrl &&
      new Date() < payment.expiresAt!
    ) {
      return {
        success: true,
        data: {
          pixQrCode: payment.pixQrCode,
          pixQrCodeUrl: payment.pixQrCodeUrl,
          expiresAt: payment.expiresAt,
        },
      };
    }

    // 2. Criar QR Code no AbacatePay
    const response = await fetch(
      "https://api.abacatepay.com/v1/pixQrCode/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ABACATE_PAY_API_KEY}`,
        },
        body: JSON.stringify({
          amount: payment.amount,
          expiresIn: 3600, // 1 hora
          description: `Pedido #${orderId}`,
          customer: {
            name: payment.order.user.name || "",
            cellphone: "(11) 4002-8922",
            email: payment.order.user.email || "",
            taxId: "456.874.218-82",
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const result = await response.json();
    const qrData = result.data;

    // 3. Atualizar payment com QR Code
    await prisma.payment.update({
      where: { orderId },
      data: {
        billingId: qrData.id,
        pixQrCode: qrData.brCode,
        pixQrCodeUrl: qrData.brCodeBase64,
        expiresAt: new Date(qrData.expiresAt),
      },
    });

    return {
      success: true,
      data: {
        pixQrCode: qrData.brCode,
        pixQrCodeUrl: qrData.brCodeBase64,
        expiresAt: new Date(qrData.expiresAt),
      },
    };
  } catch (error) {
    console.error("Erro ao criar QR Code PIX:", error);
    return { success: false, error: "Erro ao criar QR Code" };
  }
}

// Webhook do AbacatePay
export async function handlePaymentWebhook(payload: any) {
  try {
    console.log("Webhook payload completo:", JSON.stringify(payload, null, 2));

    // ✅ Estrutura correta do AbacatePay
    const event = payload.event; // "billing.paid"
    const pixQrCode = payload.data?.pixQrCode;

    if (!pixQrCode) {
      console.error("pixQrCode não encontrado no payload");
      return { success: false, error: "Dados inválidos" };
    }

    const pixQrCodeId = pixQrCode.id; // "pix_char_FzFuhRRtrfNXU2H15gFWwNyZ"
    const status = pixQrCode.status; // "PAID"

    // ✅ Mapear para PaymentStatus do Prisma
    const statusMap: Record<string, PaymentStatus> = {
      PENDING: "PENDING",
      PROCESSING: "PROCESSING",
      PAID: "PAID",
      FAILED: "FAILED",
      CANCELED: "CANCELLED",
    };

    const newStatus = statusMap[status] || "PENDING";

    // 1. Buscar payment pelo pixQrCode ID ou billingId
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { billingId: pixQrCodeId },
          { pixQrCode: { contains: pixQrCodeId } },
        ],
      },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      console.error("Payment não encontrado para pixQrCodeId:", pixQrCodeId);
      return { success: false, error: "Pagamento não encontrado" };
    }

    // 2. Atualizar payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: newStatus === "PAID" ? new Date() : null,
      },
    });

    // 3. Se pagamento aprovado
    if (newStatus === "PAID") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      });

      // Reduzir estoque
      for (const item of payment.order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    // 4. Se pagamento falhou
    if (newStatus === "FAILED" || newStatus === "CANCELLED") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "FAILED" },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return { success: false };
  }
}
