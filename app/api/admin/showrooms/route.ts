import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { storeSchema } from "@/lib/showrooms/validation";
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if ((process.env.SHOWROOMS_ENABLED !== "true" || process.env.SHOWROOM_DATA_SOURCE === "registry"))
    return NextResponse.json(
      { error: "Showroom management is not enabled" },
      { status: 503 },
    );
  const db = createAdminClient();
  const rows = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await db
      .from("showrooms")
      .select("*,brands:showroom_brands(*),models:showroom_models(*)")
      .order("name")
      .range(start, start + 499);
    if (error)
      return NextResponse.json(
        { error: "Store database unavailable" },
        { status: 503 },
      );
    rows.push(...data);
    if (data.length < 500) break;
  }
  return NextResponse.json(
    { stores: rows },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if ((process.env.SHOWROOMS_ENABLED !== "true" || process.env.SHOWROOM_DATA_SOURCE === "registry"))
    return NextResponse.json(
      { error: "Showroom management is not enabled" },
      { status: 503 },
    );
  if (
    req.headers.get("origin") &&
    req.headers.get("origin") !== req.nextUrl.origin
  )
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const raw = await req.text();
    if (raw.length > 100000)
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    const parsed = storeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return NextResponse.json(
        {
          error: parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    const s = parsed.data,
      db = createAdminClient();
    if (s.models.length) {
      const { data, error } = await db
        .from("products")
        .select("id,published,track")
        .in(
          "id",
          s.models.map((m) => m.product_id),
        );
      if (
        error ||
        data?.length !== s.models.length ||
        data.some((p) => !p.published || p.track !== "chair")
      )
        return NextResponse.json(
          { error: "Choose published chair models" },
          { status: 400 },
        );
    }
    const { data, error } = await db.rpc("save_showroom", {
      payload: s,
      expected_updated_at: s.updated_at ?? null,
    });
    if (error)
      return NextResponse.json(
        {
          error:
            error.code === "40001"
              ? "Store changed. Reload before saving."
              : error.code === "23505"
                ? "Slug is already in use."
                : "Unable to save store; check references and database setup.",
        },
        { status: error.code === "40001" ? 409 : 400 },
      );
    return NextResponse.json({ id: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid store request" },
      { status: 400 },
    );
  }
}
