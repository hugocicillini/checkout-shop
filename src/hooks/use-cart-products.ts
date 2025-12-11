"use client";

import { getCartWithDetails } from "@/actions/cart.actions";
import { CartItem } from "@/app/types/cart";
import { Product } from "@/app/types/product";
import { getCart } from "@/lib/cart";
import { useCallback, useEffect, useState, useTransition } from "react";

export function useCartProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchCartProducts = useCallback(async () => {
    startTransition(async () => {
      try {
        setLoading(true);

        const cartItems: CartItem[] = getCart();

        if (cartItems.length === 0) {
          setProducts([]);
          return;
        }

        // ✅ Usar Server Action em vez de fetch
        const result = await getCartWithDetails(cartItems);

        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          console.error("Erro ao buscar produtos:", result.error);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos do carrinho:", error);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    fetchCartProducts();
    window.addEventListener("cartUpdated", fetchCartProducts);
    return () => window.removeEventListener("cartUpdated", fetchCartProducts);
  }, [fetchCartProducts]);

  return { products, loading, isPending, refetch: fetchCartProducts };
}
