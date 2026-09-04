"use client";

import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";

interface CartBadgeProps {
  className?: string;
}

/** Live cart item count for the header / floating widgets. Renders 0 until hydrated. */
export function CartBadge({ className }: CartBadgeProps) {
  const { count, hydrated } = useCart();
  return (
    <span data-cart-count={hydrated ? count : 0} className={cn(className)} aria-label={`${count} sản phẩm trong giỏ`}>
      {hydrated ? count : 0}
    </span>
  );
}
