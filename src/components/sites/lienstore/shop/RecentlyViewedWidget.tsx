"use client";

import Image from "next/image";
import Link from "next/link";
import { formatAmount } from "@/lib/format";
import { useCart } from "./CartProvider";

/** WooCommerce "Sản phẩm vừa được xem" sidebar widget (shown on cart / checkout / account pages). */
export function RecentlyViewedWidget() {
  const { recentlyViewed, hydrated } = useCart();
  if (!hydrated || recentlyViewed.length === 0) return null;

  return (
    <section className="widget woocommerce widget_recently_viewed_products mb-[14px] rounded-b-[3px] bg-white px-[25px] pb-[25px]">
      <h2 className="-mx-[25px] mb-2.5 rounded-t-[8px] border-b-2 border-lien-widget-border px-[15px] py-2.5 font-oswald text-[16px] font-medium uppercase leading-[22.4px] tracking-[2.9088px] text-lien-widget-title">
        Sản phẩm vừa được xem
      </h2>
      <ul className="product_list_widget m-0 list-none p-0">
        {recentlyViewed.slice(0, 5).map((p) => (
          <li key={p.id} className="flex items-start gap-3 border-b border-lien-line py-3 last:border-0">
            <Link href={`/product/${p.slug}/`} className="shrink-0">
              <Image src={p.image} alt="" width={300} height={300} className="block h-[54px] w-[54px]" />
            </Link>
            <div className="min-w-0 text-[14px] leading-[22.4px]">
              <Link href={`/product/${p.slug}/`} className="product-title block font-bold text-lien-text hover:text-lien-blue">
                {p.name}
              </Link>
              <span className="woocommerce-Price-amount amount text-lien-text">
                {formatAmount(p.price)}
                <span>VNĐ</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
