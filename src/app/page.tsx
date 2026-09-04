import { CategoryGrid } from "@/components/sites/lienstore/root-8a5edab2/CategoryGrid";
import { HeroSlider } from "@/components/sites/lienstore/root-8a5edab2/HeroSlider";
import { ProductGrid } from "@/components/sites/lienstore/root-8a5edab2/ProductGrid";
import { SectionHeading } from "@/components/sites/lienstore/root-8a5edab2/SectionHeading";
import { addToCartLabel, categoryGridTitle, sliderAssets, slides } from "@/components/sites/lienstore/root-8a5edab2/data";
import { StoreSidebar } from "@/components/sites/lienstore/shop/cart/StoreSidebar";
import { SiteChrome, TwoColumnShell } from "@/components/sites/lienstore/shop/SiteChrome";
import { getAllProducts, getCategories, queryProducts } from "@/lib/db";
import { formatAmount } from "@/lib/format";
import type { CategoryCard, Product } from "@/types/lienstore";
import type { CatalogProduct } from "@/types/shop";

export const dynamic = "force-dynamic";

/** Home-page product blocks (WooCommerce "Newest products" / "Products by category" blocks on the original). */
const SECTIONS = [
  { key: "new", title: "SẢN PHẨM MỚI NHẬP", href: "/shop/", perPage: 12, category: undefined as string | undefined },
  { key: "functional", title: "THỰC PHẨM CHỨC NĂNG", href: "/product-category/thuc-pham-chuc-nang-functional-foods/", perPage: 12, category: "thuc-pham-chuc-nang-functional-foods" },
  { key: "momBaby", title: "Mom And Baby", href: "/product-category/mom-and-baby/", perPage: 6, category: "mom-and-baby" },
];

function toHomeProduct(p: CatalogProduct): Product {
  return {
    title: p.name,
    price: formatAmount(p.price),
    currency: p.currency,
    href: `/product/${p.slug}/`,
    image: p.thumb || p.images[0] || "",
    addToCartHref: `?add-to-cart=${p.id}`,
  };
}

// Clone of https://linconnn.io.vn/ (home). Site key lienstore, page key root-8a5edab2.
export default async function Home() {
  const [categories, all] = await Promise.all([getCategories(), getAllProducts()]);
  const cards: CategoryCard[] = categories.map((c) => ({
    name: c.name,
    count: c.count,
    href: `/product-category/${c.slug}/`,
    image: c.image ?? all.find((p) => p.categories.includes(c.slug))?.thumb ?? "/sites/lienstore/brand/icon-192.png",
    alt: c.name,
  }));
  const sections = await Promise.all(
    SECTIONS.map(async (s) => {
      if (s.category && !categories.some((c) => c.slug === s.category)) return null;
      const r = await queryProducts({ category: s.category, orderby: s.category ? "popularity" : "date", perPage: s.perPage });
      return r.items.length ? { ...s, products: r.items.map(toHomeProduct) } : null;
    }),
  );

  return (
    <SiteChrome>
      <TwoColumnShell sidebar={<StoreSidebar />}>
        <article className="entry-content">
          <HeroSlider slides={slides} arrowSprite={sliderAssets.directionNav} />

          <CategoryGrid title={categoryGridTitle} categories={cards} />

          {sections.map((section) =>
            section ? (
              <section key={section.key} aria-label={section.title}>
                <SectionHeading title={section.title} href={section.href} />
                <ProductGrid products={section.products} addToCartLabel={addToCartLabel} />
              </section>
            ) : null,
          )}
        </article>
      </TwoColumnShell>
    </SiteChrome>
  );
}
