import assert from "node:assert/strict"
import {
  getPilotSources,
  getVerifiedComparisonPilot,
  VERIFIED_COMPARISON_PILOT_SLUGS,
} from "../lib/comparisons/verified-pilots"
import { getVerifiedFact, VERIFIED_PRODUCTS } from "../lib/comparisons/verified-products"

assert.equal(VERIFIED_COMPARISON_PILOT_SLUGS.length, 5, "pilot must remain limited to five comparisons")
assert.equal(new Set(VERIFIED_COMPARISON_PILOT_SLUGS).size, 5, "pilot slugs must be unique")

const titles = new Set<string>()
const descriptions = new Set<string>()

for (const slug of VERIFIED_COMPARISON_PILOT_SLUGS) {
  const pilot = getVerifiedComparisonPilot(slug)
  assert.ok(pilot, `missing pilot: ${slug}`)
  assert.ok(!/which should you buy|winner|best choice|most comfortable/i.test(pilot.title), `unsafe title: ${slug}`)
  assert.ok(!/which should you buy|winner|best choice|most comfortable/i.test(pilot.description), `unsafe description: ${slug}`)
  assert.ok(pilot.rows.some((row) => !getVerifiedFact(pilot.productA, row.fact) || !getVerifiedFact(pilot.productB, row.fact)), `unverified-field state missing: ${slug}`)
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
  titles.add(pilot.title)
  descriptions.add(pilot.description)
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
