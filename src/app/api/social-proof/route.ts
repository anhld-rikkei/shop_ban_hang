import { NextResponse } from "next/server";
import { getRecentPurchases } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/social-proof — recent confirmed purchases (anonymised: product + province + time) for the storefront popup. */
export async function GET() {
  const items = await getRecentPurchases(12);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=120" } });
}
