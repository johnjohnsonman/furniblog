import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { uploadGalleryImageServer } from "@/lib/supabase/storage-server"
import { StorageValidationError } from "@/lib/supabase/storage"

export const runtime = "nodejs"

type Payload = {
  rank1_chair?: string | null
  rank2_chair?: string | null
  rank3_chair?: string | null
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
  purchase_reason?: string | null
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

  const rank1 = str(payload.rank1_chair, 200)
  const reviewText = str(payload.review_text, 2000)

  if (!rank1) {
    return NextResponse.json(
      { error: "1위 의자를 선택해 주세요." },
      { status: 400 }
    )
  }
  if (!reviewText) {
    return NextResponse.json(
      { error: "한 줄 후기를 입력해 주세요." },
      { status: 400 }
    )
  }

  // Optional photo upload to the existing public `gallery` bucket.
  let photoUrl: string | null = null
  if (photo) {
    try {
      photoUrl = await uploadGalleryImageServer(photo, "experience")
    } catch (err) {
      const message =
        err instanceof StorageValidationError
          ? err.message
          : "사진 업로드에 실패했습니다."
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  const row = {
    status: "pending" as const,
    source: "store_form" as const,
    gender: str(payload.gender, 20),
    height: str(payload.height, 40),
    weight_or_body: str(payload.weight_or_body, 40),
    age_group: str(payload.age_group, 20),
    job: str(payload.job, 60),
    main_purpose: str(payload.main_purpose, 60),
    sitting_hours: str(payload.sitting_hours, 40),
    previous_chair: str(payload.previous_chair, 200),
    pain_areas: cleanArray(payload.pain_areas),
    standing_desk: str(payload.standing_desk, 20),
    rank1_chair: rank1,
    rank2_chair: str(payload.rank2_chair, 200),
    rank3_chair: str(payload.rank3_chair, 200),
    rating: clampRating(payload.rating),
    review_text: reviewText,
    selection_reasons: cleanArray(payload.selection_reasons),
    purchase_reason: str(payload.purchase_reason, 500),
    photo_url: photoUrl,
    store_location: str(payload.store_location, 40),
    comparing_chairs: str(payload.comparing_chairs, 300),
    nickname: str(payload.nickname, 60),
    phone: str(payload.phone, 40),
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("experience_reviews").insert(row)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
