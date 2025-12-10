"use client";

import { CreditCard, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { PriceDisplay } from "../common/PriceDisplay";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  disabled?: boolean;
}

export function OrderSummary({
  subtotal,
  shipping,
  total,
  itemCount,
  disabled,
}: OrderSummaryProps) {
  return (
    <Card className="sticky top-4 gap-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>
              <PriceDisplay cents={subtotal} />
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>
              {shipping === 0 ? "Grátis" : <PriceDisplay cents={shipping} />}
            </span>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex items-center justify-between text-base font-medium">
          <span>Total</span>
          <div className="text-end">
            <p className="text-xl font-bold">
              <PriceDisplay cents={total} />
            </p>
          </div>
        </div>

        <Link href="/checkout/payment">
          <Button
            size="lg"
            className="mt-4 w-full text-base font-medium"
            disabled={disabled}
          >
            <ShoppingBag className="me-2 size-5" />
            Finalizar Compra
          </Button>
        </Link>

        <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
          <CreditCard className="size-3.5" />
          <span>Pagamento seguro com criptografia SSL</span>
        </div>
      </CardContent>
    </Card>
  );
}
