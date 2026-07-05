import type { RawContent } from "@/lib/pipeline/types"

const BRAND_TRUSTPILOT: Record<string, string> = {
  "herman-miller": "hermanmiller.com",
  steelcase: "steelcase.com",
  humanscale: "humanscale.com",
  haworth: "haworth.com",
  secretlab: "secretlab.co",
  autonomous: "autonomous.ai",
  branch: "branchfurniture.com",
  flexispot: "flexispot.com",
  noblechairs: "noblechairs.com",
  andaseat: "andaseat.com",
  razer: "razer.com",
  corsair: "corsair.com",
  ikea: "ikea.com",
  "amazon-basics": "amazon.com",
  "la-z-boy": "la-z-boy.com",
  serta: "serta.com",
  ergohuman: "ergohuman.com",
  hinomi: "hinomi.co",
  sihoo: "sihoo.com",
}

type TrustpilotReview = {
  text?: string
  content?: string
  title?: string
  body?: string
}

function getBrandDomain(chairSlug: string): string | null {
  const sorted = Object.entries(BRAND_TRUSTPILOT).sort(
    (a, b) => b[0].length - a[0].length
  )
  for (const [brand, domain] of sorted) {
    if (chairSlug.startsWith(brand)) return domain
  }
  return null
}

function parseReviewsFromHtml(html: string): TrustpilotReview[] {
  const results: TrustpilotReview[] = []

  const patterns = [
    /data-review-content="([^"]{50,})"/g,
    /"text"\s*:\s*"([^"]{50,})"/g,
    /class="[^"]*review-body[^"]*"[^>]*>\s*<p[^>]*>([^<]{50,})<\/p>/g,
  ]

  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)]
    for (const match of matches.slice(0, 10)) {
      const text = match[1]
        .replace(/\\n/g, " ")
        .replace(/\\"/g, '"')
        .trim()
      if (text.length > 50) {
        results.push({ text, content: text })
      }
    }
    if (results.length > 0) break
  }

  return results
}

async function getTrustpilotReviews(domain: string): Promise<TrustpilotReview[]> {
  try {
    const businessUrl = `https://www.trustpilot.com/review/${domain}`
    const res = await fetch(businessUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      cache: "no-store",
    })

    if (!res.ok) return []

    const html = await res.text()

    const idMatch = html.match(/"businessUnitId"\s*:\s*"([^"]+)"/)
    if (!idMatch) {
      console.log("[TRUSTPILOT] Could not find businessUnitId")
      return parseReviewsFromHtml(html)
    }

    const businessUnitId = idMatch[1]
    console.log("[TRUSTPILOT] Business ID:", businessUnitId)

    // No language filter → include reviews from every country (translated to
    // English later by the processor), not just English-language ones.
    const apiUrl = `https://www.trustpilot.com/api/categoriespages/businessunit/${businessUnitId}/reviews?perPage=20`
    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0",
        Accept: "application/json",
        Referer: "https://www.trustpilot.com/",
      },
      cache: "no-store",
    })

    if (apiRes.ok) {
      const data = (await apiRes.json()) as {
        reviews?: TrustpilotReview[]
        data?: TrustpilotReview[]
      }
      const reviews = data.reviews ?? data.data ?? []
      if (reviews.length > 0) return reviews
    }

    return parseReviewsFromHtml(html)
  } catch (e) {
    console.error("[TRUSTPILOT] Error:", e)
    return []
  }
}

export async function collectFromTrustpilot(
  chairSlug: string,
  chairName: string
): Promise<RawContent[]> {
  const domain = getBrandDomain(chairSlug)

  if (!domain) {
    console.log("[TRUSTPILOT] No mapping for:", chairSlug)
    return []
  }

  const results: RawContent[] = []

  try {
    const reviews = await getTrustpilotReviews(domain)
    console.log("[TRUSTPILOT] Reviews:", reviews.length)

    for (const review of reviews.slice(0, 10)) {
      const text = String(
        review.text ?? review.content ?? review.title ?? review.body ?? ""
      ).trim()

      if (text.length < 30) continue

      results.push({
        url: `https://www.trustpilot.com/review/${domain}`,
        title: review.title || `${chairName} review`,
        body: text,
        source: "trustpilot",
        collectedAt: new Date().toISOString(),
      })
    }

    console.log("[TRUSTPILOT] Total:", results.length)
    return results
  } catch (e) {
    console.error("[TRUSTPILOT] Collect error:", e)
    return []
  }
}
