"use client";

import { Product } from "@/app/types/product";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { CartItem } from "./CartItem";

interface CartListProps {
  products: Product[];
  isRemoving: string | null;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, increment: boolean) => void;
}

export function CartList({
  products,
  isRemoving,
  onRemove,
  onUpdateQuantity,
}: CartListProps) {
  if (products.length === 0) {
    return (
      <Card className="border-dashed flex-1">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="text-muted-foreground/50 mb-4 size-12" />
          <h3 className="text-lg font-medium">Seu carrinho está vazio</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Adicione alguns produtos para começar
          </p>
          <Link href="/">
            <Button className="mt-4" variant="outline">
              Continuar Comprando
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      {products.map((product) => (
        <CartItem
          key={product.id}
          product={product}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          isRemoving={isRemoving === product.id}
        />
      ))}
    </div>
  );
}
