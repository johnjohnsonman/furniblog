const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const { isDeepStrictEqual } = require("node:util")
const { createClient } = require("@supabase/supabase-js")
const { load } = require("cheerio")
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })
const apply = process.argv.includes("--apply")

const wombSource = "https://www.knoll.com/design-plan/product/womb-chair"
const wombStore = "https://www.knoll.com/shop/en_us/living-lounge-chairs/womb-chair-standard/100205852.html"
const wombSheet = "https://www.knoll.com/document/1352940815041/Knoll_WombChairOttoman_Cutsheet.pdf"
const barcelonaSource = "https://www.knoll.com/design-plan/product/barcelona-chair"

function wombHtml(images) {
  return `<p data-furniblog-research-note="true"><strong>Research note:</strong> This buying guide uses current Knoll product information and dimension documents. It is not a Furniblog hands-on test, comfort guarantee or authentication service.</p>
<h2>Womb Chair in one minute</h2><p>The Womb Chair is fixed lounge seating designed by Eero Saarinen for Knoll, not an adjustable desk chair. Its purchase case is the enveloping shell, recognizable design and choice of upholstery. Buyers needing seat-height, lumbar, arm or recline adjustments should compare task chairs instead.</p>
<h2>Standard and medium dimensions</h2><p><a href="${wombSource}">Knoll lists</a> the standard 70L chair at 40 inches wide, 34 inches deep and 35.5 inches high, with a 16-inch seat height. The 70LM medium is listed at 35 inches wide, 31 inches deep and 31.25 inches high, with a 15-inch seat height. Use the current regional specification for the item being ordered.</p>
<div class="cp-table-scroll"><table><caption>Published Knoll Womb Chair dimensions</caption><thead><tr><th scope="col">Version</th><th scope="col">Width</th><th scope="col">Depth</th><th scope="col">Height</th><th scope="col">Seat height</th></tr></thead><tbody><tr><th scope="row">Standard 70L</th><td>40 in</td><td>34 in</td><td>35.5 in</td><td>16 in</td></tr><tr><th scope="row">Medium 70LM</th><td>35 in</td><td>31 in</td><td>31.25 in</td><td>15 in</td></tr></tbody></table></div>
<h2>Configuration and room-fit checks</h2><p>Choose the chair size, upholstery and base finish from the actual seller configuration. Measure the full footprint and circulation space rather than comparing seat width alone. If adding an ottoman, use the matching size shown in the <a href="${wombSheet}">Knoll dimension sheet</a> and include that footprint in the room plan.</p>
<h2>What the standard store listing establishes</h2><p>The <a href="${wombStore}">current Knoll US standard-chair listing</a> identifies the product as fully assembled and publishes dimensions, product weight, capacity and a five-year warranty subject to terms. Those details apply to that listing and date; do not transfer them automatically to vintage, used, medium-size or marketplace offers.</p>
<h2>Authenticity, condition and seller</h2><p>A product title, silhouette or high price is not proof of an authentic Knoll chair. For a new purchase, verify the manufacturer and seller through Knoll's channels. For a used chair, request provenance, labels, detailed photographs, repair history and upholstery information. Furniblog does not authenticate furniture.</p>
<h2>Using the Amazon search link</h2><p>The Amazon button intentionally opens search results because a stable, exact Knoll offer is not confirmed. Results can include replicas, similar chairs, covers, ottomans or used items. Check manufacturer, contents, size, condition, seller, delivery and returns before checkout.</p>
<h2>Womb Chair vs Barcelona Chair</h2><p>Both are fixed lounge designs rather than task chairs, but they differ in shape, dimensions and configuration choices. <a href="/compare/knoll-womb-chair-vs-knoll-barcelona-chair">Compare the Womb Chair and Barcelona Chair</a>, or read the <a href="/chairpedia/knoll-barcelona-chair">Barcelona Chair buying guide</a> for its frame, cushion and provenance checks.</p>
<h2>Bottom line</h2><p>Shortlist the Womb Chair for a lounge setting only after confirming size, finish, seller and provenance. Do not buy it as a substitute for an adjustable office chair, and do not use a marketplace result as evidence that the item is an authentic Knoll product.</p>${images ? `<section id="original-images">${images}</section>` : ""}`
}

function comparisonHtml() {
  return `<p data-furniblog-research-note="true"><strong>Research note:</strong> This comparison uses current Knoll documentation. It is not a hands-on Furniblog test or an authentication service.</p>
<h2>Quick decision</h2><p>Choose between these chairs by intended room, footprint, construction and configuration. Neither is an adjustable office chair, and neither should be selected for prolonged computer work on the basis of its design reputation.</p>
<div class="cp-table-scroll"><table><caption>Womb Chair and Barcelona Chair buying comparison</caption><thead><tr><th scope="col">Decision point</th><th scope="col">Womb Chair</th><th scope="col">Barcelona Chair</th></tr></thead><tbody><tr><th scope="row">Form</th><td>Upholstered shell with integrated arms</td><td>Exposed cross-frame with separate cushions</td></tr><tr><th scope="row">Standard footprint</th><td>40 W x 34 D x 35.5 H inches</td><td>Verify the current Knoll configuration</td></tr><tr><th scope="row">Adjustments</th><td>None</td><td>None</td></tr><tr><th scope="row">Primary check</th><td>Chair and optional ottoman size</td><td>Frame, cushion and provenance</td></tr></tbody></table></div>
<h2>When the Womb Chair makes more sense</h2><p>Its enclosed shell and wider standard footprint suit a dedicated lounge or reading area where the selected upholstery and room scale work together. Compare standard and medium measurements before ordering.</p>
<h2>When the Barcelona Chair makes more sense</h2><p>Its exposed frame and separate cushions create a different architectural presence. Verify the exact frame finish, cushion specification and seller provenance rather than choosing from a similar silhouette.</p>
<h2>Fit and use</h2><p>Both chairs have fixed geometry. Measure seat height against the user and intended tables, then allow circulation around the complete footprint. Personal comfort cannot be established from dimensions or published descriptions alone.</p>
<h2>Seller, condition and authenticity</h2><p>Use Knoll's channels for current official configurations. Marketplace results may include replicas, accessories and used inventory. Furniblog does not authenticate listings; request provenance and condition evidence before paying a premium.</p>
<h2>Price, warranty and returns</h2><p>Prices and terms change by region, upholstery, seller and condition. Compare like-for-like configurations and confirm delivery, return freight and applicable warranty on the exact offer.</p>
<h2>Sources and next steps</h2><ul><li><a href="${wombSource}" rel="nofollow noopener noreferrer">Knoll Womb Chair product information</a></li><li><a href="${wombSheet}" rel="nofollow noopener noreferrer">Knoll Womb Chair dimension sheet</a></li><li><a href="${barcelonaSource}" rel="nofollow noopener noreferrer">Knoll Barcelona Chair product information</a></li></ul><p>Continue with the <a href="/chairpedia/knoll-womb-chair">Womb Chair guide</a> or the <a href="/chairpedia/knoll-barcelona-chair">Barcelona Chair guide</a>.</p>`
}

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const slugs = ["knoll-womb-chair", "knoll-barcelona-chair", "herman-miller-eames-executive-chair", "herman-miller-eames-molded-plastic-armchair", "andaseat-kaiser-3", "humanscale-freedom-task-chair", "steelcase-gesture"]
  const { data: rows, error } = await s.from("chairpedia").select("*").in("slug", slugs)
  if (error) throw error
  assert.equal(rows.length, slugs.length)
  const bySlug = new Map(rows.map(row => [row.slug, row]))
  const womb = bySlug.get("knoll-womb-chair")
  const barcelona = bySlug.get("knoll-barcelona-chair")
  assert.ok(womb.product_id && barcelona.product_id)
  const wombDom = load(womb.content_html || "", null, false)
  const images = wombDom("img").toArray().map(el => wombDom.html(el)).join("")
  const updates = [{ row: womb, patch: {
    content_html: wombHtml(images), title: "Knoll Womb Chair: Dimensions, Options and Buying Guide",
    subtitle: "Official dimensions, configuration and provenance checks for lounge-chair buyers.",
    excerpt: "Compare Knoll Womb Chair sizes, room fit, configuration, provenance and seller terms using official sources.",
    seo_title: "Knoll Womb Chair: Dimensions, Sizes and Buying Guide",
    seo_description: "Compare Knoll Womb Chair standard and medium dimensions, configuration, room fit, provenance and buying checks using official Knoll sources.",
    gen_sources: [wombSource, wombStore, wombSheet],
  }}]
  const molded = bySlug.get("herman-miller-eames-molded-plastic-armchair")
  assert.ok(molded.product_id === null || molded.product_id === bySlug.get("herman-miller-eames-executive-chair").product_id)
  updates.push({ row: molded, patch: { product_id: null } })
  const replacements = {
    "andaseat-kaiser-3": [/some reviewers found it less immediately comfortable than a strap-on pillow/i, "published reviews describe mixed preferences compared with a strap-on pillow"],
    "humanscale-freedom-task-chair": [/reviewers found this genuinely usable for computing tasks at about 75% recline/ig, "published reviews describe this as usable for some computing tasks while reclined"],
    "steelcase-gesture": [/some long-term reviewers note they're fine for contact but not as plush as dedicated armrest padding found on executive leather chairs/ig, "published long-term reviews describe the pads as less plush than some executive-chair armrests"],
  }
  for (const [slug, [pattern, replacement]] of Object.entries(replacements)) {
    const row = bySlug.get(slug)
    assert.ok(pattern.test(row.content_html) || row.content_html.includes(replacement), `${slug}: expected source or replacement text`)
    updates.push({ row, patch: { content_html: row.content_html.replace(pattern, replacement) } })
  }
  const gesture = updates.find(item => item.row.slug === "steelcase-gesture")
  gesture.patch.content_html = gesture.patch.content_html.replace(/One of the things reviewers like is that the Gesture ships fully assembled/gi, "Published product information states that the Gesture ships fully assembled")
  for (const item of updates) item.changed = Object.entries(item.patch).some(([key, value]) => !isDeepStrictEqual(item.row[key], value))

  const pair = [womb.product_id, barcelona.product_id].sort()
  const { data: existing, error: comparisonError } = await s.from("comparisons").select("*")
    .or(`and(product_a_id.eq.${pair[0]},product_b_id.eq.${pair[1]}),and(product_a_id.eq.${pair[1]},product_b_id.eq.${pair[0]}),slug.eq.knoll-womb-chair-vs-knoll-barcelona-chair`)
  if (comparisonError) throw comparisonError
  assert.ok(existing.length <= 1, "Unexpected duplicate Womb/Barcelona comparisons")
  const comparison = existing[0] || {
    slug: "knoll-womb-chair-vs-knoll-barcelona-chair", title: "Knoll Womb Chair vs Barcelona Chair: Which Should You Buy?",
    subtitle: "Compare two fixed Knoll lounge icons by footprint, form and purchase checks.",
    excerpt: "A source-based Womb Chair and Barcelona Chair comparison covering dimensions, use, provenance and seller checks.",
    seo_title: "Knoll Womb Chair vs Barcelona Chair: Buying Comparison",
    seo_description: "Compare the Knoll Womb Chair vs Barcelona Chair by dimensions, form, room fit, provenance, seller terms and intended use.",
    content_html: comparisonHtml(), product_a_id: womb.product_id, product_b_id: barcelona.product_id,
    tier: "premium", collections: ["buying-guides", "design-icons"], featured: false, status: "published", gen_status: "done",
    faq: [
      { q: "Is the Womb Chair or Barcelona Chair better for desk work?", a: "Neither is an adjustable task chair. Choose purpose-built office seating for prolonged computer work." },
      { q: "Which chair takes more room?", a: "Compare the complete current dimensions, including any ottoman, against the intended room and circulation space." },
      { q: "Can Furniblog authenticate a marketplace listing?", a: "No. Verify the seller and provenance through Knoll or seek qualified authentication for used furniture." },
    ], published_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  const $w = load(updates[0].patch.content_html, null, false); assert.ok($w("h2").length >= 8 && $w("table caption").length === 1)
  const $c = load(comparison.content_html, null, false); assert.ok($c("h2").length >= 7 && $c("table caption").length === 1)
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", updates: updates.map(x => ({ slug: x.row.slug, changed: x.changed })), comparison: existing.length ? "existing" : "create" }, null, 2))
  if (!apply) return
  const pending = updates.filter(x => x.changed)
  const dir = path.resolve(__dirname, "backups"); fs.mkdirSync(dir, { recursive: true })
  if (pending.length || !existing.length) fs.writeFileSync(path.join(dir, `chairpedia-growth-batch-${Date.now()}.json`), JSON.stringify({ rows: pending.map(x => x.row), comparisons: existing }, null, 2), { flag: "wx" })
  for (const { row, patch } of pending) {
    const result = await s.from("chairpedia").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", row.id).eq("updated_at", row.updated_at).select("id").single()
    if (result.error) throw result.error
  }
  if (!existing.length) { const result = await s.from("comparisons").insert(comparison).select("id").single(); if (result.error) throw result.error }
  console.log(JSON.stringify({ updated: pending.length, comparisonCreated: !existing.length }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
