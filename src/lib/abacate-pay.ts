// src/lib/abacate-pay.ts
"use server";

const ABACATE_API_BASE = "https://api.abacatepay.com/v1";
const ABACATE_PAY_API_KEY = process.env.ABACATE_PAY_API_KEY;

interface Product {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
  cellphone?: string;
  taxId?: string;
}

interface BillingPayload {
  frequency: "ONE_TIME" | "MULTIPLE_PAYMENTS";
  methods: ("PIX" | "CARD")[];
  products: Product[];
  customer: Customer;
  returnUrl: string;
  completionUrl: string;
  externalId: string;
  customerId?: string;
  allowCoupons?: boolean;
  metadata?: Record<string, any>;
}

interface BillingResponse {
  id: string;
  status: string;
  checkoutUrl: string;
  [key: string]: any;
}

export async function createBilling(payload: BillingPayload): Promise<{
  success: boolean;
  data?: BillingResponse;
  error?: string;
}> {
  try {
    if (!ABACATE_PAY_API_KEY) {
      throw new Error("ABACATE_PAY_API_KEY não configurada");
    }

    const response = await fetch(`${ABACATE_API_BASE}/billing/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATE_PAY_API_KEY}`,
      },
      body: JSON.stringify({
        frequency: payload.frequency,
        methods: payload.methods,
        products: payload.products,
        customer: {
          name: payload.customer.name,
          email: payload.customer.email,
          cellphone: payload.customer.cellphone,
          taxId: payload.customer.taxId,
        },
        returnUrl: payload.returnUrl,
        completionUrl: payload.completionUrl,
        customerId: payload.customerId,
        externalId: payload.externalId,
        allowCoupons: payload.allowCoupons ?? false,
        metadata: payload.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("AbacatePay API Error:", error);
      return {
        success: false,
        error: error.message || "Erro ao processar pagamento",
      };
    }

    const response_data = await response.json();
    const billing_data = response_data.data || {};

    return {
      success: true,
      data: billing_data,
    };
  } catch (error) {
    console.error("Erro ao criar billing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
