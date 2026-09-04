import type { ProductOrderBy, ProductQueryResult } from "@/types/shop";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import { OrderBySelect } from "./OrderBySelect";
import { Pagination } from "./Pagination";
import { ShopProductGrid } from "./ShopProductCard";

interface ProductListingProps {
  crumbs: Crumb[];
  /** Optional centred page title (category archives show one; /shop does not). */
  title?: string;
  description?: string;
  result: ProductQueryResult;
  orderby: ProductOrderBy;
  /** Path of page 1 of this listing, with trailing slash. */
  basePath: string;
  /** Query params to preserve in pagination / ordering links. */
  params?: Record<string, string | undefined>;
  emptyMessage?: string;
}

export function resultCountText(r: ProductQueryResult): string {
  if (r.total === 0) return "Không tìm thấy sản phẩm nào phù hợp với lựa chọn của bạn.";
  if (r.total === 1) return "Showing the single result";
  if (r.total <= r.perPage) return `Showing all ${r.total} results`;
  const first = (r.page - 1) * r.perPage + 1;
  const last = Math.min(r.total, r.page * r.perPage);
  return `Showing ${first}–${last} of ${r.total} results`;
}

/** WooCommerce archive: breadcrumb, optional h1, result count + ordering, 4-column grid, pagination. */
export function ProductListing({ crumbs, title, description, result, orderby, basePath, params = {}, emptyMessage }: ProductListingProps) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  if (orderby !== "popularity") q.set("orderby", orderby);
  const query = q.toString();

  return (
    <>
      <Breadcrumb items={crumbs} />
      {title ? (
        <h1 className="my-[20.1px] text-center font-oswald text-[30px] font-light leading-[42px] text-lien-heading after:mx-auto after:mt-[15px] after:block after:h-0.5 after:w-[90px] after:bg-lien-blue">
          {title}
        </h1>
      ) : null}
      {description ? <div className="mb-4 text-center text-lien-muted" dangerouslySetInnerHTML={{ __html: description }} /> : null}
      {result.total > 0 ? (
        <>
          <div className="flow-root">
            <p className="float-left mb-8 w-[570px] max-w-full p-[17px] text-[16px] leading-6">{resultCountText(result)}</p>
            <OrderBySelect value={orderby} basePath={basePath} params={params} />
          </div>
          <ShopProductGrid products={result.items} />
          <Pagination page={result.page} totalPages={result.totalPages} basePath={basePath} query={query} className="mt-4 mb-4" />
        </>
      ) : (
        <p className="relative mb-8 border-t-[3px] border-[#1e85be] bg-[#f7f6f7] px-8 py-4 pl-14 text-[#515151]">
          {emptyMessage ?? resultCountText(result)}
        </p>
      )}
    </>
  );
}
