const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")
const { load } = require("cheerio")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })
const apply = process.argv.includes("--apply")

const plans = {
  "herman-miller-embody-gaming-chair": {
    product: "herman-miller-embody-gaming",
    sources: [
      "https://store.hermanmiller.com/gaming-chairs-embody-gaming-chair?lang=en_US",
      "https://www.hermanmiller.com/content/dam/hermanmiller/documents/user_information/herman_miller_x_logitech_g_embody_gaming_chair_adjustment_guide.pdf",
    ],
    verify: "Confirm that the listing is the Logitech G collaboration rather than the standard Embody, then check upholstery, color, seller, delivery and return terms.",
  },
  "duramont-ergonomic-office-chair": {
    product: "duramont-ergonomic",
    sources: ["https://duramontchairs.com/products/duramont-ergonomic-office-chair-black"],
    verify: "Match the selected Duramont listing's armrests, headrest, lumbar controls, stated dimensions and warranty terms. Marketplace variants and seller terms can differ.",
  },
  "nouhaus-ergo3d-ergonomic-office-chair": {
    product: "nouhaus-ergo3d",
    sources: ["https://www.nouhaus.com/products/ergo3d"],
    verify: "Check the current Ergo3D package for the headrest, blade wheels, arm controls, upholstery and stated dimensions before comparing its price with another chair.",
  },
  "gabrylly-ergonomic-office-chair": {
    product: "gabrylly-ergonomic",
    sources: ["https://gabrylly.com/"],
    verify: "Confirm the exact Gabrylly model code and selected color. Dimensions, arm movement, headrest details, capacity and seller warranty should come from the chosen listing.",
  },
  "mimoglad-high-back-office-chair": {
    product: "mimoglad-high-back",
    sources: ["https://manuals.plus/asin/B0BJ2C1RZB.pdf"],
    verify: "Match the model or ASIN before using the manual as a reference. Verify the selected listing's armrests, headrest, upholstery, dimensions, seller and return terms.",
  },
  "branch-ergonomic-chair": {
    product: "branch-ergonomic-chair",
    sources: ["https://www.branchfurniture.com/collections/all/products/ergonomic-chair"],
    verify: "Use the current Branch configuration as the source of truth for color, armrests, seat and lumbar controls, dimensions, delivery, trial and warranty terms.",
  },
  "flexispot-c7-office-chair": {
    product: "flexispot-c7",
    sources: ["https://www.flexispot.com/flexispot-best-ergonomic-office-chair-c7"],
    verify: "The C7 family includes configuration choices. Confirm the selected seat, armrests, lumbar system, headrest, footrest, dimensions and warranty rather than combining specifications across variants.",
  },
  "hon-ignition-2-office-chair": {
    product: "hon-ignition-2",
    sources: [
      "https://www.hon.com/configurator/ignition-20-task-chair",
      "https://www.hon.com/sites/hon.com/files/ignition-2-task-seating-functionality-guide.pdf",
    ],
    verify: "HON Ignition 2.0 is a configurable family. Match the model code, control package, arms, lumbar option, upholstery and seller warranty to the exact listing.",
  },
  "sidiz-t50-office-chair": {
    product: "sidiz-t50",
    sources: [
      "https://www.sidiz.com/pages/helpcenter",
      "https://cdn.sidiz.com/_upload/contents/2201/F1642577058484EMYVSOBOXFD.pdf",
    ],
    verify: "T50 configurations vary by market. Check whether the selected listing includes the headrest, lumbar support, arm controls and seat adjustments shown in the relevant model documentation.",
  },
}

function esc(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;")
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

function improveContent(html, product, plan) {
  const $ = load(html || "", null, false)
  if (!$('[data-furniblog-research-note="true"]').length) {
    $.root().prepend('<p data-furniblog-research-note="true"><strong>Research note:</strong> This guide summarizes published manufacturer, documentation, retailer and Furniblog catalog information. It is not presented as a hands-on Furniblog test.</p>')
  }
  if (!$('[data-source-verification="true"]').length) {
    $.root().append(`<section data-source-verification="true"><h2>Verify the exact listing before buying</h2><p>${esc(plan.verify)}</p><p>Price and availability can change. Use the live retailer page for the final offer and open the <a href="/products/${esc(product.slug)}">${esc(product.name)} product record</a> to compare current purchase options.</p></section>`)
  }
  let next = $.html()
  const replacements = [
    [/earned its popularity/gi, "is positioned"],
    [/reviewers (?:often )?(?:praise|mention|report|note)/gi, "published product information highlights"],
    [/reviewers like it/gi, "the documented dimensions may suit"],
    [/reviewers also single out/gi, "published product information also highlights"],
    [/draws praise for easing pressure over long sits/gi, "is designed to distribute seated pressure"],
    [/genuinely cool/gi, "breathable"],
    [/genuinely adjustable/gi, "configurable"],
    [/premium-style/gi, "multi-point"],
    [/premium money/gi, "higher price tiers"],
    [/one of the stronger options/gi, "an option to compare"],
    [/it's a lot of adjustable chair/gi, "it combines several adjustment controls"],
    [/keeps you (?:healthy|pain-free)/gi, "may support a more adjustable sitting setup"],
  ]
  for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement)
  return next
}

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const amazon = directAmazonUrls()
  const slugs = Object.keys(plans)
  const { data: rows, error } = await s.from("chairpedia").select("*,products(id,slug,name)").in("slug", slugs)
  if (error) throw error
  assert.equal(rows.length, slugs.length, "All planned Chairpedia rows must exist")

  const candidates = rows.map((row) => {
    const plan = plans[row.slug]
    assert.equal(row.status, "published", `${row.slug}: expected published status`)
    assert.equal(row.products?.slug, plan.product, `${row.slug}: product mismatch`)
    const amazonUrl = amazon.get(plan.product)
    const sources = [...new Set([...plan.sources, ...(amazonUrl ? [amazonUrl] : []), ...(row.gen_sources || [])])]
    assert.ok(sources.length >= 2, `${row.slug}: needs at least two sources`)
    const content = improveContent(row.content_html, row.products, plan)
    const $ = load(content, null, false)
    assert.equal($('[data-furniblog-research-note="true"]').length, 1, `${row.slug}: research note`)
    assert.equal($('[data-source-verification="true"]').length, 1, `${row.slug}: verification section`)
    assert.ok($.text().trim().split(/\s+/).length >= 175, `${row.slug}: content remains too thin`)
    return { row, content, sources, amazonUrl }
  })
  const changes = candidates.filter(({ row, content, sources }) =>
    content !== (row.content_html || "") || JSON.stringify(sources) !== JSON.stringify(row.gen_sources || []))

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    verified: candidates.length,
    changes: changes.map(({ row, content, sources, amazonUrl }) => ({
      slug: row.slug,
      wordsBefore: load(row.content_html || "", null, false).text().trim().split(/\s+/).filter(Boolean).length,
      wordsAfter: load(content, null, false).text().trim().split(/\s+/).filter(Boolean).length,
      sources: sources.length,
      directAmazon: Boolean(amazonUrl),
    })),
  }, null, 2))
  if (!apply) return
  if (!changes.length) {
    console.log(JSON.stringify({ updated: 0, idempotent: true }, null, 2))
    return
  }

  const backupDir = path.resolve(__dirname, "backups")
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `missing-chairpedia-sources-${Date.now()}.json`)
  fs.writeFileSync(backupFile, JSON.stringify(rows, null, 2), { flag: "wx" })
  for (const { row, content, sources } of changes) {
    const { data, error: updateError } = await s.from("chairpedia")
      .update({ content_html: content, gen_sources: sources, updated_at: new Date().toISOString() })
      .eq("id", row.id).eq("updated_at", row.updated_at).select("id").single()
    if (updateError) throw updateError
    assert.equal(data.id, row.id)
  }
  console.log(JSON.stringify({ updated: changes.length, backupFile }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
