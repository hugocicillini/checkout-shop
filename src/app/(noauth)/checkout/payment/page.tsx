"use client";

import { createOrder } from "@/actions/order.actions";
import { processPayment } from "@/actions/payment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PaymentMethod } from "@/generated/prisma/enums";
import { useCartProducts } from "@/hooks/use-cart-products";
import { useOrderTotals } from "@/hooks/use-order-totals";
import { useSession } from "@/lib/auth-client";
import { getCart } from "@/lib/cart";
import { CreditCard, Lock, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function PaymentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { products, loading } = useCartProducts();
  const [isPending, startTransition] = useTransition();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("PIX");

  const cartItems = getCart();
  const { subtotal, shipping, total } = useOrderTotals(products);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">
            Você precisa estar logado
          </p>
          <Link href="/auth/login">
            <Button>Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">Seu carrinho está vazio</p>
          <Link href="/">
            <Button>Continuar Comprando</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        // 1. Criar pedido
        const orderResult = await createOrder({
          userId: session.user.id,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder:
              products.find((p) => p.id === item.productId)?.price || 0,
          })),
          total: total,
          status: "PENDING",
        });

        if (!orderResult.success || !orderResult.data) {
          toast.error("Erro ao criar pedido");
          return;
        }

        // 2. Processar pagamento
        const paymentResult = await processPayment(orderResult.data.id, {
          amount: total,
          description: `Pedido #${orderResult.data.id}`,
          method: selectedMethod,
          items: products.map((p) => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
          })),
          customer: {
            name: session.user.name || "",
            email: session.user.email || "",
          },
        });

        if (!paymentResult.success || !paymentResult.data) {
          toast.error(paymentResult.error || "Erro ao processar pagamento");
          return;
        }

        // 3. Redirecionar baseado no método
        if (selectedMethod === "PIX") {
          // Redirecionar para página do QR Code
          router.push(
            `/checkout/payment/pix?orderId=${orderResult.data.id}`
          );
        } else {
          // Redirecionar para checkout do AbacatePay (cartão)
          if (paymentResult.data.checkoutUrl) {
            window.location.href = paymentResult.data.checkoutUrl;
          } else {
            toast.error("URL de checkout não disponível");
          }
        }
      } catch (error) {
        toast.error("Erro ao processar pedido");
        console.error(error);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Finalizar Pagamento</h1>
        <p className="text-muted-foreground mt-2">
          Escolha o método de pagamento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Pagamento */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seleção de Método de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* PIX */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("PIX")}
                  className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                    selectedMethod === "PIX"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Smartphone
                    className={`h-8 w-8 ${
                      selectedMethod === "PIX"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="font-semibold">PIX</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Pagamento instantâneo
                  </span>
                </button>

                {/* Cartão de Crédito */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("CARD")}
                  className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                    selectedMethod === "CARD"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard
                    className={`h-8 w-8 ${
                      selectedMethod === "CARD"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="font-semibold">Cartão de Crédito</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Débito ou crédito
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Formulário baseado no método */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedMethod === "PIX" ? (
                  <>
                    <Smartphone className="h-5 w-5" />
                    Pagamento via PIX
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Dados do Cartão
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Informações Pessoais (sempre mostrar) */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Informações Pessoais</h3>
                  <div>
                    <Label>Nome Completo</Label>
                    <Input
                      value={session.user.name || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={session.user.email || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Campos específicos para cartão */}
                {selectedMethod === "CARD" && (
                  <>
                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Dados do Cartão</h3>
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Vencimento (MM/YY)</Label>
                          <Input
                            id="expiry"
                            placeholder="12/25"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            type="password"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Endereço de Cobrança</h3>
                      <div>
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          placeholder="Rua, número"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            placeholder="São Paulo"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            placeholder="SP"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="zip">CEP</Label>
                        <Input
                          id="zip"
                          placeholder="12345-678"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Mensagem para PIX */}
                {selectedMethod === "PIX" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Ao clicar em &quot;Pagar com PIX&quot;, você será
                      redirecionado para uma página com o QR Code para realizar
                      o pagamento.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Botão de Pagamento */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending
                    ? "Processando..."
                    : selectedMethod === "PIX"
                    ? "Pagar com PIX"
                    : "Pagar com Cartão"}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Seu pagamento é seguro e criptografado</span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Pedido */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0
                      ? "Grátis"
                      : `R$ ${(shipping / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {(total / 100).toFixed(2)}</span>
              </div>

              <div className="pt-4 space-y-2 text-sm">
                <h4 className="font-semibold">Itens do Pedido</h4>
                {products.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="shrink-0">
                      R${" "}
                      {(((item.price || 0) * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
