import assert from "node:assert/strict"
import { SITEMAP_SECTIONS, isSitemapSection, renderSitemapIndex, renderUrlset } from "../lib/seo/sitemap-sections"
import { orderCatalogForListing, productsPageHref } from "../lib/products/listing-order"

// Sitemap index lists every section once, on the canonical host.
const index = renderSitemapIndex()
assert.equal((index.match(/<sitemap>/g) || []).length, SITEMAP_SECTIONS.length)
for (const s of SITEMAP_SECTIONS) assert.ok(index.includes(`<loc>https://www.chairpedia.com/sitemaps/${s}.xml</loc>`), s)
assert.ok(isSitemapSection("products") && !isSitemapSection("../etc"))
const set = renderUrlset([{ url: "https://www.chairpedia.com/a?x=1&y=2", changeFrequency: "weekly", priority: 0.5 }])
assert.ok(set.includes("<loc>https://www.chairpedia.com/a?x=1&amp;y=2</loc>"), "loc must be XML-escaped")

// Listing order: most reviewed first, then brand/name; deterministic.
const items = [{ id: "b", brand: "Zed", name: "One" }, { id: "a", brand: "Acme", name: "Two" }, { id: "c", brand: "Acme", name: "One" }]
const counts = { b: { count: 9 }, a: { count: 1 }, c: { count: 1 } }
assert.deepEqual(orderCatalogForListing(items, counts).map(i => i.id), ["b", "c", "a"])
assert.deepEqual(orderCatalogForListing([...items].reverse(), counts).map(i => i.id), ["b", "c", "a"], "input order must not matter")

// Page links keep other params and drop page=1.
assert.equal(productsPageHref(2, new URLSearchParams("category=office")), "/products?category=office&page=2")
assert.equal(productsPageHref(1, new URLSearchParams("page=3")), "/products")

console.log("indexing tests passed")
