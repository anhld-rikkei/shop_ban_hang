import type { Metadata } from "next";
import { WishlistPage } from "@/components/sites/lienstore/shop/cart/WishlistPage";
import { PageBand } from "@/components/sites/lienstore/ui2/HomeBlocks";
import { FullWidthShell, SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";

export const metadata: Metadata = { title: "Wishlist – LienStore" };

export default function Wishlist() {
  return (
    <SiteChrome>
      <PageBand title="Danh sách yêu thích" crumbs={[{ label: "Danh sách yêu thích" }]} />
      <FullWidthShell>
        <WishlistPage />
      </FullWidthShell>
    </SiteChrome>
  );
}
