import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { uploadGalleryImageServer } from "@/lib/supabase/storage-server"
import { StorageValidationError } from "@/lib/supabase/storage"

export const runtime = "nodejs"

type Payload = {
  rank1_chair?: string | null
  rank2_chair?: string | null
  rank3_chair?: string | null
  rank1_chair_id?: string | null
  rank2_chair_id?: string | null
  rank3_chair_id?: string | null
  gender?: string | null
  height?: string | null
  weight_or_body?: string | null
  age_group?: string | null
  job?: string | null
  main_purpose?: string | null
  sitting_hours?: string | null
  previous_chair?: string | null
  pain_areas?: unknown
  standing_desk?: string | null
  rating?: unknown
  review_text?: string | null
  selection_reasons?: unknown
  store_location?: string | null
  comparing_chairs?: string | null
  nickname?: string | null
  phone?: string | null
}

function str(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

function cleanArray(value: unknown, max = 20): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => String(v).trim())
    .filter((v, i, arr) => v.length > 0 && arr.indexOf(v) === i)
    .slice(0, max)
}

function clampRating(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const r = Math.round(n)
  if (r < 1 || r > 5) return null
  return r
}

function mapSex(value: string | null): string | null {
  if (!value) return null
  if (/남|male/i.test(value)) return "male"
  if (/여|female/i.test(value)) return "female"
  return null
}

export async function POST(request: NextRequest) {
  let payload: Payload
  let photo: File | null = null

  const contentType = request.headers.get("content-type") ?? ""
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData()
      const raw = form.get("payload")
      payload = raw ? (JSON.parse(String(raw)) as Payload) : {}
      const file = form.get("photo")
      if (file instanceof File && file.size > 0) photo = file
    } else {
      payload = (await request.json()) as Payload
    }
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 })
  }

  const rank1Name = str(payload.rank1_chair, 200)
  const reviewText = str(payload.review_text, 2000)

  if (!rank1Name) {
    return NextResponse.json({ error: "1위 의자를 선택해 주세요." }, { status: 400 })
  }
  if (!reviewText) {
    return NextResponse.json({ error: "한 줄 후기를 입력해 주세요." }, { status: 400 })
  }

  // Optional photo upload to the existing public `gallery` bucket.
  let photoUrl: string | null = null
  if (photo) {
    try {
      photoUrl = await uploadGalleryImageServer(photo, "experience")
    } catch (err) {
      const message =
        err instanceof StorageValidationError ? err.message : "사진 업로드에 실패했습니다."
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  const supabase = createAdminClient()

  // Resolve ranked chairs -> product ids (ids preferred; names as fallback).
  const rankInputs = [
    { rank: 1, id: str(payload.rank1_chair_id, 64), name: rank1Name },
    { rank: 2, id: str(payload.rank2_chair_id, 64), name: str(payload.rank2_chair, 200) },
    { rank: 3, id: str(payload.rank3_chair_id, 64), name: str(payload.rank3_chair, 200) },
  ]
  const namesToResolve = rankInputs.filter((r) => !r.id && r.name).map((r) => r.name as string)
  const nameToId = new Map<string, string>()
  if (namesToResolve.length) {
    const { data: matched } = await supabase
      .from("products")
      .select("id, name")
      .in("name", namesToResolve)
    for (const p of (matched ?? []) as Array<{ id: string; name: string }>) {
      nameToId.set(p.name, p.id)
    }
  }

  const session = {
    status: "pending" as const,
    source: "store_form" as const,
    sex: mapSex(str(payload.gender, 20)),
    height_band: str(payload.height, 40),
    body: str(payload.weight_or_body, 40),
    age_band: str(payload.age_group, 20),
    job: str(payload.job, 60),
    uses: payload.main_purpose ? [str(payload.main_purpose, 60) as string].filter(Boolean) : [],
    sit_hours: str(payload.sitting_hours, 40),
    previous_chair: str(payload.previous_chair, 200),
    pain: cleanArray(payload.pain_areas),
    standing_desk: str(payload.standing_desk, 20),
    reasons: cleanArray(payload.selection_reasons),
    comment: reviewText,
    rating: clampRating(payload.rating),
    photo_url: photoUrl,
    store_location: str(payload.store_location, 40),
    comparing_chairs: str(payload.comparing_chairs, 300),
    nickname: str(payload.nickname, 60),
    contact: str(payload.phone, 40),
  }

  const { data: inserted, error } = await supabase
    .from("review_sessions")
    .insert(session)
    .select("id")
    .single()

  if (error || !inserted) {
    return NextResponse.json({ error: error?.message ?? "저장에 실패했습니다." }, { status: 500 })
  }

  // Rankings (matched chairs only, deduped by chair_id).
  const seen = new Set<string>()
  const rankingRows: Array<{ session_id: string; chair_id: string; rank: number }> = []
  for (const r of rankInputs) {
    const chairId = r.id ?? (r.name ? nameToId.get(r.name) : undefined)
    if (!chairId || seen.has(chairId)) continue
    seen.add(chairId)
    rankingRows.push({ session_id: inserted.id, chair_id: chairId, rank: r.rank })
  }

  if (rankingRows.length) {
    const { error: rErr } = await supabase.from("review_rankings").insert(rankingRows)
    if (rErr) {
      // Avoid an orphan session if rankings fail.
      await supabase.from("review_sessions").delete().eq("id", inserted.id)
      return NextResponse.json({ error: rErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
