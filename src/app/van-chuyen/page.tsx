import type { Metadata } from "next";
import { ShippingTable } from "@/components/sites/lienstore/shop/ShippingTable";
import { FullWidthShell, SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";
import { PageBand } from "@/components/sites/lienstore/ui2/HomeBlocks";
import { getShippingMethods, getShippingNotes } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chi phí vận chuyển – LienStore",
  description: "Bảng phí vận chuyển hàng Nhật về Việt Nam và phí giao hàng nội địa của LienStore.",
};

export default async function ShippingPage() {
  const [methods, notes] = await Promise.all([getShippingMethods(), getShippingNotes()]);
  return (
    <SiteChrome>
      <PageBand title="Chi phí vận chuyển" crumbs={[{ label: "Chi phí vận chuyển" }]} description="Phí gửi hàng từ Nhật về Việt Nam và phí giao nội địa. Bảng do cửa hàng cập nhật." />
      <FullWidthShell>
        <div className="mx-auto max-w-[1000px]">
          <ShippingTable methods={methods} notes={notes} />
        </div>
      </FullWidthShell>
    </SiteChrome>
  );
}
