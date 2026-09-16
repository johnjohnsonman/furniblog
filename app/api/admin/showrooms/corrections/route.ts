import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if ((process.env.SHOWROOMS_ENABLED !== "true" || process.env.SHOWROOM_DATA_SOURCE === "registry"))
    return NextResponse.json({ error: "Not enabled" }, { status: 503 });
  const { data, error } = await createAdminClient()
    .from("showroom_corrections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return NextResponse.json(
    error ? { error: "Requests unavailable" } : { requests: data },
    { status: error ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
export async function PATCH(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if ((process.env.SHOWROOMS_ENABLED !== "true" || process.env.SHOWROOM_DATA_SOURCE === "registry"))
    return NextResponse.json({ error: "Not enabled" }, { status: 503 });
  if (
    req.headers.get("origin") &&
    req.headers.get("origin") !== req.nextUrl.origin
  )
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const body = z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "resolved", "dismissed"]),
        admin_notes: z.string().max(3000),
      })
      .strict()
      .parse(await req.json());
    const { error } = await createAdminClient()
      .from("showroom_corrections")
      .update({ status: body.status, admin_notes: body.admin_notes })
      .eq("id", body.id);
    return NextResponse.json(
      error ? { error: "Unable to update" } : { ok: true },
      { status: error ? 400 : 200 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
