"use client";

import { MoveRight, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function CheckoutActions() {
  return (
    <Link href="/">
      <Button variant="outline" className="w-full">
        <Store className="me-2 size-4" />
        Continuar Comprando
        <MoveRight className="ms-2 size-4" />
      </Button>
    </Link>
  );
}
