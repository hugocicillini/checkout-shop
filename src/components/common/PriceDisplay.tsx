"use client";

import { usePrice } from "@/hooks/use-price";

interface PriceDisplayProps {
  cents: number;
  showCurrency?: boolean;
  className?: string;
  strikethrough?: boolean;
}

export function PriceDisplay({
  cents,
  showCurrency = true,
  className = "",
  strikethrough = false,
}: PriceDisplayProps) {
  const { formatPrice } = usePrice();

  return (
    <span
      className={`${
        strikethrough ? "line-through text-muted-foreground" : ""
      } ${className}`}
    >
      {formatPrice(cents)}
    </span>
  );
}
