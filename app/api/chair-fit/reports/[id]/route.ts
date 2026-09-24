import { downloadSharedReport } from "@/lib/recommend/report-storage"
import { NextRequest, NextResponse } from "next/server"
import { createHash, timingSafeEqual } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { reportBucket } from "@/lib/recommend/shared-report"
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store" }
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({}, { status: 403, headers })
  const { id } = await params
  const input = await request.json().catch(() => ({}))
  if (!/^[a-f0-9-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(input.revokeToken ?? "")) return NextResponse.json({}, { status: 400, headers })
  try {
    const bucket = createAdminClient().storage.from(reportBucket)
    const stored = await downloadSharedReport(id) as { revokeHash?: string } | null
    if (!stored) return NextResponse.json({}, { status: 404, headers })
    const hash = createHash("sha256").update(input.revokeToken).digest("hex")
    if (typeof stored.revokeHash !== "string" || stored.revokeHash.length !== 64 || !timingSafeEqual(Buffer.from(hash), Buffer.from(stored.revokeHash))) return NextResponse.json({}, { status: 403, headers })
    const removed = await bucket.remove([`reports/${id}.json`])
    if (removed.error) throw removed.error
    return NextResponse.json({ ok: true }, { headers })
  } catch { return NextResponse.json({}, { status: 503, headers }) }
}
