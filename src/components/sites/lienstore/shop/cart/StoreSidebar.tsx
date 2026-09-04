import { Sidebar } from "@/components/sites/lienstore/root-8a5edab2/Sidebar";
import { priceFilter, sidebarTitle } from "@/components/sites/lienstore/root-8a5edab2/data";
import { RecentlyViewedWidget } from "@/components/sites/lienstore/shop/RecentlyViewedWidget";
import { getCategories } from "@/lib/db";

/** The store sidebar (category list from the database + price filter + recently viewed). */
export async function StoreSidebar() {
  const categories = await getCategories();
  const items = categories.map((c) => ({ name: c.name, count: c.count, href: `/product-category/${c.slug}/` }));
  return (
    <>
      <Sidebar title={sidebarTitle} categories={items} priceFilter={priceFilter} />
      <RecentlyViewedWidget />
    </>
  );
}
