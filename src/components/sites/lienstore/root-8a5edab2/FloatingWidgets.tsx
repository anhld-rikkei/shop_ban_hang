"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fa } from "@/components/sites/lienstore/shared/icons";
import { cn } from "@/lib/utils";
import { CartBadge } from "@/components/sites/lienstore/shop/CartBadge";

interface FloatingWidgetsProps {
  cartHref: string;
  wishlistHref: string;
  accountHref: string;
  /** Scroll offset (px) after which both widgets appear. */
  threshold?: number;
  className?: string;
}

/**
 * The two fixed elements the original theme shows once the page is scrolled:
 * `#scroll-cart.topcorner` (cart / wishlist / account tiles at the right edge)
 * and `#scroll-btn.scroll-top` (blue 40×40 back-to-top button).
 */
export function FloatingWidgets({
  cartHref,
  wishlistHref,
  accountHref,
  threshold = 100,
  className,
}: FloatingWidgetsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const tile =
    "mt-[5px] block rounded-[3px] bg-white px-[5px] py-3 text-center shadow-[-1px_3px_5px_0_#d4d4d4]";

  return (
    <div className={cn(visible ? "block" : "hidden", className)}>
      <div
        id="scroll-cart"
        className="fixed top-[60%] -right-0.5 z-[99999] w-[36.25px] text-center text-[16px] leading-[18.4px] sm:leading-6"
      >
        <ul className="m-0 list-none p-0">
          <li className={cn(tile, "text-[15px] leading-[17.25px] text-black sm:leading-6")}>
            <Link href={cartHref} title="Cart View" className="relative inline-block text-black">
              <Fa name="shopping-bag" className="text-[16px] leading-4 text-lien-input-text" />
              <CartBadge className="absolute -top-[7px] right-px block min-w-[14.5px] rounded-[24px] bg-lien-blue-ring px-1 py-0.5 text-center font-sans text-[13px] leading-[13px] text-white" />
            </Link>
          </li>
          <li className={cn(tile, "text-[15px] leading-[17.25px] text-black sm:leading-6")}>
            <Link href={wishlistHref} title="View your whishlist" className="inline-block text-black">
              <Fa name="heart" className="text-[16px] leading-4 text-lien-heart" />
            </Link>
          </li>
          <li className={cn(tile, "text-[16px] leading-[18.4px] text-lien-text sm:leading-6")}>
            <Link href={accountHref} aria-label="My account" className="inline-block text-[21px] leading-[24.15px] text-black">
              <Fa name="user-circle" className="text-[21px] leading-[21px]" />
            </Link>
          </li>
        </ul>
      </div>

      <a
        id="scroll-btn"
        href="#page"
        aria-label="Lên đầu trang"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="fixed right-2.5 bottom-2.5 z-[9999] block h-10 w-10 rounded-[4px] bg-lien-blue text-center text-white"
      >
        <Fa name="arrow-up" className="inline-block text-[22px] leading-10" />
      </a>
    </div>
  );
}
