import Link from "next/link";
import { FullWidthShell, SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <FullWidthShell>
        <section className="py-16 text-center">
          <h1 className="mb-4 font-oswald text-[30px] font-light leading-[42px] text-lien-heading">Rất tiếc! Không tìm thấy trang này.</h1>
          <p className="mb-8 text-lien-muted">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
          <Link
            href="/shop/"
            className="inline-block rounded-[3px] bg-lien-blue px-4 py-[9.888px] text-[16px] font-bold leading-4 text-white hover:bg-[#2a6bc0]"
          >
            Quay trở lại cửa hàng
          </Link>
        </section>
      </FullWidthShell>
    </SiteChrome>
  );
}
