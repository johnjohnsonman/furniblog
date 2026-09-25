import assert from "node:assert/strict"
import { isLocalShowroomPost, selectRelatedBlogPosts, type RelatedBlogPost } from "../lib/growth/related-blog"

const post = (slug: string, productSlugs: string[] = ["sidiz-t50"]): RelatedBlogPost => ({ slug, title: "", content_html: "", hero_image_url: null, published_at: "2026-09-01", productSlugs, chairpediaSlugs: [] })

assert.ok(isLocalShowroomPost({ slug: "chairpark-showroom-review-test-drive-premium-office-chairs-in-south-korea", title: "" }))
assert.ok(isLocalShowroomPost({ slug: "6-must-visit-furniture-and-lighting-showrooms-in-seoul-s-mapo-district", title: "" }))
assert.ok(isLocalShowroomPost({ slug: "any-slug", title: "Inside ChairPark Gangnam" }))
assert.ok(!isLocalShowroomPost({ slug: "sidiz-t50-review", title: "Sidiz T50 Review" }))

const picked = selectRelatedBlogPosts([post("chairpark-seoul-inside-korea-s-premier-ergonomic-chair-showroom"), post("sidiz-t50-review")], "sidiz-t50", [], 3)
assert.deepEqual(picked.map(p => p.slug), ["sidiz-t50-review"])

console.log("related blog tests passed")
