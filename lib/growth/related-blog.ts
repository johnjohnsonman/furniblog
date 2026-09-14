import { linkedProductSlugs, linkedChairpediaSlugs } from "../blog/media"

export type RelatedBlogPost = { slug: string; title: string; content_html: string; hero_image_url: string | null; published_at: string | null; productSlugs?: string[]; chairpediaSlugs?: string[] }

/** A compact public relationship index; full article HTML is never cached here. */
export function toRelatedBlogIndex(post: RelatedBlogPost): RelatedBlogPost {
  return { slug: post.slug, title: "", content_html: "", hero_image_url: null, published_at: post.published_at,
    productSlugs: linkedProductSlugs(post.content_html), chairpediaSlugs: linkedChairpediaSlugs(post.content_html) }
}

const priorities: Record<string, string[]> = {
  "herman-miller-aeron": [
    "herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c",
    "herman-miller-aeron-classic-vs-remastered-identification-guide",
    "herman-miller-aeron-alternatives-by-budget",
  ],
  "steelcase-leap-v2": [
    "used-steelcase-leap-buying-guide-v1-vs-v2-identification-and-inspection",
    "steelcase-leap-vs-gesture-which-high-end-ergonomic-chair-is-right-for-you",
    "steelcase-leap-v2-review-the-chair-that-hugs-your-body",
  ],
  "steelcase-gesture": [
    "steelcase-leap-vs-gesture-which-high-end-ergonomic-chair-is-right-for-you",
    "office-chair-desk-fit-guide-seat-height-and-armrest-clearance",
    "office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon",
  ],
  "okamura-contessa-ii": [
    "okamura-contessa-vs-contessa-seconda-identification-and-used-buying-guide",
    "okamura-contessa-ii-vs-herman-miller-aeron-which-2-000-chair-should-you-buy",
    "office-chair-desk-fit-guide-seat-height-and-armrest-clearance",
  ],
  "libernovo-omni": [
    "libernovo-lineup-explained-omni-omni-se-omni-pro-maxis-compared",
    "office-chair-desk-fit-guide-seat-height-and-armrest-clearance",
    "office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon",
  ],
}

const generalGuides = [
  "office-chair-desk-fit-guide-seat-height-and-armrest-clearance",
  "premium-office-chair-buying-checklist-how-to-avoid-expensive-mistakes",
  "refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs",
]

export function guideIntent(slug: string): string {
  if (/identification|classic-vs-remastered/.test(slug)) return "Check the version"
  if (/size-guide|desk-fit|seat-depth|standing-desks/.test(slug)) return "Check the fit"
  if (/vs-|alternatives|compared|lineup/.test(slug)) return "Compare options"
  return "Before you buy"
}

/** Rank relevant published candidates; freshness only breaks relevance ties. */
export function selectRelatedBlogPosts(posts: RelatedBlogPost[], productSlug: string, chairpediaSlugs: string[], limit = 3): RelatedBlogPost[] {
  if (!productSlug || limit <= 0) return []
  const preferred = Object.prototype.hasOwnProperty.call(priorities, productSlug) ? priorities[productSlug] : []
  const unique = [...new Map(posts.map(post => [post.slug, post])).values()]
  return unique.map(post => {
    const priority = preferred.indexOf(post.slug)
    const direct = (post.productSlugs ?? linkedProductSlugs(post.content_html)).includes(productSlug)
    const guide = (post.chairpediaSlugs ?? linkedChairpediaSlugs(post.content_html)).some(slug => chairpediaSlugs.includes(slug))
    const fallback = generalGuides.indexOf(post.slug)
    const score = priority >= 0 ? 1000 - priority : direct || guide ? 200 + (guideIntent(post.slug) === "Before you buy" ? 0 : 20) : fallback >= 0 ? 50 - fallback : 0
    return { post, score }
  }).filter(row => row.score > 0).sort((a, b) => b.score - a.score || (Date.parse(b.post.published_at || "") || 0) - (Date.parse(a.post.published_at || "") || 0) || a.post.slug.localeCompare(b.post.slug))
    .slice(0, limit).map(row => row.post)
}
