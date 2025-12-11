"use client";

import { Product } from "@/app/types/product";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addToCart } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";

export function ProductCard({
  id,
  name,
  description,
  price,
  quantity,
}: Product) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(id, 1);

    toast.success("Adicionado ao carrinho!", {
      description: `${name} foi adicionado com sucesso.`,
    });

    setIsAdding(false);
  };

  const formattedPrice = (price / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const stockColor = quantity < 5 ? "text-red-600" : "text-green-600";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            {formattedPrice}
          </p>
          <p className={`text-sm font-semibold ${stockColor}`}>
            {quantity > 0 ? `${quantity} em estoque` : "Fora de estoque"}
          </p>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={quantity === 0 || isAdding}
          className="mt-4 w-full"
        >
          {isAdding ? "Adicionando..." : "Adicionar ao carrinho"}
        </Button>
      </CardContent>
    </Card>
  );
}
