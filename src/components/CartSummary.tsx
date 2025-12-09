// src/components/CartSummary.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearCart, getCart } from "@/lib/cart";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
}

interface CartSummaryProps {
  products: Product[];
}

export function CartSummary({ products }: CartSummaryProps) {
  const cartItems = getCart();
  const [isClearing, setIsClearing] = useState(false);

  const summary = useMemo(() => {
    let subtotal = 0;
    let totalItems = 0;

    cartItems.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      if (product) {
        subtotal += product.price * cartItem.quantity;
        totalItems += cartItem.quantity;
      }
    });

    const shipping = subtotal > 0 ? 1500 : 0;
    const total = subtotal + shipping;

    return {
      subtotal,
      shipping,
      total,
      totalItems,
    };
  }, [cartItems, products]);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleClearCart = useCallback(async () => {
    setIsClearing(true);
    try {
      clearCart();
      toast.success("Carrinho limpo com sucesso!");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      toast.error("Erro ao limpar carrinho");
    } finally {
      setIsClearing(false);
    }
  }, []);

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              Subtotal ({summary.totalItems} itens)
            </span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Frete</span>
            <span>{formatPrice(summary.shipping)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(summary.total)}</span>
          </div>
        </div>

        <Link href="/checkout/payment" className="w-full">
          <Button className="w-full" disabled={cartItems.length === 0}>
            Ir para Pagamento
          </Button>
        </Link>

        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full">
            Continuar Comprando
          </Button>
        </Link>

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleClearCart}
          disabled={cartItems.length === 0 || isClearing}
        >
          {isClearing ? "Limpando..." : "Limpar Carrinho"}
        </Button>
      </CardContent>
    </Card>
  );
}
