import type { Metadata } from "next";
import Link from "next/link";
import { StoreSidebar } from "@/components/sites/lienstore/shop/cart/StoreSidebar";
import { Breadcrumb } from "@/components/sites/lienstore/shop/Breadcrumb";
import { SiteChrome, TwoColumnShell } from "@/components/sites/lienstore/shop/SiteChrome";
import { getPosts } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Góc Chia Sẻ – LienStore",
  description: "Bài viết chia sẻ kinh nghiệm dùng mỹ phẩm và thực phẩm chức năng Nhật Bản của LienStore.",
};

export default async function BlogCategoryPage() {
  const posts = await getPosts();
  return (
    <SiteChrome>
      <TwoColumnShell sidebar={<StoreSidebar />}>
        <Breadcrumb items={[{ label: "Góc Chia Sẻ" }]} />
        <h1 className="my-[20.1px] text-center font-oswald text-[30px] font-light leading-[42px] text-lien-heading after:mx-auto after:mt-[15px] after:block after:h-0.5 after:w-[90px] after:bg-lien-blue">
          Góc Chia Sẻ
        </h1>
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-[3px] bg-white p-6 shadow-[0_2px_18px_-4px_#cfcfcf]">
              <h2 className="mb-1 font-oswald text-[24px] font-light leading-[33.6px] text-lien-heading">
                <Link href={`/${post.slug}/`} className="hover:text-lien-blue">
                  {post.title}
                </Link>
              </h2>
              <p className="mb-3 text-[14px] leading-5 text-lien-muted">Đăng ngày {formatDate(post.date)}</p>
              <p className="mb-4 text-[16px] leading-6 text-lien-text">{post.excerpt}</p>
              <Link
                href={`/${post.slug}/`}
                className="inline-block rounded-[3px] bg-lien-blue px-4 py-[9.888px] text-[16px] font-bold leading-4 text-white hover:bg-lien-blue-hover"
              >
                Đọc tiếp
              </Link>
            </article>
          ))}
        </div>
      </TwoColumnShell>
    </SiteChrome>
  );
}
