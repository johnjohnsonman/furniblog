import { getSourceBadgeClass } from "@/components/chairs/review-utils"

export { getSourceBadgeClass }

export type AdminReview = {
  id: string
  productId: string
  productSlug: string
  productName: string
  source: string
  summary: string
  pros: string[]
  cons: string[]
  score: number
  verified: boolean
  sourceUrl?: string
  createdAt: string
}

export type AdminReviewStats = {
  total: number
  verified: number
  unverified: number
  todayAdded: number
}

export type ProductOption = {
  id: string
  slug: string
  name: string
}

export const SOURCE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "chairpark", label: "Chairpark" },
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "dcinside", label: "DC Inside" },
  { value: "naver", label: "Naver" },
  { value: "japan_community", label: "Japan" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "review_sites", label: "Review Sites" },
  { value: "hackernews", label: "Hacker News" },
  { value: "twitter", label: "Twitter" },
] as const

export const SOURCE_LABELS: Record<string, string> = {
  chairpark: "Chairpark",
  reddit: "Reddit",
  youtube: "YouTube",
  dcinside: "DC Inside",
  naver: "Naver",
  japan_community: "Japan",
  google: "Google",
  trustpilot: "Trustpilot",
  review_sites: "Review Sites",
  hackernews: "Hacker News",
  twitter: "Twitter",
  quora: "Quora",
}

export function formatSourceUrl(url?: string): string {
  if (!url) return ""
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    return host + new URL(url).pathname.slice(0, 40)
  } catch {
    return url.slice(0, 48)
  }
}

export function formatReviewDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

export function renderStars(score: number): string {
  const clamped = Math.max(0, Math.min(5, score))
  let out = ""
  for (let i = 1; i <= 5; i++) {
    const diff = clamped - (i - 1)
    if (diff >= 1) out += "★"
    else if (diff >= 0.25) out += "½"
    else out += "☆"
  }
  return out
}
