"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Fa } from "@/components/sites/lienstore/shared/icons";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/shop";
import { AddToCartButton } from "../AddToCartButton";
import { toCartProduct } from "../ShopProductCard";

const FONT = "[font-family:nunito,var(--font-sans)]";
const COL = "w-full px-[10px] text-center sm:w-1/4";
const DIVIDER = "sm:border-r sm:border-white";

/**
 * The "Sticky Add to Cart" plugin bar: fixed blue strip at the very top of the viewport that slides
 * in once the visitor has scrolled past the product summary. Renders its own sentinel in place, so
 * put it right after `div.product`.
 */
export function StickyAddToCart({ product }: { product: CatalogProduct }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Show only once the sentinel has left through the top edge of the viewport.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const out = product.stockStatus === "outofstock";
  const stickyPrice = `VNĐ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const image = product.thumb || product.images[0] || "";

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-px w-full" />
      <div
        id="sticky-add-to-cart"
        aria-hidden={!visible}
        inert={!visible}
        className={cn(
          "fixed inset-x-0 top-0 z-[100001] bg-lien-blue text-white transition-transform duration-300 ease-in-out",
          visible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className={cn("grid grid-cols-2 items-stretch py-[15px] sm:flex", FONT)}>
          <div className={cn(COL, DIVIDER)}>
            {image ? (
              <Image src={image} alt="" width={58} height={58} className="block h-[58px] w-[58px] rounded-full object-cover" />
            ) : null}
            <p className="m-0 px-8 py-4 text-[16px] leading-6 text-white">{product.name}</p>
          </div>
          <div className={cn(COL, DIVIDER, "flex items-center justify-center")}>
            <span className="inline-block rounded-[32px] bg-[#cd534a] px-2 text-[18px] leading-[27px] text-white">{stickyPrice}</span>
          </div>
          <div className={cn(COL, DIVIDER, "flex items-center justify-center")}>
            <span
              role="img"
              aria-label={product.rating ? `Được xếp hạng ${product.rating} 5 sao` : "Chưa có đánh giá"}
              className="inline-flex gap-px"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Fa key={i} name={product.rating ? "star" : "star-o"} className="text-[18px] leading-[18px] text-[#cd534a]" />
              ))}
            </span>
          </div>
          <div className={cn(COL, "flex items-center justify-center")}>
            <span
              className={cn(
                "inline-flex items-center rounded-[3px] bg-[#cd534a] px-5 py-1.5 text-[18px] leading-[27px] text-white transition-[background] duration-200 hover:bg-[#b8483f]",
                out && "opacity-50",
              )}
            >
              <Fa name="shopping-cart" className="mr-1.5 text-[18px] leading-[18px] text-white" />
              <AddToCartButton
                product={toCartProduct(product)}
                variant="sticky"
                label="Mua Hàng"
                disabled={out}
                className={cn("bg-transparent px-0 py-0 hover:bg-transparent disabled:opacity-100", FONT)}
              />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
