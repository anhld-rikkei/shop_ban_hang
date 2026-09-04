import { NextResponse } from "next/server";
import { getStats } from "@/lib/db";
import pkg from "../../../../package.json";

export const dynamic = "force-dynamic";

/** Liveness/readiness probe for Docker / TrueNAS health checks. */
export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({
      ok: true,
      version: pkg.version,
      db: { engine: "sqlite", schemaVersion: stats.schema.schemaVersion, latest: stats.schema.latest },
      products: stats.products,
      orders: stats.orders,
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "db unavailable" }, { status: 503 });
  }
}
