"use client";

import { Product } from "@/app/types/product";
import { cn } from "@/lib/utils";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { PriceDisplay } from "../common/PriceDisplay";
import { Button } from "../ui/button";
import { Card, CardFooter } from "../ui/card";

interface CartItemProps {
  product: Product;
  onUpdateQuantity: (productId: string, increment: boolean) => void;
  onRemove: (productId: string) => void;
  isRemoving: boolean;
}

export function CartItem({
  product,
  onUpdateQuantity,
  onRemove,
  isRemoving,
}: CartItemProps) {
  return (
    <Card
      className={cn("gap-0 overflow-hidden py-0", {
        "opacity-50": isRemoving,
      })}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-36 w-full sm:w-40">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-foreground text-lg font-medium">
                {product.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {product.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
              onClick={() => onRemove(product.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => onUpdateQuantity(product.id, false)}
                disabled={product.quantity <= 1}
              >
                <Minus className="size-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {product.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => onUpdateQuantity(product.id, true)}
              >
                <Plus className="size-3" />
              </Button>
            </div>

            <div className="text-end">
              <p className="text-lg font-semibold">
                <PriceDisplay cents={product.price * product.quantity} />
              </p>
              <p className="text-muted-foreground text-xs">
                <PriceDisplay cents={product.price} /> cada
              </p>
            </div>
          </div>
        </div>
      </div>

      <CardFooter className="bg-muted/20 border-t px-4 py-2!">
        <div className="text-muted-foreground flex items-center text-sm">
          <Package className="me-2 size-4" />
          <span>Entrega estimada: 2-4 dias úteis</span>
        </div>
      </CardFooter>
    </Card>
  );
}
