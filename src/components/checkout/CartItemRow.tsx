// src/components/CartItemRow.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeFromCart, updateQuantity } from "@/lib/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

interface CartItemRowProps {
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  onUpdate: () => void;
}

export function CartItemRow({
  productId,
  name,
  description,
  price,
  quantity,
  onUpdate,
}: CartItemRowProps) {
  const [qty, setQty] = useState(quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = useCallback(
    (newQty: number) => {
      if (newQty > 0) {
        setIsUpdating(true);
        setQty(newQty);
        updateQuantity(productId, newQty);
        // ← Dispara evento para atualizar Header
        window.dispatchEvent(new Event("cartUpdated"));
        onUpdate();
        setIsUpdating(false);
      }
    },
    [productId, onUpdate]
  );

  const handleDecrement = useCallback(() => {
    handleQuantityChange(Math.max(1, qty - 1));
  }, [qty, handleQuantityChange]);

  const handleIncrement = useCallback(() => {
    handleQuantityChange(qty + 1);
  }, [qty, handleQuantityChange]);

  const handleRemove = useCallback(() => {
    setIsUpdating(true);
    removeFromCart(productId);
    // ← Dispara evento para atualizar Header
    window.dispatchEvent(new Event("cartUpdated"));
    onUpdate();
    setIsUpdating(false);
  }, [productId, onUpdate]);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const itemTotal = price * qty;

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      {/* Informações do produto */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>

        {/* Controle de quantidade */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={isUpdating || qty <= 1}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            value={qty}
            onChange={(e) =>
              handleQuantityChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-16 text-center h-8"
            disabled={isUpdating}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={isUpdating}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preço */}
      <div className="text-right">
        <p className="text-sm text-gray-600">{formatPrice(price)} cada</p>
        <p className="font-bold text-lg text-blue-600 mt-2">
          {formatPrice(itemTotal)}
        </p>
      </div>
    </div>
  );
}
