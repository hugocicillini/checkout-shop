// src/app/cart/page.tsx
"use client";

import { CartItemRow } from "@/components/checkout/CartItemRow";
import { CartSummary } from "@/components/checkout/CartSummary";
import { getCart } from "@/lib/cart";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
}

interface CartItem {
  productId: string;
  quantity: number;
}

const Cart = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [optimisticProducts] = useOptimistic(products);

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

    const handleCartUpdate = () => {
      fetchCartProducts();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [fetchCartProducts]);

  if (loading || isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  const displayProducts =
    optimisticProducts.length > 0 ? optimisticProducts : products;
  const cartItems = getCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="flex items-center gap-2 text-blue-600 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar para loja
          </Link>

          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Seu carrinho está vazio
            </h1>
            <p className="text-gray-600 mb-8">
              Adicione alguns produtos para continuar.
            </p>
            <Link href="/">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Ver Produtos
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 text-blue-600 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar para loja
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {cartItems.map((item) => {
                  const product = displayProducts.find(
                    (p) => p.id === item.productId
                  );
                  if (!product) return null;

                  return (
                    <CartItemRow
                      key={product.id}
                      productId={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      quantity={item.quantity}
                      onUpdate={() => {}}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <CartSummary products={displayProducts} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
