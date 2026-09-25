import assert from "node:assert/strict"
import { VERIFIED_COMPARISON_PILOT_SLUGS, getVerifiedComparisonPilot } from "../lib/comparisons/verified-pilots"
import { getComparisonEditorial, COMPARISON_EDITORIAL } from "../lib/comparisons/editorial"
const texts = new Set<string>()
assert.equal(Object.keys(COMPARISON_EDITORIAL).length, 15)
for (const slug of VERIFIED_COMPARISON_PILOT_SLUGS) {
  const pilot = getVerifiedComparisonPilot(slug)!
  const edit = getComparisonEditorial(pilot.productA, pilot.productB)
  assert.ok(edit, slug)
  assert.equal(edit.questions.length, 3, slug)
  for (const note of edit.questions) {
    assert.ok(note.body.length > 100)
    assert.ok(!texts.has(note.body), `Repeated explanation: ${slug}`)
    texts.add(note.body)
    assert.ok(note.sourceIds.length >= 2)
    for (const id of note.sourceIds) assert.ok(pilot.sourceIds.includes(id), `Missing source ${id}: ${slug}`)
  }
  assert.ok(edit.request.length > 70)
  assert.doesNotMatch(JSON.stringify(edit), /\$\d|pain relief|we tested|we sat|winner|\d+[- ]year warranty/i)
}
console.log("15 unique editorial records / 45 sourced explanations passed")
