// Search-visibility policy (2026-09-11 restructure, phase 2).
//
// Publishing a record and exposing it to search are separate decisions:
// pages below stay reachable on the site, but detail pages without
// independent search value are noindexed and left out of the sitemap.
// No data is deleted or hidden from site navigation.
//
// Rules mirror scripts/audit-url-triage.cjs (the reviewed triage). URLs
// with real GSC performance in the 90d window ending 2026-09-08 are
// exempt so existing search traffic is never cut.

/** News slugs kept indexable despite thin bodies: they had clicks or ≥10 impressions. */
const NEWS_SEARCH_EXEMPT_SLUGS = new Set([
  "flexispot-sentinel-pro-ergonomic-gaming-chair-review-gamingt-qd6ha",
  "corsair-s-new-and-supposedly-affordable-seat-continues-the-m-1r2j7d",
  "jp-morgan-prepares-debt-deal-to-fund-hni-acquisition-of-stee-1ldgmn",
  "haworth-fern-office-chair-review-incredibly-premium-ergonomi-tbntkk",
  "autonomous-ergochair-pro-review-comfortable-but-that-s-it-to-4vvqus",
  "la-z-boy-reports-solid-earnings-amid-furniture-sector-strugg-irtsfj",
  "backforce-one-review-can-interstuhl-also-convince-with-a-gam-helap0",
  "after-30-years-of-waiting-the-iconic-aeron-chair-now-has-a-b-1cdw9g",
  "haworth-makes-strategic-investment-in-canada-with-acquisitio-1nn7dn",
])

function wordCount(text: string | null | undefined): number {
  return (text ?? "").trim().split(/\s+/).filter(Boolean).length
}

/** A review earns a search page only when its original source is on record. */
export function isReviewSearchable(review: { source_url: string | null }): boolean {
  return Boolean(review.source_url)
}

/**
 * A news item earns a search page when it links its original article and
 * carries substantial independent context (summary + why-it-matters), or
 * when it already proved itself in search (exempt list).
 */
export function isNewsSearchable(news: {
  slug: string | null
  url: string | null
  summary: string | null
  why_it_matters: string | null
}): boolean {
  if (news.slug && NEWS_SEARCH_EXEMPT_SLUGS.has(news.slug)) return true
  if (!news.url) return false
  return wordCount(news.summary) + wordCount(news.why_it_matters) >= 80
}

/** Metadata fragment for pages excluded from search. Links still followed. */
export const NOINDEX_FOLLOW = { robots: { index: false, follow: true } } as const

/**
 * Blog posts adapted from the Naver source blog are hidden from GOOGLE ONLY
 * (googlebot noindex): the July 2026 mass-import of that cluster coincides
 * exactly with the site-wide Google demotion, and the cluster has had zero
 * Google impressions since — while it is the site's top landing section on
 * Bing/DuckDuckGo/AI search, which keep serving it. Re-enable a post for
 * Google via the allowlist after a sourced rewrite.
 */
const BLOG_GOOGLE_REENABLED_SLUGS = new Set<string>([
  // The five Naver-adapted posts with actual Google referral traffic in the
  // 60 days to 2026-09-12 (page_views). Everything else in the cluster had
  // zero Google visits, so hiding it from Google costs nothing.
  "libernovo-complete-lineup-guide-omni-omni-se-omni-pro-maxis-compared",
  "herman-miller-x-logitech-g-embody-gaming-chair-materials-and-features-explained",
  "three-luxury-ergonomic-chairs-worth-the-investment-aeron-leap-and-contessa-compa",
  "kokuyo-ing-cloud-review-the-3-000-chair-that-moves-with-you",
  "mesh-vs-fabric-office-chairs-how-to-choose-based-on-how-you-actually-sit",
  // Money-cluster posts re-opened 2026-09-12 after a provenance + verified
  // enrichment pass (backups in the session scratchpad).
  "herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c",
  "how-to-use-the-herman-miller-aeron-a-complete-control-guide",
  "herman-miller-aeron-tilt-lock-why-your-chair-still-moves-and-why-that-s-normal",
  "how-to-buy-a-used-herman-miller-aeron-without-getting-burned",
  "why-your-legs-go-numb-at-your-desk-and-how-seat-depth-can-fix-it",
])

export function isBlogPostGoogleSearchable(post: {
  slug: string | null
  source_url: string | null
}): boolean {
  if (post.slug && BLOG_GOOGLE_REENABLED_SLUGS.has(post.slug)) return true
  return !/blog\.naver\.com|naver\.me/i.test(post.source_url ?? "")
}

/** Indexable everywhere except Google. Links still followed by all. */
export const GOOGLEBOT_NOINDEX = {
  robots: { index: true, follow: true, googleBot: { index: false, follow: true } },
} as const
