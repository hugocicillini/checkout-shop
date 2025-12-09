"use client";

import { Button } from "@/components/ui/button";
import { getCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import DropdownProfile from "./profile/DropdownProfile";

export function Header() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };

    updateCartCount();

    // Atualizar quando o localStorage mudar
    window.addEventListener("storage", updateCartCount);

    // Custom event para atualizar quando adicionar ao carrinho
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={160}
            height={24}
            className="rounded-full p-3"
          />
        </Link>

        <nav className="flex items-center gap-4 mx-6">
          <Link href="/checkout">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-xs text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownProfile />
        </nav>
      </div>
    </header>
  );
}
