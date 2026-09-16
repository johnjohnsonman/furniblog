import { NextResponse } from "next/server";
import { enrichStore, getPublicStores, getStoreCatalog } from "@/lib/showrooms/server";

export const revalidate = 300;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (process.env.SHOWROOMS_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [{ stores, unavailable }, catalog, { slug }] = await Promise.all([
    getPublicStores(),
    getStoreCatalog(),
    params,
  ]);
  if (unavailable) {
    return NextResponse.json({ error: "Store directory unavailable" }, { status: 503 });
  }
  const store = stores.find((item) => item.slug === slug);
  if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(enrichStore(store, catalog), {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
  });
}
