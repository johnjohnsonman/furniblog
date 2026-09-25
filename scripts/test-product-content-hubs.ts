import assert from "node:assert/strict"
import { guideProductRelations, productContentHubs } from "../lib/products/content-hubs"
import { displayPrice, getPriceProvenance } from "../lib/products/price-provenance"

const required = ["herman-miller-aeron", "herman-miller-embody", "herman-miller-embody-gaming"]
for (const slug of required) {
  const hub = productContentHubs[slug]
  assert.ok(hub, `${slug}: hub missing`)
  assert.ok(hub.heroFacts.length >= 3, `${slug}: too few hero facts`)
  assert.ok(hub.shortName.length > 0, `${slug}: shortName missing`)
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

// Hub prices moved to price-provenance; card labels must stay identical.
assert.equal(displayPrice("herman-miller-aeron"), "$2,045 – $2,730")
assert.equal(displayPrice("herman-miller-embody"), "$2,340 – $2,705")
assert.equal(displayPrice("herman-miller-embody-gaming"), "$2,395")
for (const [slug, hub] of Object.entries(productContentHubs)) {
  if (hub.notOnAmazon) assert.ok(getPriceProvenance(slug)?.sourceUrl, `${slug}: notOnAmazon needs a store URL to send buyers to`)
}

console.log("product content hub tests passed")
