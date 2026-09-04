import type { Metadata } from "next";
import { FullWidthShell, SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";
import type { SearchParams } from "@/app/shop/_listing";
import { CategoryListing, categoryMetadata } from "./_listing";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return categoryMetadata(slug);
}

// Clone of https://linconnn.io.vn/product-category/<slug>/
export default async function Page({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return (
    <SiteChrome>
      <FullWidthShell>
        <CategoryListing slug={slug} page={1} searchParams={sp} />
      </FullWidthShell>
    </SiteChrome>
  );
}
