import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/sites/lienstore/shop/SiteChrome";
import { parsePageNumber, type SearchParams } from "@/app/shop/_listing";
import { CategoryListing, categoryMetadata } from "../../_listing";

interface PageProps {
  params: Promise<{ slug: string; n: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return categoryMetadata(slug);
}

// Clone of https://linconnn.io.vn/product-category/<slug>/page/N/
export default async function Page({ params, searchParams }: PageProps) {
  const [{ slug, n }, sp] = await Promise.all([params, searchParams]);
  const page = parsePageNumber(n);
  if (Number.isNaN(page) || page < 1) notFound();

  return (
    <SiteChrome>
        <CategoryListing slug={slug} page={page} searchParams={sp} />
    </SiteChrome>
  );
}
