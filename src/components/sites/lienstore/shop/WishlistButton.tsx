"use client";

import { Fa } from "@/components/sites/lienstore/shared/icons";
import { cn } from "@/lib/utils";
import { useCart, type CartProduct } from "./CartProvider";

interface WishlistButtonProps {
  product: CartProduct;
  /** icon = the small heart on listing cards; button = the blue "Add to wishlist" button on the product page. */
  variant?: "icon" | "button";
  className?: string;
}

export function WishlistButton({ product, variant = "icon", className }: WishlistButtonProps) {
  const { toggleWishlist, inWishlist, hydrated } = useCart();
  const active = hydrated && inWishlist(product.id);

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        className={cn(
          "relative mb-2.5 inline-block bg-lien-blue px-3 py-1.5 font-sans text-[14px] leading-[21px] text-white transition-all duration-300 hover:bg-lien-blue-hover",
          className,
        )}
      >
        <Fa name={active ? "heart" : "heart-o"} className="mr-1 text-[14px] leading-[14px]" />
        <span>{active ? "Đã thêm vào wishlist" : "Add to wishlist"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(product)}
      aria-pressed={active}
      aria-label={active ? "Bỏ khỏi wishlist" : "Add to wishlist"}
      title={active ? "Bỏ khỏi wishlist" : "Add to wishlist"}
      className={cn("relative inline-block pt-0.5 pr-0.5 text-lien-blue transition-all duration-300 hover:text-lien-heart", className)}
    >
      <Fa name={active ? "heart" : "heart-o"} className="text-[18px] leading-[18px]" />
    </button>
  );
}
