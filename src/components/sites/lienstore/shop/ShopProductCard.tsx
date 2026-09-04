import Image from "next/image";
import Link from "next/link";
import { Fa } from "@/components/sites/lienstore/shared/icons";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/shop";
import { AddToCartButton } from "./AddToCartButton";
import { QuickViewButton, type QuickViewProduct } from "./QuickView";
import { StarRating } from "./StarRating";
import { WishlistButton } from "./WishlistButton";

export function productHref(p: Pick<CatalogProduct, "slug">): string {
  return `/product/${p.slug}/`;
}

export function toCartProduct(p: CatalogProduct) {
  return { id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.thumb || p.images[0] || "" };
}

function excerptOf(p: CatalogProduct): string {
  const text = (p.shortDescription || p.description)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 220 ? `${text.slice(0, 220).trimEnd()}…` : text;
}

function toQuickView(p: CatalogProduct): QuickViewProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    regularPrice: p.regularPrice,
    currency: p.currency,
    image: p.images[0] || p.thumb,
    thumb: p.thumb || p.images[0] || "",
    stock: p.stock,
    stockStatus: p.stockStatus,
    excerpt: excerptOf(p),
    categories: p.categories,
  };
}

/**
 * WooCommerce archive card (`ul.products li.product`) as used on /shop, category pages and
 * the "Sản phẩm tương tự" block: white card with soft shadow, 300×300 thumbnail, light title,
 * small grey price and the blue square "Mua hàng" button. Renders an `<li>`.
 */
export function ShopProductCard({ product, className }: { product: CatalogProduct; className?: string }) {
  const out = product.stockStatus === "outofstock";
  return (
    <li className={cn("group relative bg-white pb-[15px] text-center shadow-[0_2px_18px_-4px_#cfcfcf]", className)}>
      <Link href={productHref(product)} className="block text-lien-muted no-underline">
        <Image
          src={product.thumb || product.images[0]}
          alt={product.name}
          width={300}
          height={300}
          className="mb-4 block h-auto w-full"
        />
        <h2 className="px-1 py-2 font-sans text-[16px] font-light leading-[22.4px] text-lien-heading">{product.name}</h2>
        {product.rating ? (
          <span className="mb-[6.856px] block">
            <StarRating rating={product.rating} />
          </span>
        ) : null}
        <span className="mb-[6.856px] block text-[13.712px] leading-[20.568px] text-[#4a4a4a]">
          {product.regularPrice && product.regularPrice > product.price ? (
            <del className="mr-1 opacity-70">
              {formatAmount(product.regularPrice)}
              <span>{product.currency}</span>
            </del>
          ) : null}
          <span>
            {formatAmount(product.price)}
            <span>{product.currency}</span>
          </span>
        </span>
      </Link>
      <div className="mt-4">
        <AddToCartButton product={toCartProduct(product)} variant="square" disabled={out} label={out ? "Hết hàng" : "Mua hàng"} />
      </div>
      <QuickViewButton product={toQuickView(product)} />
      <div className="absolute top-[15px] left-2.5 flex flex-col items-start pt-0.5 pr-1.5 pb-[3px] pl-0.5">
        <WishlistButton product={toCartProduct(product)} />
        <Link
          href={productHref(product)}
          aria-label={`Xem ${product.name}`}
          className="mt-[3px] ml-px inline-block pt-[3px] text-lien-blue hover:text-lien-heart"
        >
          <Fa name="refresh" className="text-[14px] leading-[14px]" />
        </Link>
      </div>
    </li>
  );
}

/** `ul.products.columns-4`: 4 cards of 251px with 43.3px gutters at 1140px; 2 columns below 992px. */
export function ShopProductGrid({ products, className }: { products: CatalogProduct[]; className?: string }) {
  return (
    <ul className={cn("mb-4 grid list-none grid-cols-2 items-start gap-x-[3.8%] gap-y-[47.87px] p-0 md:grid-cols-4 md:gap-x-[43.3px]", className)}>
      {products.map((p) => (
        <ShopProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}
