import assert from "node:assert/strict"
import {
  getPilotSources,
  getVerifiedComparisonPilot,
  VERIFIED_COMPARISON_PILOT_SLUGS,
} from "../lib/comparisons/verified-pilots"
import { getVerifiedFact, VERIFIED_PRODUCTS } from "../lib/comparisons/verified-products"

assert.equal(VERIFIED_COMPARISON_PILOT_SLUGS.length, 9, "verified comparison set must contain the five pilots and four approved expansion pages")
assert.equal(new Set(VERIFIED_COMPARISON_PILOT_SLUGS).size, 9, "verified comparison slugs must be unique")

const approvedExpansionOrder = new Map([
  ["herman-miller-aeron-vs-steelcase-gesture-which-should-you-buy-ms42k2uo", ["aeron", "gesture"]],
  ["steelcase-leap-v2-vs-herman-miller-embody-which-should-you-buy-mstsjr00", ["leap", "embody"]],
  ["steelcase-leap-v2-vs-herman-miller-mirra-2-which-should-you-buy-mt0xr0o4", ["leap", "mirra-2"]],
  ["herman-miller-mirra-2-vs-steelcase-gesture-which-should-you-buy-msfi63em", ["mirra-2", "gesture"]],
] as const)

const titles = new Set<string>()
const descriptions = new Set<string>()
const summaries = new Set<string>()
const productSlugs = new Set(Object.values(VERIFIED_PRODUCTS).map((record) => record.slug))

assert.equal(productSlugs.size, Object.keys(VERIFIED_PRODUCTS).length, "verified product slugs must be unique")

for (const slug of VERIFIED_COMPARISON_PILOT_SLUGS) {
  const pilot = getVerifiedComparisonPilot(slug)
  assert.ok(pilot, `missing pilot: ${slug}`)
  if (approvedExpansionOrder.has(slug as never)) {
    assert.deepEqual([pilot.productA, pilot.productB], approvedExpansionOrder.get(slug as never), `product order mismatch: ${slug}`)
  }
  assert.ok(!/which should you buy|winner|best choice|most comfortable/i.test(pilot.title), `unsafe title: ${slug}`)
  assert.ok(!/which should you buy|winner|best choice|most comfortable/i.test(pilot.description), `unsafe description: ${slug}`)
  assert.ok(pilot.summary.length >= 1 && pilot.summary.length <= 2, `summary must stay concise: ${slug}`)
  assert.ok(pilot.checkItems.length >= 4, `in-person checklist incomplete: ${slug}`)
  assert.equal(new Set(pilot.checkItems).size, pilot.checkItems.length, `duplicate in-person checklist item: ${slug}`)
  assert.ok(pilot.rows.length >= 3, `comparison rows incomplete: ${slug}`)
  const sources = getPilotSources(pilot)
  assert.ok(sources.length >= 2, `official sources missing: ${slug}`)

  for (const source of sources) {
    assert.match(source.url, /^https:\/\/(?:www\.|store\.)?(?:hermanmiller|steelcase)\.com\//, `non-manufacturer source: ${source.url}`)
    assert.match(source.checkedOn, /^\d{4}-\d{2}-\d{2}$/, `invalid check date: ${source.id}`)
  }

  for (const row of pilot.rows) {
    for (const fact of [getVerifiedFact(pilot.productA, row.fact), getVerifiedFact(pilot.productB, row.fact)]) {
      for (const sourceId of fact?.sourceIds ?? []) {
        assert.ok(sources.some((source) => source.id === sourceId), `fact source not included ${sourceId}: ${slug}`)
      }
    }
  }

  assert.ok(!titles.has(pilot.title), `duplicate title: ${pilot.title}`)
  assert.ok(!descriptions.has(pilot.description), `duplicate description: ${pilot.description}`)
  const summary = pilot.summary.join(" ")
  assert.ok(!summaries.has(summary), `duplicate summary: ${slug}`)
  for (const relatedSlug of pilot.relatedComparisonSlugs) {
    assert.notEqual(relatedSlug, slug, `self-referencing related comparison: ${slug}`)
    assert.ok(VERIFIED_COMPARISON_PILOT_SLUGS.includes(relatedSlug), `unknown related comparison: ${relatedSlug}`)
  }
  titles.add(pilot.title)
  descriptions.add(pilot.description)
  summaries.add(summary)
}

assert.equal(getVerifiedComparisonPilot("not-a-pilot"), null, "non-pilot pages must use the existing safety path")

for (const record of Object.values(VERIFIED_PRODUCTS)) {
  for (const fact of Object.values(record.facts)) {
    assert.ok(fact.sourceIds.length > 0, `${record.name} has a public fact without a source`)
  }
}

const publicText = JSON.stringify(VERIFIED_COMPARISON_PILOT_SLUGS.map((slug) => getVerifiedComparisonPilot(slug)))
assert.doesNotMatch(publicText, /\$\s?\d|\b\d+[- ]year warranty\b|winner|best choice|better for everyone|most comfortable|back pain|pain relief/i)
console.log("verified comparison pilot tests passed")
