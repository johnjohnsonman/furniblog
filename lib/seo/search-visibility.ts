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
