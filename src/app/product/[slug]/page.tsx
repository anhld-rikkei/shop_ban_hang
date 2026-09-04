import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, type Crumb } from "@/components/sites/lienstore/shop/Breadcrumb";
import { ProductGallery } from "@/components/sites/lienstore/shop/product/ProductGallery";
import { ProductMeta } from "@/components/sites/lienstore/shop/product/ProductMeta";
import { ProductPageNotice } from "@/components/sites/lienstore/shop/product/ProductPageNotice";
import { ProductShare } from "@/components/sites/lienstore/shop/product/ProductShare";
import { ProductSummary } from "@/components/sites/lienstore/shop/product/ProductSummary";
import { ProductTabs } from "@/components/sites/lienstore/shop/product/ProductTabs";
import { StickyAddToCart } from "@/components/sites/lienstore/shop/product/StickyAddToCart";
import { ShopProductGrid, toCartProduct } from "@/components/sites/lienstore/shop/ShopProductCard";
import { FullWidthShell, SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";
import { getCategories, getProductBySlug, getRelatedProducts } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/\s+/g, " ")
    .trim();
}

function metaDescription(shortDescription: string, description: string): string {
  const short = stripHtml(shortDescription);
  if (short) return short;
  const long = stripHtml(description);
  return long.length > 160 ? `${long.slice(0, 160).trimEnd()}…` : long;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm – LienStore" };
  return {
    title: `${product.name} – LienStore`,
    description: metaDescription(product.shortDescription, product.description),
    openGraph: {
      title: product.name,
      description: metaDescription(product.shortDescription, product.description),
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

// Clone of https://linconnn.io.vn/product/<slug>/ (WooCommerce single product page).
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [categories, related] = await Promise.all([getCategories(), getRelatedProducts(product, 4)]);
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const firstCategory = product.categories[0];

  const crumbs: Crumb[] = [];
  if (firstCategory) {
    crumbs.push({ label: categoryNames[firstCategory] ?? firstCategory, href: `/product-category/${firstCategory}/` });
  }
  crumbs.push({ label: product.name });

  return (
    <SiteChrome>
      <FullWidthShell>
        <Breadcrumb items={crumbs} />
        <ProductPageNotice product={toCartProduct(product)} />
        <div id={`product-${product.id}`} className="product type-product flow-root">
          <ProductGallery images={product.images.length ? product.images : [product.thumb]} alt={product.name} />
          <ProductSummary product={product} compareCategory={firstCategory}>
            <ProductMeta product={product} categoryNames={categoryNames} />
            <ProductShare name={product.name} slug={product.slug} />
          </ProductSummary>
        </div>
        <StickyAddToCart product={product} />
        <ProductTabs name={product.name} description={product.description} reviewCount={product.reviewCount} />
        {related.length > 0 ? (
          <section className="related products" aria-labelledby="related-heading">
            <h2 id="related-heading" className="my-[21.58px] font-oswald text-[26px] font-light leading-[36.4px] text-lien-heading">
              Sản phẩm tương tự
            </h2>
            <ShopProductGrid products={related} />
          </section>
        ) : null}
      </FullWidthShell>
    </SiteChrome>
  );
}
