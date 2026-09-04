"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/sites/lienstore/shop/AddToCartButton";
import { useCart } from "@/components/sites/lienstore/shop/CartProvider";
import { cn } from "@/lib/utils";
import { Price, shopTableClass, shopTdClass, shopTdResponsiveClass, shopThClass, WooNotice, wooButtonClass } from "./WooUi";

/** YITH-style wishlist table (`/wishlist/`). */
export function WishlistPage() {
  const { wishlist, hydrated, removeFromWishlist } = useCart();

  if (!hydrated) return <div className="min-h-[200px]" aria-busy="true" />;

  if (wishlist.length === 0) {
    return (
      <div className="woocommerce">
        <WooNotice kind="info">Chưa có sản phẩm nào trong danh sách yêu thích.</WooNotice>
        <p>
          <Link href="/shop/" className={wooButtonClass}>
            Quay trở lại cửa hàng
          </Link>
        </p>
      </div>
    );
  }

  return (
    <table className={cn(shopTableClass, "wishlist_table shop_table_responsive")}>
      <thead className="hidden sm:table-header-group">
        <tr>
          <th className={cn(shopThClass, "w-12")} scope="col">
            <span className="sr-only">Xoá</span>
          </th>
          <th className={cn(shopThClass, "w-[104px]")} scope="col">
            <span className="sr-only">Ảnh</span>
          </th>
          <th className={shopThClass} scope="col">
            Tên sản phẩm
          </th>
          <th className={shopThClass} scope="col">
            Đơn giá
          </th>
          <th className={shopThClass} scope="col">
            Tình trạng
          </th>
          <th className={shopThClass} scope="col">
            <span className="sr-only">Thêm vào giỏ</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {wishlist.map((p) => (
          <tr key={p.id} className="block border-b border-lien-line sm:table-row">
            <td className={cn(shopTdClass, "block text-right sm:table-cell sm:text-left")}>
              <button
                type="button"
                onClick={() => removeFromWishlist(p.id)}
                aria-label={`Xoá ${p.name} khỏi wishlist`}
                className="ml-auto block h-6 w-6 rounded-full text-center text-[24px] font-bold leading-6 text-[#ff0000] hover:bg-[#ff0000] hover:text-white sm:ml-0"
              >
                ×
              </button>
            </td>
            <td className={cn(shopTdClass, "hidden sm:table-cell")}>
              <Link href={`/product/${p.slug}/`}>
                <Image src={p.image} alt="" width={300} height={300} className="block h-20 w-20" />
              </Link>
            </td>
            <td className={cn(shopTdClass, shopTdResponsiveClass)} data-title="Tên sản phẩm">
              <Link href={`/product/${p.slug}/`} className="text-lien-muted no-underline hover:text-lien-blue">
                {p.name}
              </Link>
            </td>
            <td className={cn(shopTdClass, shopTdResponsiveClass)} data-title="Đơn giá">
              <Price value={p.price} />
            </td>
            <td className={cn(shopTdClass, shopTdResponsiveClass, "text-[#77a464]")} data-title="Tình trạng">
              Còn hàng
            </td>
            <td className={cn(shopTdClass, "block text-right sm:table-cell")}>
              <AddToCartButton product={p} variant="square" showViewCart={false} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
