import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { VERIFIED_PRODUCTS, type VerifiedProductKey } from "../lib/comparisons/verified-products"
import { VERIFIED_COMPARISON_SOURCES } from "../lib/comparisons/verified-sources"
import { COMPARISON_VISUALS, isVerifiedComparisonImage } from "../lib/comparisons/product-visuals"
import { getVerifiedComparisonPilot, VERIFIED_COMPARISON_PILOT_SLUGS } from "../lib/comparisons/verified-pilots"

const newKeys: VerifiedProductKey[] = ["cosm-high", "sayl", "freedom"]
assert.equal(Object.keys(VERIFIED_PRODUCTS).length, 8, "shared product records must not be copied per comparison")
for (const key of newKeys) {
  const product = VERIFIED_PRODUCTS[key], visual = COMPARISON_VISUALS[product.slug]
  assert.ok(product.market && product.modelScope && product.review)
  assert.ok(product.review.brand && product.review.checkedOn && product.review.availability && product.review.cautions.length)
  assert.ok(visual.assetId && visual.configurationNote && visual.dimensions)
  assert.ok(visual.dimensions.width >= 300 && visual.dimensions.height >= 300)
  assert.equal(visual.originalSourceUrl, null, "do not invent original licensing provenance")
  for (const fact of Object.values(product.facts)) {
    for (const id of fact.sourceIds) {
      assert.ok(product.review.sourceIds.includes(id), `${key}: claim source absent from product review`)
      assert.ok(VERIFIED_COMPARISON_SOURCES[id].supports)
    }
  }
  const image = { id: visual.assetId, url: "https://bvytheznlotwgavmytfr.supabase.co/storage/v1/object/public/product-images/test.jpg", model_status: "verified", rights: "kept" }
  assert.ok(isVerifiedComparisonImage(product.slug, image))
  assert.ok(isVerifiedComparisonImage(product.slug, { ...image, rights: "owner_policy" }))
  for (const invalid of [{ rights: null }, { rights: "candidate" }, { model_status: "candidate" }, { model_status: null }, { id: "unreviewed-replacement" }, { url: "https://example.com/chair.jpg" }, { url: "https://bvytheznlotwgavmytfr.supabase.co.evil.test/storage/v1/object/public/product-images/test.jpg" }, { url: "invalid" }]) {
    assert.equal(isVerifiedComparisonImage(product.slug, { ...image, ...invalid }), false)
  }
}
assert.equal(VERIFIED_PRODUCTS.sayl.facts.seat?.status, "conditional")
assert.equal(VERIFIED_PRODUCTS.freedom.facts.headrest?.status, "conditional")
assert.match(VERIFIED_PRODUCTS.freedom.facts.headrest!.value, /not included on Freedom Task/)
assert.match(VERIFIED_PRODUCTS["cosm-high"].modelScope, /configuration.*family/)
const summaries = new Set<string>(), conditions = new Set<string>()
for (const slug of VERIFIED_COMPARISON_PILOT_SLUGS.slice(9)) {
  const pilot = getVerifiedComparisonPilot(slug)!
  assert.equal(newKeys.filter(k => k === pilot.productA || k === pilot.productB).length, 1)
  for (const paragraph of pilot.summary) { assert.ok(!summaries.has(paragraph), "repeated batch summary"); summaries.add(paragraph) }
  for (const condition of pilot.conditions) { assert.ok(!conditions.has(condition.body), "repeated batch selection prose"); conditions.add(condition.body) }
  const prose = JSON.stringify({ title: pilot.title, description: pilot.description, summary: pilot.summary, conditions: pilot.conditions, checkItems: pilot.checkItems })
  assert.doesNotMatch(prose, /winner|\bbest\b|buy now|you should buy|pain relief|corrects posture|\$\d|\d[ -]year warranty|\bstars\b/i)
}
const component = readFileSync("components/compare/verified-comparison.tsx", "utf8")
assert.doesNotMatch(component, /aria-label="Scrollable chair comparison table"/)
assert.match(component, /tabIndex=\{0\} data-testid="desktop-comparison-table"/)
assert.match(component, /<table aria-labelledby="at-a-glance"/)
assert.match(component, /scope="col"/)
assert.match(component, /scope="row"/)
assert.match(component, /<span aria-hidden="true">→<\/span>/)
console.log("batch-two scope, provenance, options, media eligibility and table semantics tests passed")
