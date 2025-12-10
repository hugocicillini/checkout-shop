"use client";

import { Shield } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function SecurityBadge() {
  return (
    <Card className="border-dashed py-4">
      <CardContent className="px-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Shield className="size-5" />
          </div>
          <div>
            <h4 className="font-medium">Checkout Seguro</h4>
            <p className="text-muted-foreground mt-1 text-xs">
              Suas informações de pagamento são criptografadas e seguras.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
