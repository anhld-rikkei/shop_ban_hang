"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCart, type CartProduct } from "./CartProvider";

type Variant = "pill" | "square" | "sticky";

interface AddToCartButtonProps {
  product: CartProduct;
  quantity?: number;
  /** pill = dark rounded button used on the home page grids; square = WooCommerce blue button; sticky = red bar button. */
  variant?: Variant;
  label?: string;
  disabled?: boolean;
  /** Show the "Xem giỏ hàng" link WooCommerce appends after an AJAX add (default true for pill/square). */
  showViewCart?: boolean;
  className?: string;
  linkClassName?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  pill: "inline-flex flex-col items-center justify-center rounded-full border-0 bg-lien-dark px-[26px] py-[14px] font-sans text-[18px] font-normal leading-[20.7px] text-white no-underline hover:text-lien-blue sm:leading-[27px]",
  square:
    "relative inline-block rounded-[3px] border-0 bg-lien-blue px-4 py-[9.888px] font-sans text-[16px] font-bold leading-4 text-white no-underline transition-[background] duration-200 hover:bg-[#2a6bc0]",
  sticky:
    "inline-block rounded-[3px] bg-[#cd534a] px-5 py-1.5 font-sans text-[18px] leading-[27px] text-white no-underline hover:bg-[#b8483f]",
};

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "square",
  label = "Mua hàng",
  disabled = false,
  showViewCart,
  className,
  linkClassName,
}: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const withLink = showViewCart ?? variant !== "sticky";

  const onClick = () => {
    if (disabled || busy) return;
    setBusy(true);
    add(product, quantity);
    // mimic WooCommerce's brief loading state
    window.setTimeout(() => {
      setBusy(false);
      setAdded(true);
    }, 250);
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        aria-live="polite"
        className={cn(VARIANT_CLASS[variant], busy && "opacity-70", disabled && "cursor-not-allowed opacity-50", className)}
      >
        {busy ? "Đang thêm…" : label}
      </button>
      {added && withLink ? (
        <Link
          href="/cart/"
          className={cn(
            "added_to_cart wc-forward mt-2 block text-[14px] leading-5 text-lien-muted hover:text-lien-blue",
            variant === "square" && "mt-2",
            linkClassName,
          )}
        >
          Xem giỏ hàng
        </Link>
      ) : null}
    </>
  );
}
