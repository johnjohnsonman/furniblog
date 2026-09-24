import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/auth"

const ALLOWED = new Set(["chair_finder_started", "chair_finder_completed", "chair_finder_result_opened", "chair_finder_showroom_opened", "showroom_action"])
const BOT_RE = /bot|crawl|spider|slurp|preview|monitor|lighthouse|headless/i

export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, skipped: true })
  if (BOT_RE.test(request.headers.get("user-agent") ?? "") || verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ ok: true, skipped: true })
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ ok: true, skipped: true }) }
  const eventName = typeof body.eventName === "string" ? body.eventName : ""
  const pagePath = typeof body.pagePath === "string" && body.pagePath.startsWith("/") ? body.pagePath.slice(0, 512) : ""
  if (!ALLOWED.has(eventName) || !pagePath) return NextResponse.json({ ok: true, skipped: true })
  const clean = (value: unknown, max = 160) => typeof value === "string" ? value.trim().slice(0, max) || null : null
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase() || request.cookies.get("x-country")?.value || null
  try {
    const { error } = await createAdminClient().from("conversion_events").insert({
      event_name: eventName, page_path: pagePath, product_slug: clean(body.productSlug),
      entity_type: clean(body.entityType, 40), entity_id: clean(body.entityId), placement: clean(body.placement, 80),
      country, visitor_id: request.cookies.get("vid")?.value ?? null,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
    })
    if (error) return NextResponse.json({ ok: true, skipped: true })
  } catch { return NextResponse.json({ ok: true, skipped: true }) }
  return NextResponse.json({ ok: true })
}
