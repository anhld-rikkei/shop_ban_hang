import type { ReactNode } from "react";
import { FacebookChat } from "@/components/sites/lienstore/shop/FacebookChat";
import { FloatingWidgets } from "@/components/sites/lienstore/root-8a5edab2/FloatingWidgets";
import { SiteFooter } from "@/components/sites/lienstore/root-8a5edab2/SiteFooter";
import { SiteHeader } from "@/components/sites/lienstore/root-8a5edab2/SiteHeader";
import {
  branding,
  categoriesMenuLabel,
  contact,
  footerColumns,
  footerCopyright,
  headerAssets,
  mainMenu,
  searchPlaceholder,
} from "@/components/sites/lienstore/root-8a5edab2/data";
import { getCategories } from "@/lib/db";

/**
 * Header + footer + floating widgets shared by every storefront page.
 * Categories (search select + "Product Categories" dropdown) come from the database so
 * changes made in /admin/categories are reflected everywhere.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const categories = await getCategories();
  const searchCategories = [{ label: "All Categories", value: "" }, ...categories.map((c) => ({ label: c.name, value: c.slug }))];
  const dropdown = categories.map((c) => ({ label: c.name, href: `/product-category/${c.slug}/` }));

  return (
    <div id="page" className="relative">
      <SiteHeader
        contact={contact}
        branding={branding}
        searchCategories={searchCategories}
        searchPlaceholder={searchPlaceholder}
        selectArrow={headerAssets.selectArrow}
        categoriesLabel={categoriesMenuLabel}
        categoriesDropdown={dropdown}
        mainMenu={mainMenu}
      />
      {children}
      <SiteFooter columns={footerColumns} contact={contact} copyright={footerCopyright} />
      <FloatingWidgets cartHref="/cart/" wishlistHref="/wishlist/" accountHref="/my-account/" />
      {process.env.NEXT_PUBLIC_FB_PAGE_ID ? <FacebookChat pageId={process.env.NEXT_PUBLIC_FB_PAGE_ID} /> : null}
    </div>
  );
}

/** `#content > .container.background` with a single full-width main column (shop, product, archive pages). */
export function FullWidthShell({ children }: { children: ReactNode }) {
  return (
    <div id="content" className="overflow-x-clip">
      <div className="mx-auto my-5 max-w-[1170px] px-[15px] pt-5">
        <div className="-mx-[15px]">
          <div id="primary" className="relative w-full px-[15px]">
            <main id="main">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Two-column layout (sidebar left, content right) used by the home, cart and checkout pages. */
export function TwoColumnShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div id="content" className="overflow-x-clip">
      <div className="mx-auto my-5 max-w-[1170px] px-[15px] pt-5">
        <div className="-mx-[15px] flex flex-wrap">
          <div className="relative w-full px-[15px] sm:w-1/3">{sidebar}</div>
          <div id="primary" className="relative w-full px-[15px] sm:w-2/3">
            <main id="main">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
