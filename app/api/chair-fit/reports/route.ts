import { NextRequest, NextResponse } from "next/server"
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { makeSharedReport, reportBucket } from "@/lib/recommend/shared-report"
import { verifyRecommendation } from "@/lib/recommend/report-signature"
export const runtime = "nodejs"
const headers = { "Cache-Control": "private, no-store" }
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Open the report on Chairpedia to share it." }, { status: 403, headers })
  const body = await request.text()
  if (Buffer.byteLength(body) > 256000) return NextResponse.json({ error: "Report is too large." }, { status: 413, headers })
  try {
    const input = JSON.parse(body)
    if (typeof input.includeMeasurements !== "boolean" || !verifyRecommendation(input.payload)) return NextResponse.json({ error: "This saved report predates sharing or has changed. Start a new test to create a shareable report." }, { status: 400, headers })
    const db = createAdminClient()
    const bucket = db.storage.from(reportBucket)
    // Atomic create-only slots enforce a shared five-per-hour limit across instances.
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local"
    const hour = Math.floor(Date.now() / 3600000)
    const fingerprint = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${hour}:${ip}`).digest("hex")
    let allowed = false
    for (let slot = 0; slot < 5; slot++) {
      const { error } = await bucket.upload(`limits/${hour}/${fingerprint}-${slot}.json`, "{}", { contentType: "application/json", cacheControl: "0", upsert: false })
      if (!error) { allowed = true; break }
      if (Number(error.statusCode) !== 409 && !/already exists|duplicate/i.test(error.message)) throw error
    }
    if (!allowed) return NextResponse.json({ error: "You have created five links this hour. Please try again later." }, { status: 429, headers })
    const report = makeSharedReport(input.payload, input.includeMeasurements)
    const id = randomUUID(), revokeToken = randomBytes(32).toString("hex")
    const stored = { ...report, revokeHash: createHash("sha256").update(revokeToken).digest("hex") }
    const { error } = await bucket.upload(`reports/${id}.json`, JSON.stringify(stored), { contentType: "application/json", cacheControl: "0", upsert: false })
    if (error) throw error
    return NextResponse.json({ id, url: `${request.nextUrl.origin}/chair-fit-report/${id}`, expiresAt: report.expiresAt, revokeToken }, { headers })
  } catch {
    return NextResponse.json({ error: "Could not create a share link. Your report is still saved in this tab." }, { status: 503, headers })
  }
}
