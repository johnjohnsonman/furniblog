import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
// No anonymous table grant. This endpoint accepts only a pending, private report.
export async function POST(req: NextRequest) {
  if ((process.env.SHOWROOMS_ENABLED !== "true" || process.env.SHOWROOM_DATA_SOURCE === "registry"))
    return NextResponse.json({ error: "Not available" }, { status: 503 });
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const raw = await req.text();
    if (raw.length > 5000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const b = z
      .object({
        showroom_id: z.string().uuid(),
        message: z.string().trim().min(10).max(3000),
        requester_email: z.string().email().or(z.literal("")),
        website: z.literal(""),
      })
      .strict()
      .parse(JSON.parse(raw));
    const db = createAdminClient();
    const { data } = await db
      .from("showrooms")
      .select("id")
      .eq("id", b.showroom_id)
      .eq("status", "published")
      .maybeSingle();
    if (!data)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    const { error } = await db
      .from("showroom_corrections")
      .insert({
        showroom_id: b.showroom_id,
        message: b.message,
        requester_email: b.requester_email,
        status: "pending",
      });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit. Check your message and email." },
      { status: 400 },
    );
  }
}
