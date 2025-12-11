// src/app/(noauth)/checkout/payment/pix/page.tsx
"use client";

import {
  createPixQrCode,
  getPaymentByOrderId,
} from "@/actions/payment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CopyCheck,
  QrCode,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PixPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copyPixCode, setCopyPixCode] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "PENDING" | "PAID" | "FAILED"
  >("PENDING");

  // Fetch inicial do QR Code
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        if (!orderId) {
          toast.error("Pagamento não encontrado");
          router.push("/");
          return;
        }

        const result = await createPixQrCode(orderId);

        if (result.success) {
          setPayment(result.data);
          setPaymentStatus("PENDING");
        } else {
          toast.error(result.error || "Erro ao buscar pagamento");
          router.push("/");
        }
      } catch (error) {
        console.error("Erro ao buscar pagamento:", error);
        toast.error("Erro ao buscar pagamento");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [orderId, router]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!orderId || paymentStatus !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const result = await getPaymentByOrderId(orderId);

        if (result.success && result.data) {
          const status = result.data.status as "PENDING" | "PAID" | "FAILED";
          setPaymentStatus(status);

          if (status === "PAID") {
            toast.success("Pagamento confirmado com sucesso!");
            // Redirecionar após 2 segundos

            // setTimeout(() => {
            //   router.push(`/checkout/payment/confirmation?orderId=${orderId}`);
            // }, 3000);
          } else if (status === "FAILED") {
            toast.error("Pagamento falhou. Tente novamente.");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
      }
    }, 3000); // Verifica a cada 3 segundos

    return () => clearInterval(interval);
  }, [orderId, paymentStatus, router]);

  const handleCopyPixCode = () => {
    if (payment?.pixQrCode) {
      navigator.clipboard.writeText(payment.pixQrCode);
      setCopyPixCode(true);
      toast.success("Código PIX copiado!");

      // Resetar após 2 segundos
      setTimeout(() => setCopyPixCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Pagamento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Pagamento via PIX</CardTitle>
          <p className="text-muted-foreground">
            Escaneie o QR Code ou copie o código para pagar
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            {payment.pixQrCodeUrl ? (
              <Image
                src={payment.pixQrCodeUrl}
                alt="QR Code PIX"
                width={300}
                height={300}
                className="border rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
            )}
          </div>

          {/* Código PIX */}
          <div>
            <label className="text-sm font-medium">Código PIX</label>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={payment.pixQrCode || ""}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm font-mono"
              />
              <Button onClick={handleCopyPixCode} variant="outline">
                {copyPixCode ? (
                  <>
                    <CopyCheck className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm">Como pagar:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside text-blue-800">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar via PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          {/* Status Dinâmico */}
          <div className="text-center">
            {paymentStatus === "PENDING" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-yellow-500 mx-auto mb-2 animate-pulse" />
                <p className="font-semibold">Aguardando pagamento...</p>
                <p className="text-sm text-muted-foreground">
                  Você será notificado assim que o pagamento for confirmado
                </p>
              </>
            )}

            {paymentStatus === "PAID" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-600">
                  Pagamento Confirmado!
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecionando para a confirmação...
                </p>
              </>
            )}

            {paymentStatus === "FAILED" && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="font-semibold text-red-600">Pagamento Falhou</p>
                <p className="text-sm text-muted-foreground">
                  Por favor, tente novamente
                </p>
              </>
            )}
          </div>

          {paymentStatus !== "PAID" && (
            <Button className="w-full" onClick={() => router.push("/orders")}>
              Ver Meus Pedidos
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
