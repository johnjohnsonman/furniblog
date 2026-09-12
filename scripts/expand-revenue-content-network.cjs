const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")
const { load } = require("cheerio")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })
const apply = process.argv.includes("--apply")

const topSlugs = [
  "andaseat-kaiser-3", "hbada-p5", "office-star-progrid", "sihoo-doro-s300",
  "allsteel-acuity", "sidiz-t80", "x-chair-x3", "duorest-alpha",
  "furmax-gaming", "modway-articulate", "ergohuman-classic", "hon-wave",
]

const guidePlans = {
  "allsteel-acuity": {
    focus: "A weight-activated task-chair mechanism is the main reason to consider the Acuity. The purchase decision is less about adding controls and more about whether automatic recline behavior fits the way you work.",
    tradeoff: "Shoppers who prefer to set every recline parameter manually should compare the control layout with a more conventionally adjustable chair before ordering.",
    source: "https://www.allsteeloffice.com",
  },
  "sidiz-t80": {
    focus: "The T80 sits above the T50 in the SIDIZ range. SIDIZ documents a different tilt mechanism, a larger frame, lumbar support, adjustable arms and seat slide-and-slope adjustment.",
    tradeoff: "The backrest follows movement rather than locking at arbitrary angles, so buyers who rely on a fixed recline stop should check the current mechanism description carefully.",
    source: "https://www.sidiz.com/pages/helpcenter",
  },
  "x-chair-x3": {
    focus: "The X3 combines A.T.R. woven fabric with an adjustable backrest, seat depth adjustment, four-direction armrests and the brand's SciFloat recline system.",
    tradeoff: "Headrest, seat and fabric choices can change the final configuration and price. Compare the selected options rather than treating every X3 listing as identical.",
    source: "https://www.xchair.com/products/x3-atr-management-office-chair",
  },
  "duorest-alpha": {
    focus: "The Alpha is organized around two independently moving back pads. Available versions may add a headrest, three-direction arms, seat-depth adjustment and synchronized recline.",
    tradeoff: "The divided back is structurally different from a single mesh or upholstered back. Buyers should decide whether that contact pattern and the selected Alpha variant match their preference.",
    source: "https://duorest.gobizkorea.com/user/goods/frontGoodsDetail.do?goods_no=GS2023072429925",
  },
  "furmax-gaming": {
    focus: "This Furmax model is a budget racing-style chair sold with a high back, removable support cushions and a recline function. Its appeal is a low entry price rather than a long list of task-chair adjustments.",
    tradeoff: "PU upholstery, fixed or limited arm adjustment and seller-specific dimensions matter more than the racing silhouette. Check the exact listing against desk height and room temperature.",
    source: null,
  },
  "modway-articulate": {
    focus: "The Articulate uses a mesh back, padded seat, adjustable arm height and a conventional rolling task-chair base. It targets shoppers comparing simple office-chair functions at a lower price.",
    tradeoff: "Listings can differ in color and upholstery, and lumbar support is integrated rather than independently adjustable. Confirm dimensions and capacity on the chosen listing.",
    source: "https://modway.com/products/articulate-ergonomic-mesh-office-chair",
  },
  "ergohuman-classic": {
    focus: "Ergohuman Classic configurations are known for a segmented back and lumbar area, synchronized tilt, seat-depth adjustment and adjustable arms; upholstery and headrest options vary by market.",
    tradeoff: "The Ergohuman name covers several generations and regional variants. Match the model code and included controls before comparing price or warranty.",
    source: "https://ergo-human.com/ergohuman-office-chair/",
  },
  "hon-wave": {
    focus: "HON sells Wave variants in mid-back and high-back forms with different seat materials and control packages. Mesh back, tilt controls and adjustable-arm availability depend on the model code.",
    tradeoff: "Do not transfer specifications from one Wave SKU to another. The model code, upholstery, arm package and weight rating should all match the listing being purchased.",
    source: "https://www.hon.com/chairs/wave/hvl701sb11",
  },
}

const comparisonPlans = [
  {
    a: "andaseat-kaiser-3", b: "furmax-gaming", slug: "andaseat-kaiser-3-vs-furmax-gaming-chair",
    angle: "large-format adjustability versus entry-price simplicity",
    aCase: "Choose the Kaiser 3 when a larger frame, four-direction arms and a broader recline range are central requirements.",
    bCase: "Choose the Furmax when the priority is a lower purchase price and a straightforward racing-style chair.",
  },
  {
    a: "hbada-p5", b: "modway-articulate", slug: "hbada-p5-vs-modway-articulate",
    angle: "footrest-and-headrest features versus a simpler mesh task-chair layout",
    aCase: "Choose the P5 when a headrest, adjustable lumbar area and retractable footrest are required features on the exact listing.",
    bCase: "Choose the Articulate when a simpler mesh-back task chair with a padded seat and adjustable arm height is the better fit.",
  },
  {
    a: "office-star-progrid", b: "hon-wave", slug: "office-star-progrid-vs-hon-wave",
    angle: "two established mesh office-chair families with configuration-sensitive specifications",
    aCase: "Choose the ProGrid when its selected seat, arm and ProGrid-back configuration matches the required desk setup.",
    bCase: "Choose the Wave when the exact HON model code provides the preferred back height, upholstery and tilt package.",
  },
  {
    a: "sihoo-doro-s300", b: "duorest-alpha", slug: "sihoo-doro-s300-vs-duorest-alpha",
    angle: "a split-lumbar recline concept versus an independently divided dual-back design",
    aCase: "Choose the Doro S300 when its recline behavior and split lumbar assembly are the main reasons for the purchase.",
    bCase: "Choose the Duorest Alpha when independently moving back pads and the selected Alpha control package are preferred.",
  },
]

const existingGuideSourceRepairs = {
  "sihoo-doro-s300": "https://de.sihoooffice.com/nl-nl/products/sihoo-doro-s300-gravity-defying-ergonomic-chair",
  "office-star-progrid": "https://media.officestar.net/Commercial/Pro-line_II/ProGrid/Documents/98346_Spec_Sheet_1.pdf",
}

function esc(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function directAmazonUrls() {
  const source = fs.readFileSync(path.resolve(__dirname, "../lib/data/affiliate-links-data.ts"), "utf8")
  const urls = new Map()
  let current = null
  for (const line of source.split(/\r?\n/)) {
    const key = line.match(/^\s*"([^"]+)"\s*:\s*\[/)
    if (key) current = key[1]
    const url = line.match(/https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}/i)
    if (current && url) { urls.set(current, url[0]); current = null }
  }
  return urls
}

function guideHtml(product, plan, comparisonSlug) {
  const pros = (product.pros || []).slice(0, 3).map((v) => `<li>${esc(v)}</li>`).join("")
  const cons = (product.cons || []).slice(0, 2).map((v) => `<li>${esc(v)}</li>`).join("")
  return [
    `<p data-furniblog-research-note="true"><strong>Research note:</strong> This guide summarizes published manufacturer or retailer information and Furniblog catalog data. It is not presented as a hands-on Furniblog test.</p>`,
    `<h2>What distinguishes the ${esc(product.name)}</h2><p>${esc(plan.focus)}</p>`,
    `<h2>Who should shortlist it?</h2><p>The ${esc(product.name)} may suit shoppers looking for ${esc((product.best_for || "the listed feature set").toLowerCase())}. That is a screening criterion, not a universal comfort claim: body dimensions, desk height and the exact configuration still determine fit.</p>`,
    `<h2>Features and limitations to verify</h2><div class="cp-table-scroll"><table><caption>${esc(product.name)} purchase checklist</caption><thead><tr><th scope="col">Potential reasons to shortlist</th><th scope="col">Items to verify</th></tr></thead><tbody><tr><td><ul>${pros || "<li>Model-specific feature set</li>"}</ul></td><td><ul>${cons || "<li>Seller and configuration details</li>"}<li>Dimensions, included controls and assembly</li><li>Warranty and return terms for the selected seller</li></ul></td></tr></tbody></table></div>`,
    `<h2>The main trade-off</h2><p>${esc(plan.tradeoff)}</p>`,
    `<h2>Before buying</h2><p>Open the current retailer page and match the full model name, upholstery, armrests, headrest or footrest, dimensions and stated capacity. Prices and availability change, and marketplace listings may combine variants. Keep a copy of the selected configuration and return policy before checkout.</p>`,
    `<h2>Compare alternatives</h2><p><a href="/compare/${comparisonSlug}">Open the paired ${esc(product.name)} buying comparison</a>, then return to the <a href="/products/${esc(product.slug)}">${esc(product.name)} product record</a> for current purchase links.</p>`,
  ].join("\n")
}

function comparisonHtml(a, b, plan, sources) {
  const rows = [
    ["Positioning", a.best_for || "Check model details", b.best_for || "Check model details"],
    ["Published summary", a.description_en.split("This page brings together")[0].trim(), b.description_en.split("This page brings together")[0].trim()],
    ["Key limitation", (a.cons || ["Configuration varies"])[0], (b.cons || ["Configuration varies"])[0]],
    ["Typical listed price", a.price_usd ? `About $${a.price_usd}; verify live price` : "Verify live price", b.price_usd ? `About $${b.price_usd}; verify live price` : "Verify live price"],
  ]
  return [
    `<p data-furniblog-research-note="true"><strong>Research note:</strong> This comparison uses published product information and catalog records. Furniblog has not claimed a hands-on test of either chair.</p>`,
    `<h2>Quick decision</h2><p>This is a comparison of ${esc(plan.angle)}. Neither chair is automatically better for every body or workspace.</p>`,
    `<div class="cp-table-scroll"><table><caption>${esc(a.name)} and ${esc(b.name)} at a glance</caption><thead><tr><th scope="col">Decision point</th><th scope="col">${esc(a.name)}</th><th scope="col">${esc(b.name)}</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`,
    `<h2>When the ${esc(a.name)} makes more sense</h2><p>${esc(plan.aCase)} Confirm the exact dimensions and included options before treating this as the deciding factor.</p>`,
    `<h2>When the ${esc(b.name)} makes more sense</h2><p>${esc(plan.bCase)} Confirm the exact dimensions and included options before treating this as the deciding factor.</p>`,
    `<h2>Fit and configuration checks</h2><p>Compare minimum and maximum seat height with the desk, seat depth with leg length, armrest range with keyboard position, and the available recline controls. Marketplace titles can group colors or configurations, so check the selected variant after every option change.</p>`,
    `<h2>Price, warranty and returns</h2><p>Use the live retailer pages rather than the catalog price as the final quote. Seller identity, condition, delivery, assembly, warranty coverage and return shipping can change the practical cost of either chair.</p>`,
    `<h2>Sources</h2><ul>${sources.map((url) => `<li><a href="${esc(url)}" rel="nofollow noopener noreferrer">${esc(new URL(url).hostname.replace(/^www\./, ""))}</a></li>`).join("")}</ul>`,
  ].join("\n")
}

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const amazon = directAmazonUrls()
  const { data: products, error } = await s.from("products").select("id,slug,name,description_en,best_for,pros,cons,price_usd,thumbnail_url,updated_at").in("slug", topSlugs)
  if (error) throw error
  assert.equal(products.length, topSlugs.length)
  const bySlug = new Map(products.map((p) => [p.slug, p]))
  for (const slug of topSlugs) assert.ok(amazon.has(slug), `${slug} needs a direct Amazon URL`)

  const ids = products.map((p) => p.id)
  const [{ data: existingGuides }, { data: existingComparisons }] = await Promise.all([
    s.from("chairpedia").select("*").in("product_id", ids),
    s.from("comparisons").select("*").or(`product_a_id.in.(${ids.join(",")}),product_b_id.in.(${ids.join(",")})`),
  ])
  const newGuides = []
  for (const [slug, plan] of Object.entries(guidePlans)) {
    if (existingGuides.some((row) => row.product_id === bySlug.get(slug).id && row.status === "published")) continue
    const pair = comparisonPlans.find((item) => item.a === slug || item.b === slug)
    const sources = [plan.source, amazon.get(slug)].filter(Boolean)
    const product = bySlug.get(slug)
    newGuides.push({
      slug, title: `${product.name}: Features, Fit and Buying Guide`, subtitle: `A research-based guide to the ${product.name}'s configuration and purchase checks.`,
      excerpt: `${product.name} explained through its documented features, main trade-offs and the details to verify before ordering.`,
      content_html: guideHtml(product, plan, pair?.slug || ""), product_id: product.id,
      hero_image_url: product.thumbnail_url, seo_title: `${product.name}: Features, Fit & Buying Guide`,
      seo_description: `Research ${product.name} features, fit considerations, trade-offs, alternatives and the exact configuration to verify before buying.`,
      origin: null, collections: ["buying-guides"], featured: false, status: "published", lang: "en", gen_status: "done", gen_sources: sources,
      published_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
  }

  const newComparisons = []
  for (const plan of comparisonPlans) {
    const a = bySlug.get(plan.a); const b = bySlug.get(plan.b)
    const pairKey = [a.id, b.id].sort().join("|")
    const existing = existingComparisons.find((row) => row.slug === plan.slug || [row.product_a_id, row.product_b_id].sort().join("|") === pairKey)
    if (existing) continue
    const sources = [guidePlans[plan.a]?.source, amazon.get(plan.a), guidePlans[plan.b]?.source, amazon.get(plan.b)].filter(Boolean)
    newComparisons.push({
      slug: plan.slug, title: `${a.name} vs ${b.name}: Which Should You Buy?`, subtitle: `Compare ${plan.angle}.`,
      excerpt: `${a.name} and ${b.name} compared by configuration, fit questions, trade-offs and current buying considerations.`,
      seo_title: `${a.name} vs ${b.name}: Buying Comparison`, seo_description: `Compare ${a.name} vs ${b.name} features, fit, trade-offs, configurations and buying checks before choosing.`,
      hero_image_url: a.thumbnail_url, content_html: comparisonHtml(a, b, plan, sources), product_a_id: a.id, product_b_id: b.id,
      tier: "value", collections: ["buying-guides"], featured: false, status: "published", gen_status: "done",
      faq: [
        { q: `Which is better, ${a.name} or ${b.name}?`, a: `It depends on fit, required controls and the exact configuration. Use the decision sections and verify both live listings.` },
        { q: "Are marketplace configurations always identical?", a: "No. Upholstery, controls, accessories, seller, condition and warranty can vary by listing and selected option." },
        { q: "Should I use the displayed catalog price?", a: "Use it only as orientation. Check the current retailer page for the final price, delivery, returns and warranty." },
      ], published_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
  }

  const sourceRepairs = []
  for (const [productSlug, officialUrl] of Object.entries(existingGuideSourceRepairs)) {
    const product = bySlug.get(productSlug)
    const guide = existingGuides.find((row) => row.product_id === product.id && row.status === "published")
    assert.ok(guide, `Missing published guide for source repair: ${productSlug}`)
    const nextSources = [...new Set([...(guide.gen_sources || []), officialUrl, amazon.get(productSlug)].filter(Boolean))]
    if (JSON.stringify(nextSources) !== JSON.stringify(guide.gen_sources || [])) sourceRepairs.push({ guide, nextSources })
  }

  for (const guide of newGuides) {
    const $ = load(guide.content_html)
    assert.ok($("h2").length >= 6, `${guide.slug}: too few sections`)
    assert.equal($("table caption").length, 1, `${guide.slug}: table caption`)
    assert.ok($.text().trim().split(/\s+/).length >= 190, `${guide.slug}: thin guide`)
    assert.ok(guide.gen_sources.length >= 1, `${guide.slug}: source required`)
    assert.ok(guide.seo_title.length <= 65 && guide.seo_description.length <= 165, `${guide.slug}: metadata length`)
  }
  for (const comparison of newComparisons) {
    const $ = load(comparison.content_html)
    assert.ok($("h2").length >= 6, `${comparison.slug}: too few sections`)
    assert.equal($("table caption").length, 1, `${comparison.slug}: table caption`)
    assert.ok($.text().trim().split(/\s+/).length >= 190, `${comparison.slug}: thin comparison`)
    assert.equal(comparison.faq.length, 3, `${comparison.slug}: FAQ count`)
    assert.ok(comparison.seo_title.length <= 65 && comparison.seo_description.length <= 165, `${comparison.slug}: metadata length`)
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", guidesToCreate: newGuides.map((r) => r.slug), comparisonsToCreate: newComparisons.map((r) => r.slug), sourcesToRepair: sourceRepairs.map((r) => r.guide.slug) }, null, 2))
  if (!apply) return
  const backupDir = path.resolve(__dirname, "backups"); fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `revenue-content-network-${Date.now()}.json`)
  fs.writeFileSync(backupFile, JSON.stringify({ existingGuides, existingComparisons }, null, 2), { flag: "wx" })
  if (newGuides.length) { const { error: e } = await s.from("chairpedia").insert(newGuides); if (e) throw e }
  if (newComparisons.length) { const { error: e } = await s.from("comparisons").insert(newComparisons); if (e) throw e }
  for (const { guide, nextSources } of sourceRepairs) {
    const { error: e } = await s.from("chairpedia").update({ gen_sources: nextSources, updated_at: new Date().toISOString() }).eq("id", guide.id).eq("updated_at", guide.updated_at)
    if (e) throw e
  }
  console.log(JSON.stringify({ createdGuides: newGuides.length, createdComparisons: newComparisons.length, repairedSources: sourceRepairs.length, backupFile }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
