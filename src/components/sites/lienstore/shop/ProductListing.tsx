import Link from "next/link";
import { Fa } from "@/components/sites/lienstore/shared/icons";
import { PageBand } from "@/components/sites/lienstore/ui2/HomeBlocks";
import { getCategories } from "@/lib/db";
import type { ProductOrderBy, ProductQueryResult } from "@/types/shop";
import type { Crumb } from "./Breadcrumb";
import { OrderBySelect } from "./OrderBySelect";
import { Pagination } from "./Pagination";
import { RecentlyViewedWidget } from "./RecentlyViewedWidget";
import { ShopProductGrid } from "./ShopProductCard";

interface ProductListingProps {
  crumbs: Crumb[];
  title?: string;
  description?: string;
  result: ProductQueryResult;
  orderby: ProductOrderBy;
  /** Path of page 1 of this listing, with trailing slash. */
  basePath: string;
  /** Query params to preserve in pagination / ordering links. */
  params?: Record<string, string | undefined>;
  emptyMessage?: string;
  /** Slug of the active category (highlighted in the sidebar). */
  activeCategory?: string;
}

export function resultCountText(r: ProductQueryResult): string {
  if (r.total === 0) return "Không tìm thấy sản phẩm nào phù hợp với lựa chọn của bạn.";
  if (r.total === 1) return "Hiển thị 1 sản phẩm";
  if (r.total <= r.perPage) return `Hiển thị tất cả ${r.total} sản phẩm`;
  const first = (r.page - 1) * r.perPage + 1;
  const last = Math.min(r.total, r.page * r.perPage);
  return `Hiển thị ${first}–${last} trong ${r.total} sản phẩm`;
}

/** Category archive / shop / search results: title band, left category sidebar, toolbar, product grid, pagination. */
export async function ProductListing({ crumbs, title, description, result, orderby, basePath, params = {}, emptyMessage, activeCategory }: ProductListingProps) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  if (orderby !== "popularity") q.set("orderby", orderby);
  const query = q.toString();
  const categories = await getCategories();
  const heading = title ?? crumbs[crumbs.length - 1]?.label ?? "Sản phẩm";

  return (
    <>
      <PageBand title={heading} crumbs={crumbs} description={description} />
      <div className="mx-auto max-w-[1300px] px-4 py-6 lg:flex lg:gap-6">
        <aside className="hidden w-[260px] shrink-0 lg:block">
          <div className="rounded-md border border-lien-line bg-white p-4">
            <h2 className="m-0 mb-3 border-b-2 border-lien-blue pb-2 text-[14px] font-bold uppercase tracking-[0.3px] text-lien-heading">Danh mục sản phẩm</h2>
            <ul className="m-0 list-none p-0">
              <li>
                <Link href="/shop/" className={"flex items-center justify-between py-1.5 text-[13px] no-underline hover:text-lien-blue " + (!activeCategory && basePath === "/shop/" ? "font-semibold text-lien-blue" : "text-lien-text")}>
                  <span>
                    <Fa name="plus" className="mr-1.5 text-[9px] text-lien-blue" />
                    Tất cả sản phẩm
                  </span>
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/product-category/${c.slug}/`} className={"flex items-center justify-between gap-2 py-1.5 text-[13px] no-underline hover:text-lien-blue " + (activeCategory === c.slug ? "font-semibold text-lien-blue" : "text-lien-text")}>
                    <span className="min-w-0 truncate">
                      <Fa name="plus" className="mr-1.5 text-[9px] text-lien-blue" />
                      {c.name}
                    </span>
                    <span className="text-[12px] text-lien-muted">({c.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <RecentlyViewedWidget className="mt-4 rounded-md border border-lien-line bg-white p-4" />
        </aside>

        <main id="main" className="min-w-0 flex-1">
          {result.total > 0 ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-lien-line bg-lien-footer2 px-4 py-2 text-[13px] text-lien-muted">
                <span>{resultCountText(result)}</span>
                <OrderBySelect value={orderby} basePath={basePath} params={params} />
              </div>
              <ShopProductGrid products={result.items} cols={4} />
              <Pagination page={result.page} totalPages={result.totalPages} basePath={basePath} query={query} className="mt-6 mb-2" />
            </>
          ) : (
            <p className="rounded-md border border-lien-line bg-lien-footer2 px-5 py-4 text-[14px] text-lien-text">
              <Fa name="info-circle" className="mr-2 text-lien-blue" />
              {emptyMessage ?? resultCountText(result)}
            </p>
          )}
        </main>
      </div>
    </>
  );
}
