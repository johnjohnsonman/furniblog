const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")
const { load } = require("cheerio")
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })
const apply = process.argv.includes("--apply")

const plans = [
  { a: "x-chair-x4", b: "x-chair-x3", slug: "x-chair-x4-vs-x-chair-x3", angle: "upholstered executive configuration versus woven-fabric task-chair configuration", aCase: "Shortlist the X4 when the exact leather, headrest and optional comfort-feature package is the reason to buy.", bCase: "Shortlist the X3 when its woven upholstery and selected task-chair controls better match the workspace." },
  { a: "gtplayer-gaming-footrest", b: "homall-racing", slug: "gtplayer-footrest-vs-homall-racing-gaming-chair", angle: "two budget racing-style chairs with seller-sensitive configurations", aCase: "Shortlist the GTPLAYER when the selected listing includes the footrest and support accessories you require.", bCase: "Shortlist the Homall when its exact dimensions, upholstery and recline package provide the simpler fit." },
  { a: "homall-executive", b: "la-z-boy-bellamy", slug: "homall-executive-vs-la-z-boy-bellamy", angle: "budget racing-executive styling versus a padded executive-chair format", aCase: "Shortlist the Homall when lower entry price and the exact VCH-81-style configuration are the priorities.", bCase: "Shortlist the Bellamy when its selected upholstery, padding and executive-chair dimensions are preferred." },
  { a: "libernovo-omni", b: "sihoo-doro-s300", slug: "libernovo-omni-vs-sihoo-doro-s300", angle: "two movement-oriented chairs with different back-support and recline concepts", aCase: "Shortlist the Omni when its selected dynamic back and recline configuration is the core requirement.", bCase: "Shortlist the Doro S300 when its split-lumbar and gravity-assisted recline layout is the better documented fit." },
]

function esc(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") }
function tagged(url) { const value = new URL(url); value.searchParams.set("tag", "furniblog0e-20"); return value.toString() }
function amazonUrls() {
  const source = fs.readFileSync(path.resolve(__dirname, "../lib/data/affiliate-links-data.ts"), "utf8")
  const urls = new Map(); let current = null
  for (const line of source.split(/\r?\n/)) {
    const key = line.match(/^\s*"([^"]+)"\s*:\s*\[/); if (key) current = key[1]
    const url = line.match(/https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}/i)
    if (current && url) { urls.set(current, url[0]); current = null }
  }
  return urls
}
function html(a, b, plan, links) {
  const row = (label, av, bv) => `<tr><th scope="row">${esc(label)}</th><td>${esc(av)}</td><td>${esc(bv)}</td></tr>`
  return `<p data-furniblog-research-note="true"><strong>Research note:</strong> This comparison uses published catalog and retailer information. It is not a hands-on Furniblog test, and marketplace configurations can change.</p>
<h2>Quick decision</h2><p>This comparison covers ${esc(plan.angle)}. Neither model is automatically better: the decision depends on body and desk fit, required controls, seller terms and the exact selected variant.</p>
<div class="cp-table-scroll"><table><caption>${esc(a.name)} and ${esc(b.name)} purchase checklist</caption><thead><tr><th scope="col">Decision point</th><th scope="col">${esc(a.name)}</th><th scope="col">${esc(b.name)}</th></tr></thead><tbody>${row("Published positioning", a.description_en.split("This page brings")[0], b.description_en.split("This page brings")[0])}${row("Best-for field", a.best_for || "Verify listing", b.best_for || "Verify listing")}${row("First listed limitation", (a.cons || ["Configuration varies"])[0], (b.cons || ["Configuration varies"])[0])}${row("Purchase destination", "Model-specific Amazon listing", "Model-specific Amazon listing")}</tbody></table></div>
<h2>When ${esc(a.name)} makes more sense</h2><p>${esc(plan.aCase)} Treat this as a shortlist condition and verify all included controls, dimensions and accessories on the live offer.</p>
<h2>When ${esc(b.name)} makes more sense</h2><p>${esc(plan.bCase)} Confirm that the product title, selected options and images all describe the same model before ordering.</p>
<h2>Fit checks that matter</h2><p>Compare the listed seat-height range with the desk, seat depth with leg length, armrest range with keyboard position and the complete chair footprint with the room. Capacity is not a comfort or fit guarantee.</p>
<h2>Listing and seller checks</h2><p>Marketplace pages can group colors, upholstery and feature packages. Recheck the title, selected option, condition, seller, delivery date and included parts after every variant change. Save the final configuration shown at checkout.</p>
<h2>Price, warranty and returns</h2><p>Use live listings for current price and stock. Confirm who provides warranty service, whether return shipping or restocking costs apply and whether assembly affects return eligibility. Furniblog does not verify seller authorization.</p>
<h2>Sources and current offers</h2><ul><li><a href="${tagged(links.get(a.slug))}" rel="nofollow sponsored noopener noreferrer">${esc(a.name)} Amazon listing</a></li><li><a href="${tagged(links.get(b.slug))}" rel="nofollow sponsored noopener noreferrer">${esc(b.name)} Amazon listing</a></li></ul><p>Continue to the <a href="/products/${esc(a.slug)}">${esc(a.name)} product record</a> or <a href="/products/${esc(b.slug)}">${esc(b.name)} product record</a> for related comparisons and current purchase links.</p>`
}

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const slugs = [...new Set(plans.flatMap(plan => [plan.a, plan.b]))]
  const links = amazonUrls(); for (const slug of slugs) assert.ok(links.has(slug), `${slug}: direct Amazon URL required`)
  const { data: products, error } = await s.from("products").select("id,slug,name,description_en,best_for,pros,cons,thumbnail_url").in("slug", slugs)
  if (error) throw error
  assert.equal(products.length, slugs.length)
  const bySlug = new Map(products.map(product => [product.slug, product]))
  const { data: existing, error: existingError } = await s.from("comparisons").select("id,slug,product_a_id,product_b_id,status,content_html,updated_at").in("slug", plans.map(plan => plan.slug))
  if (existingError) throw existingError
  const creates = plans.filter(plan => !existing.some(row => row.slug === plan.slug)).map(plan => {
    const a = bySlug.get(plan.a); const b = bySlug.get(plan.b); const content = html(a, b, plan, links); const $ = load(content, null, false)
    assert.ok($.text().trim().split(/\s+/).length >= 230); assert.equal($("h2").length, 7); assert.equal($("table caption").length, 1)
    return { slug: plan.slug, title: `${a.name} vs ${b.name}: Which Should You Buy?`, subtitle: `Compare ${plan.angle}.`, excerpt: `${a.name} and ${b.name} compared by fit, configuration, seller terms and purchase checks.`, seo_title: `${a.name} vs ${b.name}: Buying Comparison`.slice(0, 65), seo_description: `Compare ${a.name} vs ${b.name} by fit, configuration, seller, warranty, returns and current Amazon listing checks.`.slice(0, 165), hero_image_url: a.thumbnail_url, content_html: content, product_a_id: a.id, product_b_id: b.id, tier: "value", collections: ["buying-guides"], featured: false, status: "published", gen_status: "done", faq: [{ q: `Which should I buy, ${a.name} or ${b.name}?`, a: "Choose by required controls, dimensions, exact configuration and seller terms rather than the model name alone." }, { q: "Are marketplace variants identical?", a: "No. Recheck the selected upholstery, accessories, seller, condition and included controls." }, { q: "Are prices shown by Furniblog live?", a: "No. Use the retailer page for current price, stock, delivery, warranty and returns." }], published_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  })
  const updates = existing.map(row => {
    const plan = plans.find(item => item.slug === row.slug); const content_html = html(bySlug.get(plan.a), bySlug.get(plan.b), plan, links)
    return { row, content_html }
  }).filter(item => item.row.content_html !== item.content_html)
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", planned: plans.length, existing: existing.map(row => row.slug), creates: creates.map(row => row.slug), updates: updates.map(item => item.row.slug) }, null, 2))
  if (!apply || (!creates.length && !updates.length)) return
  const dir = path.resolve(__dirname, "backups"); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, `revenue-comparisons-wave2-${Date.now()}.json`), JSON.stringify({ existing }, null, 2), { flag: "wx" })
  let created = []
  if (creates.length) { const result = await s.from("comparisons").insert(creates).select("id,slug"); if (result.error) throw result.error; created = result.data }
  for (const item of updates) { const result = await s.from("comparisons").update({ content_html: item.content_html, updated_at: new Date().toISOString() }).eq("id", item.row.id).eq("updated_at", item.row.updated_at).select("id").single(); if (result.error) throw result.error }
  console.log(JSON.stringify({ created: created.length, updated: updates.length, slugs: created.map(row => row.slug) }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
