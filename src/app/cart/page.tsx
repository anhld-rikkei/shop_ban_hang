import type { Metadata } from "next";
import { CartPage } from "@/components/sites/lienstore/shop/cart/CartPage";
import { StoreSidebar } from "@/components/sites/lienstore/shop/cart/StoreSidebar";
import { SiteChrome, TwoColumnShell } from "@/components/sites/lienstore/shop/SiteChrome";

export const metadata: Metadata = { title: "Giỏ hàng – LienStore" };

export default function Cart() {
  return (
    <SiteChrome>
      <TwoColumnShell sidebar={<StoreSidebar />}>
        <article className="entry-content">
          <CartPage />
        </article>
      </TwoColumnShell>
    </SiteChrome>
  );
}
