"use server";

import { Product } from "@/app/types/product";
import { CartItem } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

// Buscar itens do carrinho com dados completos
export async function getCartWithDetails(
  cartItems: CartItem[]
): Promise<{ success: boolean; data?: Product[]; error?: string }> {
  try {
    if (cartItems.length === 0) {
      return { success: true, data: [] };
    }

    const productIds = cartItems.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // ✅ Garantir tipo Product corretamente
    const cartWithDetails: Product[] = cartItems
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product
          ? {
              ...product,
              quantity: item.quantity,
            }
          : null;
      })
      .filter(Boolean) as Product[];

    return { success: true, data: cartWithDetails };
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);
    return { success: false, error: "Erro ao buscar carrinho" };
  }
}

// Verificar disponibilidade de produtos
export async function checkProductsAvailability(
  items: Array<{ productId: string; quantity: number }>
) {
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true, quantity: true },
    });

    const unavailable = items.filter((item) => {
      const product = products.find((p) => p.id === item.productId);
      return !product || product.quantity < item.quantity;
    });

    if (unavailable.length > 0) {
      return {
        success: false,
        error: "Alguns produtos não estão disponíveis",
        unavailable,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return { success: false, error: "Erro ao verificar disponibilidade" };
  }
}
