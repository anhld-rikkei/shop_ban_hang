"use client";

import { useEffect } from "react";
import { useCart } from "@/components/sites/lienstore/shop/CartProvider";

/** Empties the client-side cart once the order-received page is shown (the order is already persisted server-side). */
export function ClearCartOnMount() {
  const { hydrated, clear } = useCart();
  useEffect(() => {
    if (hydrated) clear();
  }, [hydrated, clear]);
  return null;
}
