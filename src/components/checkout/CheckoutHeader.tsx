"use client";

import { PriceDisplay } from "../common/PriceDisplay";

interface CheckoutHeaderProps {
  itemCount: number;
  subtotal: number;
}

export function CheckoutHeader({ itemCount, subtotal }: CheckoutHeaderProps) {
  return (
    <div className="mb-8 space-y-2 text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Seu Carrinho
      </h1>
      <p className="text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho •{" "}
        <span className="text-foreground font-semibold">
          <PriceDisplay cents={subtotal} />
        </span>
      </p>
    </div>
  );
}
