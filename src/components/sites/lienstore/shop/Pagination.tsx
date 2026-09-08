import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Path of page 1, e.g. "/shop/". Page n becomes `${basePath}page/${n}/`. */
  basePath: string;
  query?: string;
  className?: string;
}

function hrefFor(basePath: string, n: number, query?: string) {
  const path = n <= 1 ? basePath : `${basePath}page/${n}/`;
  return query ? `${path}?${query}` : path;
}

/** `nav.woocommerce-pagination`: bordered inline list, current page grey. */
export function Pagination({ page, totalPages, basePath, query, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const cell = "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[13px] font-medium leading-4";
  return (
    <nav aria-label="Phân trang" className={cn("text-center", className)}>
      <ul className="m-0 inline-flex list-none flex-wrap gap-1.5 p-0 text-lien-text">
        {page > 1 ? (
          <li className="">
            <Link href={hrefFor(basePath, page - 1, query)} className={cn(cell, "text-lien-muted border border-lien-line hover:border-lien-blue hover:text-lien-blue")} aria-label="Trang trước">
              ←
            </Link>
          </li>
        ) : null}
        {pages.map((n) => (
          <li key={n} className="">
            {n === page ? (
              <span aria-current="page" className={cn(cell, "bg-lien-blue text-white")}>
                {n}
              </span>
            ) : (
              <Link href={hrefFor(basePath, n, query)} className={cn(cell, "text-lien-muted border border-lien-line hover:border-lien-blue hover:text-lien-blue")}>
                {n}
              </Link>
            )}
          </li>
        ))}
        {page < totalPages ? (
          <li className="">
            <Link href={hrefFor(basePath, page + 1, query)} className={cn(cell, "text-lien-muted border border-lien-line hover:border-lien-blue hover:text-lien-blue")} aria-label="Trang sau">
              →
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
