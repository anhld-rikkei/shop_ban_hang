"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart, type CartProduct } from "@/components/sites/lienstore/shop/CartProvider";
import { WooNotice, wooButtonClass } from "@/components/sites/lienstore/shop/cart/WooUi";

interface Props {
  product: CartProduct;
}

/**
 * Product-page extras that need client state:
 * - records the product in "Sản phẩm vừa được xem";
 * - shows the WooCommerce "“X” đã được thêm vào giỏ hàng." notice (with "Xem giỏ hàng") after an AJAX add.
 */
export function ProductPageNotice({ product }: Props) {
  const { trackViewed, lastAdded, hydrated } = useCart();

  useEffect(() => {
    if (hydrated) trackViewed(product);
  }, [hydrated, product, trackViewed]);

  if (!lastAdded || lastAdded.productId !== product.id) return null;

  return (
    <WooNotice
      kind="message"
      role="status"
      action={
        <Link href="/cart/" className={`${wooButtonClass} wc-forward`}>
          Xem giỏ hàng
        </Link>
      }
    >
      “{lastAdded.name}” đã được thêm vào giỏ hàng.
    </WooNotice>
  );
}
