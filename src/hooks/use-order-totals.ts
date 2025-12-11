"use client";

import { Product } from "@/app/types/product";
import {
  DEFAULT_SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants/checkout";

interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

export function useOrderTotals(products: Product[]): OrderTotals {
  const subtotal = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}
