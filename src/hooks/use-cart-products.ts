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

        const productPromises = cartItems.map((item) =>
          fetch(`/api/products/${item.productId}`)
            .then((res) => res.json())
            .then((product) => ({
              ...product,
              quantity: item.quantity,
            }))
        );

        const results = await Promise.allSettled(productPromises);

        const fetchedProducts = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => (result as PromiseFulfilledResult<Product>).value);

        setProducts(fetchedProducts);
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
