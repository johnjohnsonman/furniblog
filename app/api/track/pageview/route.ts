import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// First-party pageview logging (no Google Analytics). Fired by a small client
// beacon on every route change. Visitor identity is a first-party cookie only.
const VISITOR_COOKIE = "vid"
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|preview|monitor|lighthouse|headless/i

export async function POST(request: NextRequest) {
  // Always succeed quietly — analytics must never break a page.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const ua = request.headers.get("user-agent") ?? ""
  if (BOT_RE.test(ua)) {
    return NextResponse.json({ ok: true, bot: true })
  }

  let body: { path?: string; referrer?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const path = (body.path ?? "").trim()
  if (!path || !path.startsWith("/")) {
    return NextResponse.json({ ok: true, skipped: true })
  }
  // Don't log admin or API traffic.
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // Drop self-referrals — only keep external referrers.
  let referrer: string | null = body.referrer?.trim() || null
  if (referrer) {
    try {
      const refHost = new URL(referrer).hostname.replace(/^www\./, "")
      const selfHost = request.nextUrl.hostname.replace(/^www\./, "")
      if (refHost === selfHost) referrer = null
      else referrer = refHost
    } catch {
      referrer = null
    }
  }

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.cookies.get("x-country")?.value ??
    null

  // Stable first-party visitor id.
  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value ?? null
  let setCookie = false
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    setCookie = true
  }

  try {
    const supabase = createAdminClient()
    await supabase.from("page_views").insert({
      path: path.slice(0, 512),
      referrer: referrer ? referrer.slice(0, 256) : null,
      country,
      visitor_id: visitorId,
    })
  } catch {
    // analytics should never throw
  }

  const res = NextResponse.json({ ok: true })
  if (setCookie && visitorId) {
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return res
}
