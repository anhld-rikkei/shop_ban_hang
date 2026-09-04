import Link from "next/link";
import type { SidebarCategory } from "@/types/lienstore";
import { cn } from "@/lib/utils";
import { PriceFilterWidget } from "./PriceFilterWidget";

export interface CategoryWidgetProps {
  title: string;
  categories: SidebarCategory[];
  className?: string;
}

export interface SidebarProps {
  title: string;
  categories: SidebarCategory[];
  priceFilter: {
    title: string;
    min: number;
    max: number;
    currency: string;
  };
  className?: string;
}

const widgetClass = "rounded-b-[3px] bg-white px-[25px] pb-[25px]";

/** "Danh mục sản phẩm" product-category list widget. */
export function CategoryWidget({ title, categories, className }: CategoryWidgetProps) {
  return (
    <section className={cn("widget_product_categories", widgetClass, className)}>
      <h2 className="-mx-[25px] mb-[10px] block rounded-t-[8px] border-b-2 border-solid border-lien-widget-border px-[15px] py-[10px] text-left font-oswald text-[16px] font-medium uppercase leading-[22.4px] tracking-[2.9088px] text-lien-widget-title">
        {title}
      </h2>
      <ul className="product-categories m-0 list-none p-0">
        {categories.map((category) => (
          <li
            key={category.href}
            className="block py-[7px] text-[14px] leading-[22.4px] not-first:-mt-px"
          >
            <Link
              href={category.href}
              className="inline font-sans text-[14px] font-normal leading-[22.4px] text-lien-muted no-underline transition-none hover:text-lien-blue"
            >
              {category.name}
            </Link>{" "}
            <span className="count inline text-lien-text">({category.count})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Left column of the home page: category list plus price filter. */
export function Sidebar({ title, categories, priceFilter, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-full pb-[28px] font-sans text-[14px] leading-[22.4px] text-lien-text",
        className,
      )}
    >
      <CategoryWidget title={title} categories={categories} className="mb-[14px]" />
      <section className={cn("widget_block", widgetClass)}>
        <PriceFilterWidget
          title={priceFilter.title}
          min={priceFilter.min}
          max={priceFilter.max}
          currency={priceFilter.currency}
        />
      </section>
    </aside>
  );
}
