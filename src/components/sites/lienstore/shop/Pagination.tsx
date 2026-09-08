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
  const cell = "block px-2 py-2 text-[16px] leading-4";
  return (
    <nav aria-label="Phân trang" className={cn("text-center", className)}>
      <ul className="m-px inline-flex list-none border-y border-l border-[#d3ced2] p-0 text-lien-text">
        {page > 1 ? (
          <li className="border-r border-[#d3ced2]">
            <Link href={hrefFor(basePath, page - 1, query)} className={cn(cell, "text-lien-muted hover:bg-lien-blue-soft hover:text-[#8a7e88]")} aria-label="Trang trước">
              ←
            </Link>
          </li>
        ) : null}
        {pages.map((n) => (
          <li key={n} className="border-r border-[#d3ced2]">
            {n === page ? (
              <span aria-current="page" className={cn(cell, "bg-lien-blue-soft text-[#8a7e88]")}>
                {n}
              </span>
            ) : (
              <Link href={hrefFor(basePath, n, query)} className={cn(cell, "text-lien-muted hover:bg-lien-blue-soft hover:text-[#8a7e88]")}>
                {n}
              </Link>
            )}
          </li>
        ))}
        {page < totalPages ? (
          <li className="border-r border-[#d3ced2]">
            <Link href={hrefFor(basePath, page + 1, query)} className={cn(cell, "text-lien-muted hover:bg-lien-blue-soft hover:text-[#8a7e88]")} aria-label="Trang sau">
              →
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
