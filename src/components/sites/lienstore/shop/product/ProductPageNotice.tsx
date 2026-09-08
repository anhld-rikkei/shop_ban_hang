"use client";

import { useEffect } from "react";
import { useCart, type CartProduct } from "@/components/sites/lienstore/shop/CartProvider";

interface Props {
  product: CartProduct;
}

/** Records the product in "Sản phẩm vừa được xem". (Add-to-cart feedback is the slide-in cart drawer.) */
export function ProductPageNotice({ product }: Props) {
  const { trackViewed, hydrated } = useCart();
  useEffect(() => {
    if (hydrated) trackViewed(product);
  }, [hydrated, product, trackViewed]);
  return null;
}
