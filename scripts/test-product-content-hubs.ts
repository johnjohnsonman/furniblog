import assert from "node:assert/strict"
import { formatPriceRange, guideProductRelations, hubDisplayPrice, productContentHubs } from "../lib/products/content-hubs"

const required = ["herman-miller-aeron", "herman-miller-embody", "herman-miller-embody-gaming"]
for (const slug of required) {
  const hub = productContentHubs[slug]
  assert.ok(hub, `${slug}: hub missing`)
  assert.ok(hub.heroFacts.length >= 3, `${slug}: too few hero facts`)
  assert.ok(hub.shortName.length > 0, `${slug}: shortName missing`)
  if (hub.priceRange) {
    const r = hub.priceRange
    assert.ok(r.minUsd > 0 && r.minUsd <= r.maxUsd, `${slug}: invalid price range`)
    assert.ok(r.sourceUrl.startsWith("https://") && r.source.length > 0, `${slug}: price range needs a source`)
    assert.match(r.checkedOn, /^\d{4}-\d{2}-\d{2}$/, `${slug}: price range needs a checked date`)
  }
  assert.ok(hub.buyingChecks.length >= 3 && hub.buyingChecks.length <= 5, `${slug}: buying checks must stay focused`)
  assert.ok(hub.guides.length <= 5, `${slug}: guide rail is too broad`)
  assert.ok(hub.comparisons.length <= 6, `${slug}: comparison rail is too broad`)
  for (const item of [...hub.buyingChecks, ...hub.versions, ...hub.guides, ...hub.comparisons]) {
    assert.ok(item.href.startsWith("/"), `${slug}: internal link must be relative (${item.href})`)
    assert.ok(item.description.length > 20, `${slug}: link needs decision context (${item.label})`)
  }
}

assert.equal(productContentHubs["herman-miller-aeron"].versions.length, 0, "Do not invent an Aeron Gaming route")
assert.ok(productContentHubs["herman-miller-embody"].versions.some((item) => item.href === "/products/herman-miller-embody-gaming"))
assert.ok(productContentHubs["herman-miller-embody-gaming"].versions.some((item) => item.href === "/products/herman-miller-embody"))
assert.ok(Object.keys(guideProductRelations).length >= 7)

assert.equal(formatPriceRange(productContentHubs["herman-miller-aeron"].priceRange!), "$2,045 – $2,730 · varies by configuration · as of Sep 2026")
assert.equal(formatPriceRange({ minUsd: 900, maxUsd: 1200, source: "Retailers", sourceUrl: "https://example.com", checkedOn: "2026-09-25", approximate: true }), "approx. $900 – $1,200 · varies by configuration · as of Sep 2026")

assert.equal(hubDisplayPrice("herman-miller-aeron"), "$2,045 – $2,730")
assert.equal(hubDisplayPrice("herman-miller-embody-gaming"), "$2,395")
assert.equal(hubDisplayPrice("steelcase-leap-v2"), null, "non-hub products keep their catalog price")
assert.equal(hubDisplayPrice(undefined), null)
for (const [slug, hub] of Object.entries(productContentHubs)) {
  if (hub.notOnAmazon) assert.ok(hub.priceRange?.sourceUrl, `${slug}: notOnAmazon needs a store URL to send buyers to`)
}

console.log("product content hub tests passed")
