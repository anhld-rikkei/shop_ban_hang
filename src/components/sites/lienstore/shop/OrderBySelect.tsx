"use client";

import { useRouter } from "next/navigation";
import type { ProductOrderBy } from "@/types/shop";

export const ORDER_OPTIONS: { value: ProductOrderBy; label: string }[] = [
  { value: "popularity", label: "Thứ tự theo mức độ phổ biến" },
  { value: "rating", label: "Thứ tự theo điểm đánh giá" },
  { value: "date", label: "Mới nhất" },
  { value: "price", label: "Thứ tự theo giá: thấp đến cao" },
  { value: "price-desc", label: "Thứ tự theo giá: cao xuống thấp" },
];

interface OrderBySelectProps {
  value: ProductOrderBy;
  /** Path of page 1 of the listing, e.g. "/shop/" or "/product-category/mom-and-baby/". */
  basePath: string;
  /** Extra query params to keep (s, product_cat, tag…). */
  params?: Record<string, string | undefined>;
}

/** `form.woocommerce-ordering` — changing the select navigates to page 1 with `?orderby=`. */
export function OrderBySelect({ value, basePath, params = {} }: OrderBySelectProps) {
  const router = useRouter();
  return (
    <form className="m-0" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="orderby" className="sr-only">
        Đơn hàng của cửa hàng
      </label>
      <select
        id="orderby"
        name="orderby"
        value={value}
        onChange={(e) => {
          const q = new URLSearchParams();
          for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
          if (e.target.value !== "popularity") q.set("orderby", e.target.value);
          const qs = q.toString();
          router.push(qs ? `${basePath}?${qs}` : basePath);
        }}
        className="inline-block h-9 w-[220px] max-w-full rounded-full border border-lien-line bg-white pl-3 pr-8 text-[13px] text-lien-text outline-none focus:border-lien-blue"
      >
        {ORDER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
