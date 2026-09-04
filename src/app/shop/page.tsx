import type { Metadata } from "next";
import { FullWidthShell, SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";
import { ShopListing, type SearchParams } from "./_listing";

export const metadata: Metadata = {
  title: "Shop – ĐẸP MỖI GIÂY – KHỎE MỖI NGÀY",
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

// Clone of https://linconnn.io.vn/shop/ (also serves ?s= search results).
export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <SiteChrome>
      <FullWidthShell>
        <ShopListing page={1} searchParams={sp} />
      </FullWidthShell>
    </SiteChrome>
  );
}
