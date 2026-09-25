import assert from "node:assert/strict"
import { displayPrice, displayPriceSecondary, formatPriceAmount, formatPriceNote, formatPriceSecondary, priceProvenance, type PriceProvenance } from "../lib/products/price-provenance"

// Every entry carries a source and a checked date; numbers match their type.
for (const [slug, p] of Object.entries(priceProvenance)) {
  assert.ok(p.sourceLabel.length > 0, `${slug}: sourceLabel missing`)
  assert.match(p.checkedOn, /^\d{4}-\d{2}-\d{2}$/, `${slug}: checkedOn must be an ISO date`)
  if (p.sourceUrl) assert.ok(p.sourceUrl.startsWith("https://"), `${slug}: sourceUrl must be https`)
  if (p.priceType === "regular") {
    assert.ok(p.regularMinUsd! > 0 && p.regularMinUsd! <= p.regularMaxUsd!, `${slug}: invalid regular range`)
    for (const v of p.variants ?? []) assert.ok(v.regularMinUsd > 0 && v.regularMinUsd <= v.regularMaxUsd, `${slug}: invalid ${v.label} range`)
  }
  if (p.priceType === "sale") assert.ok(p.saleMinUsd! > 0 && p.saleMinUsd! <= p.regularMinUsd!, `${slug}: sale must be at or below list`)
  if (p.priceType === "converted") {
    assert.ok(p.localCurrency && p.localMin! > 0 && p.localMin! <= p.localMax!, `${slug}: invalid local price`)
    assert.ok(p.fxRate! > 0 && p.fxSource && p.fxDate, `${slug}: converted prices need rate, source and date`)
    assert.equal(typeof p.localTaxIncluded, "boolean", `${slug}: state whether the local price includes tax`)
  }
  if (p.priceType === "on_request") assert.equal(p.regularMinUsd, undefined, `${slug}: on_request must not carry a number`)
}

// Display formats
assert.equal(displayPrice("steelcase-leap-v2"), "$1,499 – $2,667")
assert.equal(displayPrice("autonomous-ergochair-pro"), "$499")
assert.equal(displayPrice("noblechairs-hero"), "$399.99 – $699.99")
assert.equal(displayPrice("knoll-barcelona-chair"), "Fabric $5,550–7,170 · Leather $8,327–12,725")
assert.equal(displayPrice("nouhaus-ergo3d"), "$299.99")
assert.equal(formatPriceNote(priceProvenance["nouhaus-ergo3d"]), "sale price · list $499.99 · as of Sep 2026")
assert.equal(formatPriceNote(priceProvenance["knoll-womb-chair"]), "Standard size, chair only · varies by configuration · as of Sep 2026")
// Converted prices lead with the official local price; USD is the small reference.
assert.equal(displayPrice("okamura-contessa-ii"), "¥244,310 – ¥391,820")
assert.equal(displayPriceSecondary("okamura-contessa-ii"), "≈ $1,540 – $2,470")
assert.equal(displayPrice("kokuyo-ing-cloud"), "¥246,180 – ¥266,860")
assert.equal(displayPriceSecondary("kokuyo-ing-cloud"), "≈ $1,550 – $1,680")
assert.equal(displayPrice("itoki-act2"), "¥132,240")
assert.equal(displayPriceSecondary("itoki-act2"), "≈ $830")
assert.equal(formatPriceNote(priceProvenance["kokuyo-ing-cloud"]), "≈ $1,550 – $1,680 · Japan retail, tax incl. · chair only, with or without headrest · as of Sep 2026")
assert.equal(displayPriceSecondary("steelcase-leap-v2"), null, "USD prices have no secondary label")
assert.equal(displayPrice("wilkhahn-on"), "Price on request")
assert.equal(displayPrice("kokuyo-ing"), "¥119,790 – ¥183,150")
assert.equal(displayPriceSecondary("kokuyo-ing"), "≈ $750 – $1,150", "must match the ing Cloud blog table")
assert.equal(Object.keys(priceProvenance).length, 19, "3 hubs + 15 selected products + Kokuyo ing")
assert.equal(displayPrice("steelcase-series-1"), null, "products without provenance keep their catalog price")
assert.equal(displayPrice(undefined), null)

const converted: PriceProvenance = { priceType: "converted", localCurrency: "JPY", localMin: 158850, localMax: 238275, localTaxIncluded: true, fxRate: 158.85, fxSource: "ECB", fxDate: "2026-09-24", sourceLabel: "Maker JP", checkedOn: "2026-09-25" }
assert.equal(formatPriceAmount(converted), "¥158,850 – ¥238,275")
assert.equal(formatPriceSecondary(converted), "≈ $1,000 – $1,500")
assert.equal(formatPriceNote(converted), "≈ $1,000 – $1,500 · Japan retail, tax incl. · as of Sep 2026")

console.log("price provenance tests passed")
