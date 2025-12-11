// src/app/api/webhooks/payment/route.ts
import { handlePaymentWebhook } from "@/actions/payment.actions";
import { ABACATEPAY_PUBLIC_KEY } from "@/lib/constants/abacate-pay";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Verifica se a assinatura do webhook é válida usando HMAC SHA256.
function verifyAbacateSignature(
  rawBody: string,
  signatureFromHeader: string
): boolean {
  const bodyBuffer = Buffer.from(rawBody, "utf8");

  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  const A = Buffer.from(expectedSig);
  const B = Buffer.from(signatureFromHeader);

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validar webhookSecret via query param
    const webhookSecret = request.nextUrl.searchParams.get("webhookSecret");

    if (webhookSecret !== process.env.ABACATE_PAY_WEBHOOK_SECRET) {
      console.error("❌ Webhook secret inválido");
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    // 2. Obter raw body e signature
    const rawBody = await request.text();
    const signature = request.headers.get("X-Webhook-Signature");

    if (!signature) {
      console.error("❌ Signature ausente");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // 3. Validar assinatura HMAC
    const isValid = verifyAbacateSignature(rawBody, signature);
    console.log("🔐 Assinatura válida?", isValid);

    if (!isValid) {
      console.error("❌ Assinatura inválida");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 4. Processar payload
    const payload = JSON.parse(rawBody);
    console.log("📦 Payload recebido:", JSON.stringify(payload, null, 2));

    const result = await handlePaymentWebhook(payload);
    console.log("✅ Resultado do processamento:", result);

    if (result.success) {
      return NextResponse.json({ received: true });
    } else {
      return NextResponse.json(
        { error: result.error || "Erro ao processar webhook" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("💥 Erro no webhook de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
