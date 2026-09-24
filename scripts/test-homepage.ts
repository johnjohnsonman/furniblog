import assert from "node:assert/strict"
import fs from "node:fs"
import { homeCatalog, safeHomeImage, filterHomeProducts, moveHomeSelection, toggleHomeComparison, type HomeProductRow, type HomeImage } from "../lib/home/catalog"

const origin = "https://catalog.supabase.co"
const image: HomeImage = { id: "image-a", url: `${origin}/storage/v1/object/public/product-images/a.jpg`, model_status: "verified", rights: "kept", is_thumbnail: true, sort_order: 0 }
const row: HomeProductRow = { id: "a", slug: "chair-a", name: "Chair A", category: "office", published: true, track: "chair", brands: { slug: "brand-a", name: "Brand A" }, product_images: [image] }
assert.equal(safeHomeImage(image, origin), true)
for (const patch of [{ model_status: "candidate" }, { rights: "unreviewed" }, { url: "https://external.example/chair.jpg" }, { url: "javascript:alert(1)" }, { url: `${origin}/storage/v1/object/public/gallery/a.jpg` }]) {
  assert.equal(safeHomeImage({ ...image, ...patch }, origin), false)
}
assert.equal(safeHomeImage({ ...image, rights: "owner_policy" }, origin), true)
const second = { ...row, id: "b", slug: "chair-b", name: "Chair B", category: "lounge", brands: [{ slug: "brand-b", name: "Brand B" }] }
const result = homeCatalog([row, second, { ...row, id: "hidden", published: false }, { ...row, id: "table", track: "furniture" }, { ...row, id: "no-image", slug: "no-image", product_images: [] }], origin)
assert.equal(result.total, 3, "public counts must include a product without a displayable image")
assert.equal(result.products.length, 2, "unsafe/missing images must not produce placeholder cards")
assert.equal(result.categories.reduce((sum, category) => sum + category.count, 0), 3)
assert.equal(result.brands.find(brand => brand.slug === "brand-a")?.count, 2)
assert.deepEqual(filterHomeProducts(result.products, "lounge", "brand-a"), [])
assert.equal(filterHomeProducts(result.products, "office", "brand-a")[0].slug, "chair-a")
assert.equal(moveHomeSelection(result.products, "chair-a", -1), "chair-b")
assert.equal(moveHomeSelection(result.products, "chair-b", 1), "chair-a")
assert.equal(moveHomeSelection([], "chair-a", 1), "")
assert.deepEqual(toggleHomeComparison(["chair-a", "chair-b"], "chair-c"), ["chair-b", "chair-c"])
assert.deepEqual(toggleHomeComparison(["chair-a", "chair-b"], "chair-a"), ["chair-b"])
assert.equal(result.products[0].slug, "chair-a", "product URLs must use canonical slugs")
assert.deepEqual(homeCatalog([], origin), { total: 0, products: [], categories: [], brands: [] }, "no example data fallback")
const page = fs.readFileSync("app/page.tsx", "utf8")
const finder = fs.readFileSync("components/home/chair-finder.tsx", "utf8")
assert.match(page, /canonical: "https:\/\/www\.chairpedia\.com\/"/)
assert.equal((finder.match(/<h1>/g) ?? []).length, 1)
for (const unsafe of [/AggregateRating/, /FAQPage/, /priceUsd/, /bestFor/, /<iframe/, /getLatestReviews/, /getLatestVideos/, /getLatestNews/]) {
  assert.doesNotMatch(page + finder, unsafe)
}
assert.match(page, /generateOrganizationSchema/)
assert.match(page, /generateWebsiteSchema/)
assert.doesNotMatch(page + finder, /generateProductSchema|generateReviewSchema|generateOfferSchema/)
console.log("PASS: homepage data safety, counts, filtering, selection, comparison state, URL and SEO guards")
