/**
 * Normalize messy / mixed-language experience-review tag values into a small,
 * clean, English-only set for display and filtering. Non-destructive: applied
 * when mapping rows, the stored data is left untouched.
 */

/** Collapse 50+ free-text / Korean job strings into a handful of categories. */
export function canonicalJob(raw: string | null | undefined): string | null {
  if (!raw) return null
  const s = raw.toLowerCase()
  const has = (...keys: string[]) => keys.some((k) => s.includes(k))

  if (has("develop", "개발", "engineer", "programmer")) return "Developer"
  if (has("design", "디자인")) return "Designer"
  if (has("artist", "webtoon", "writer", "drama", "작가", "일러")) return "Artist"
  if (has("student", "exam", "graduate", "college", "고시", "학생", "준비생"))
    return "Student"
  if (has("field", "carpenter", "soldier", "pilot", "현장", "군인"))
    return "Field worker"
  if (has("business", "자영", "사업")) return "Business"
  if (
    has(
      "professional",
      "public service",
      "civil serv",
      "doctor",
      "professor",
      "clergy",
      "instructor",
      "teacher",
      "researcher",
      "nurse",
      "전문",
      "공무원"
    )
  )
    return "Professional"
  if (has("office", "사무")) return "Office worker"
  return "Other"
}

const PAIN_KO: Record<string, string> = {
  허리: "Lower back",
  목: "Neck",
  어깨: "Shoulders",
  엉덩이: "Hips",
  "다리·하체": "Legs & lower body",
  없음: "None",
}

/** Map pain points (incl. Korean) into a clean English set. */
export function canonicalPain(raw: string): string {
  const t = raw.trim()
  if (PAIN_KO[t]) return PAIN_KO[t]
  const s = t.toLowerCase()
  if (s === "not applicable" || s === "none") return "None"
  if (s.includes("tailbone")) return "Tailbone"
  if (s.includes("lower back") || s === "back" || s.includes("lumbar"))
    return "Lower back"
  if (s.includes("neck")) return "Neck"
  if (s.includes("shoulder")) return "Shoulders"
  if (s.includes("leg")) return "Legs & lower body"
  if (s.includes("butt") || s.includes("hip")) return "Hips"
  if (s.includes("arm")) return "Arms"
  return "Other"
}

const REASON_KO: Record<string, string> = {
  디자인: "Sleek design",
  "편안한 등판": "Comfortable backrest",
  "푹신한 좌판": "Cushioned seat",
  "사이즈가 잘 맞음": "Good size fit",
  "브랜드 명성": "Brand and product reputation",
  헤드레스트: "Comfortable headrest",
}

/** Translate the few Korean selection reasons; keep English ones as-is. */
export function canonicalReason(raw: string): string {
  const t = raw.trim()
  return REASON_KO[t] ?? t
}

/** Map a list through a normalizer and drop duplicates / empties. */
export function normalizeList(
  values: string[] | null | undefined,
  fn: (v: string) => string
): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const v of values ?? []) {
    const n = fn(v)
    if (n && !seen.has(n)) {
      seen.add(n)
      out.push(n)
    }
  }
  return out
}
