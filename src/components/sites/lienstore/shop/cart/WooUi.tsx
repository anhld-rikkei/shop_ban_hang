import type { ReactNode } from "react";
import { Fa, type FaName } from "@/components/sites/lienstore/shared/icons";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

/*
 * WooCommerce primitives shared by the cart / checkout / wishlist / account pages.
 * Values measured on linconnn.io.vn at 1440px (content column 750px).
 */

/** `.button` — blue WooCommerce button (9.888px 16px, 16px bold, radius 3px). */
export const wooButtonClass =
  "inline-block cursor-pointer rounded-[3px] border-0 bg-lien-blue px-4 py-[9.888px] text-center font-sans text-[16px] font-bold leading-4 text-white no-underline transition-[background] duration-200 hover:bg-lien-blue-hover hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-lien-blue";

/** `.input-text` — 42.375px tall text input, Arial 16px, #d7d7d7 border. */
export const wooInputClass =
  "box-border h-[42.375px] w-full rounded-[3px] border border-solid border-lien-input-border bg-white p-[11.2px] font-arial text-[16px] leading-[18px] text-lien-input-text outline-none placeholder:text-[#8a8a8a] focus:border-lien-blue";

/** `table.shop_table` */
export const shopTableClass =
  "shop_table mb-6 w-full border-separate border-spacing-0 rounded-[5px] border border-solid border-black/10 text-left text-[16px] text-lien-text";
export const shopThClass = "border-b-2 border-solid border-[#bbbbbb] px-3 py-[9px] align-middle font-bold leading-6";
export const shopTdClass = "border-t border-solid border-black/10 px-3 py-[9px] align-middle leading-6";
/** Extra classes for a `shop_table_responsive` cell: stacks on mobile with its `data-title` label on the left. */
export const shopTdResponsiveClass =
  "block text-right before:float-left before:font-bold before:content-[attr(data-title)] sm:table-cell sm:text-left sm:before:hidden";

type NoticeKind = "message" | "info" | "error";

const NOTICE: Record<NoticeKind, { border: string; icon: FaName; iconColor: string }> = {
  message: { border: "border-t-[#8fae1b]", icon: "check-circle", iconColor: "text-[#8fae1b]" },
  info: { border: "border-t-[#1e85be]", icon: "info-circle", iconColor: "text-[#1e85be]" },
  error: { border: "border-t-[#b81c23]", icon: "exclamation-circle", iconColor: "text-[#b81c23]" },
};

interface WooNoticeProps {
  kind?: NoticeKind;
  children: ReactNode;
  /** Right-floated button inside the notice (e.g. "Xem giỏ hàng"). */
  action?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}

/** `.woocommerce-message` / `.woocommerce-info` / `.woocommerce-error` */
export function WooNotice({ kind = "info", children, action, className, role }: WooNoticeProps) {
  const spec = NOTICE[kind];
  return (
    <div
      role={role ?? (kind === "error" ? "alert" : undefined)}
      className={cn(
        "relative mb-8 block border-t-[3px] border-solid bg-[#f7f6f7] py-4 pr-8 pl-14 font-sans text-[16px] leading-6 text-[#515151] after:clear-both after:table after:content-['']",
        spec.border,
        className,
      )}
    >
      <Fa name={spec.icon} className={cn("absolute top-[20px] left-6 text-[16px]", spec.iconColor)} />
      {action ? <div className="float-right ml-4 mb-0">{action}</div> : null}
      {children}
    </div>
  );
}

/** `.woocommerce-Price-amount` — "890.000VNĐ" with the currency in a nested span. */
export function Price({ value, currency = "VNĐ", className }: { value: number; currency?: string; className?: string }) {
  return (
    <span className={cn("woocommerce-Price-amount amount whitespace-nowrap", className)}>
      <bdi>
        {formatAmount(value)}
        <span className="woocommerce-Price-currencySymbol">{currency}</span>
      </bdi>
    </span>
  );
}

/** Oswald section heading: h2 = 26px/36.4px, h3 = 22px/30.8px, weight 300, #0d0f1a. */
export function WooHeading({ as = "h2", children, className }: { as?: "h2" | "h3"; children: ReactNode; className?: string }) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "font-oswald font-light text-lien-heading",
        as === "h2" ? "my-[21.58px] text-[26px] leading-[36.4px]" : "my-[22px] text-[22px] leading-[30.8px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** `<abbr class="required">*</abbr>` */
export function Required() {
  return (
    <abbr className="required border-0 font-bold text-[#ff0000] no-underline" title="bắt buộc">
      *
    </abbr>
  );
}
