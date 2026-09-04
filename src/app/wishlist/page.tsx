import type { Metadata } from "next";
import { Breadcrumb } from "@/components/sites/lienstore/shop/Breadcrumb";
import { WishlistPage } from "@/components/sites/lienstore/shop/cart/WishlistPage";
import { FullWidthShell, SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";

export const metadata: Metadata = { title: "Wishlist – LienStore" };

export default function Wishlist() {
  return (
    <SiteChrome>
      <FullWidthShell>
        <Breadcrumb items={[{ label: "Wishlist" }]} />
        <h1 className="my-[20.1px] text-center font-oswald text-[30px] font-light leading-[42px] text-lien-heading after:mx-auto after:mt-[15px] after:block after:h-0.5 after:w-[90px] after:bg-lien-blue">
          Danh sách yêu thích
        </h1>
        <WishlistPage />
      </FullWidthShell>
    </SiteChrome>
  );
}
