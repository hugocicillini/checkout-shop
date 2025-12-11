"use client";

import { CartList } from "@/components/checkout/CartList";
import { CheckoutActions } from "@/components/checkout/CheckoutActions";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { SecurityBadge } from "@/components/checkout/SecurityBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useCartProducts } from "@/hooks/use-cart-products";
import { useOrderTotals } from "@/hooks/use-order-totals";
import { getCart, removeFromCart, updateQuantity } from "@/lib/cart";
import { useCallback, useState } from "react";

export default function CheckoutPage() {
  const { products, loading } = useCartProducts();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const cartItems = getCart();
  
  const { subtotal, shipping, total } = useOrderTotals(products);

  const handleUpdateQuantity = useCallback(
    (productId: string, increment: boolean) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newQty = Math.max(1, product.quantity + (increment ? 1 : -1));
      updateQuantity(productId, newQty);
      window.dispatchEvent(new Event("cartUpdated"));
    },
    [products]
  );

  const handleRemoveItem = useCallback((productId: string) => {
    setIsRemoving(productId);
    setTimeout(() => {
      removeFromCart(productId);
      window.dispatchEvent(new Event("cartUpdated"));
      setIsRemoving(null);
    }, 300);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <CheckoutHeader itemCount={cartItems.length} subtotal={subtotal} />

      <div className="flex flex-col gap-8 lg:flex-row">
        <CartList
          products={products}
          isRemoving={isRemoving}
          onRemove={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
        />

        <div className="w-full space-y-4 lg:w-96">
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            itemCount={cartItems.length}
            disabled={cartItems.length === 0}
          />
          <SecurityBadge />
          <CheckoutActions />
        </div>
      </div>
    </div>
  );
}
