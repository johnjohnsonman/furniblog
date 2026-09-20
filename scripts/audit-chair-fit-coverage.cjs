const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")
const { config } = require("dotenv")

const projectRoot = path.resolve(__dirname, "..")
for (const candidate of [
  path.join(projectRoot, ".env.local"),
  path.resolve(projectRoot, "..", "..", ".env.local"),
]) {
  if (fs.existsSync(candidate)) config({ path: candidate, override: false })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase read key")
}

const outputDir = path.join(projectRoot, "content", "reports")
const reportDate = new Date().toISOString().slice(0, 10)

function finite(value) {
  return typeof value === "number" && Number.isFinite(value)
}

function hasRange(specs, fixedKey, minKey, maxKey) {
  return finite(specs?.[fixedKey]) || (finite(specs?.[minKey]) && finite(specs?.[maxKey]))
}

function inspect(row, picks) {
  const specs = row.chair_specs && typeof row.chair_specs === "object" ? row.chair_specs : {}
  const images = Array.isArray(row.product_images) ? row.product_images : []
  const fields = {
    recommendedHeight: finite(specs.recommendedHeightMin) && finite(specs.recommendedHeightMax),
    seatHeight: finite(specs.seatHeightMin) && finite(specs.seatHeightMax),
    seatDepth: hasRange(specs, "seatDepth", "seatDepthMin", "seatDepthMax"),
    seatWidth: finite(specs.seatWidth),
    weightCapacity: finite(specs.weightCapacityKg),
    armrestFloorHeight:
      finite(specs.armrestFloorHeightMin) && finite(specs.armrestFloorHeightMax),
    verifiedImage: images.some((image) => image.model_status === "verified" && image.url),
    fallbackImage: Boolean(row.thumbnail_url),
  }
  const missing = Object.entries(fields)
    .filter(([key, value]) => !value && key !== "fallbackImage")
    .map(([key]) => key)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    reviewCount: row.review_count || 0,
    ratingOverall: finite(row.rating_overall) ? row.rating_overall : null,
    approvedTopPicks: picks.get(row.id) || 0,
    fitReady: fields.seatHeight && fields.seatDepth,
    fullEvidence:
      fields.seatHeight &&
      fields.seatDepth &&
      fields.weightCapacity &&
      fields.armrestFloorHeight,
    fields,
    currentSpecs: {
      recommendedHeightMin: finite(specs.recommendedHeightMin) ? specs.recommendedHeightMin : null,
      recommendedHeightMax: finite(specs.recommendedHeightMax) ? specs.recommendedHeightMax : null,
      seatHeightMin: finite(specs.seatHeightMin) ? specs.seatHeightMin : null,
      seatHeightMax: finite(specs.seatHeightMax) ? specs.seatHeightMax : null,
      seatDepth: finite(specs.seatDepth) ? specs.seatDepth : null,
      seatDepthMin: finite(specs.seatDepthMin) ? specs.seatDepthMin : null,
      seatDepthMax: finite(specs.seatDepthMax) ? specs.seatDepthMax : null,
      seatWidth: finite(specs.seatWidth) ? specs.seatWidth : null,
      weightCapacityKg: finite(specs.weightCapacityKg) ? specs.weightCapacityKg : null,
      armrestFloorHeightMin: finite(specs.armrestFloorHeightMin)
        ? specs.armrestFloorHeightMin
        : null,
      armrestFloorHeightMax: finite(specs.armrestFloorHeightMax)
        ? specs.armrestFloorHeightMax
        : null,
    },
    missing,
    updatedAt: row.updated_at,
  }
}

function percentage(count, total) {
  return total ? Math.round((count / total) * 1000) / 10 : 0
}

function markdown(report) {
  const lines = [
    "# Chair Fit Catalog Coverage Audit",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Published chair records: **${report.summary.total}**`,
    `- Fit-ready (seat height + seat depth): **${report.summary.fitReady} (${report.summary.fitReadyPct}%)**`,
    `- All four core numeric fields present: **${report.summary.fullEvidence} (${report.summary.fullEvidencePct}%)**`,
    `- Seat height and depth with field-level sources: **${report.summary.sourcedFitReady}**`,
    `- All four core fields with field-level sources: **${report.summary.sourcedCore}**`,
    `- Verified product image: **${report.summary.verifiedImage} (${report.summary.verifiedImagePct}%)**`,
    `- Field-level evidence rows: **${report.summary.evidenceRows}** across **${report.summary.productsWithFieldEvidence}** products`,
    `- Evidence table available: **${report.summary.evidenceTableAvailable ? "Yes" : "No"}**`,
    "",
    "Numeric presence is not source verification. Sourced counts require both a numeric field and its field-level source record. Sources may describe specific regions, options or older revisions; these counts do not certify current configuration, comfort or medical suitability.",
    "",
    "## Field coverage",
    "",
    "| Field | Records | Coverage |",
    "|---|---:|---:|",
    ...Object.entries(report.fieldCoverage).map(
      ([field, value]) => `| ${field} | ${value.count} | ${value.pct}% |`,
    ),
    "",
    "## Priority evidence set",
    "",
    "Fit-ready products ordered by approved first-choice picks, review volume, editorial rating, then name. This is the first provenance and armrest-height backfill batch.",
    "",
    "| Product | Top picks | Reviews | Rating | Missing numeric fields |",
    "|---|---:|---:|---:|---|",
    ...report.priorityEvidence.map(
      (item) =>
        `| ${item.name} (\`${item.slug}\`) | ${item.approvedTopPicks} | ${item.reviewCount} | ${item.ratingOverall ?? "Unknown"} | ${item.missing.join(", ") || "None"} |`,
    ),
    "",
    "## Highest-priority completion queue",
    "",
    "Records that already have one of the two core dimensions are listed first because one verified value may make them fit-ready.",
    "",
    "| Product | Fit-ready | Missing numeric fields | Updated |",
    "|---|:---:|---|---|",
    ...report.completionQueue.map(
      (item) =>
        `| ${item.name} (\`${item.slug}\`) | ${item.fitReady ? "Yes" : "No"} | ${item.missing.join(", ") || "None"} | ${item.updatedAt?.slice(0, 10) || "Unknown"} |`,
    ),
    "",
    "## Missing core sources",
    "",
    "Numeric data alone does not remove a product from this queue.",
    "",
    "| Product | Missing numeric field or source |",
    "|---|---|",
    ...report.sourceQueue.map(item => `| ${item.name} (\`${item.slug}\`) | ${item.missingCoreSources.join(', ')} |`),
    "",
  ]
  return lines.join("\n")
}

async function main() {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const [productsResult, sessionsResult, evidenceResult] = await Promise.all([
    supabase
      .from("products")
      .select("id,slug,name,category,review_count,rating_overall,chair_specs,thumbnail_url,updated_at,product_images(url,model_status,sort_order)")
      .eq("published", true)
      .eq("track", "chair")
      .order("name"),
    supabase
      .from("review_sessions")
      .select("review_rankings(rank,chair_id)")
      .eq("status", "approved")
      .limit(5000),
    supabase
      .from("product_fit_evidence")
      .select("product_id,field_key,evidence_type,source_url,checked_on")
      .limit(10000),
  ])
  if (productsResult.error) throw productsResult.error
  const picks = new Map()
  if (!sessionsResult.error) {
    for (const session of sessionsResult.data || []) {
      const rankings = Array.isArray(session.review_rankings) ? session.review_rankings : []
      const top = rankings.find((item) => item.rank === 1)
      if (top?.chair_id) picks.set(top.chair_id, (picks.get(top.chair_id) || 0) + 1)
    }
  }

  const records = (productsResult.data || []).map((row) => inspect(row, picks))
  const evidenceRows = evidenceResult.error ? [] : evidenceResult.data || []
  const evidenceByProduct = new Map()
  for (const row of evidenceRows) {
    const existing = evidenceByProduct.get(row.product_id) || []
    existing.push(row)
    evidenceByProduct.set(row.product_id, existing)
  }
  for (const record of records) {
    record.evidenceCount = (evidenceByProduct.get(record.id) || []).length
    record.evidenceFields = [
      ...new Set((evidenceByProduct.get(record.id) || []).map((row) => row.field_key)),
    ]
    const mapping = { seatHeight: 'seat_height', seatDepth: 'seat_depth', weightCapacity: 'weight_capacity', armrestFloorHeight: 'armrest_floor_height' }
    record.missingCoreSources = Object.entries(mapping)
      .filter(([field, source]) => !record.fields[field] || !record.evidenceFields.includes(source))
      .map(([field]) => field)
    record.sourcedFitReady = record.fitReady && ['seat_height', 'seat_depth'].every(field => record.evidenceFields.includes(field))
    record.sourcedCore = record.missingCoreSources.length === 0
  }
  const fieldKeys = [
    "recommendedHeight",
    "seatHeight",
    "seatDepth",
    "seatWidth",
    "weightCapacity",
    "armrestFloorHeight",
    "verifiedImage",
  ]
  const fieldCoverage = Object.fromEntries(
    fieldKeys.map((field) => {
      const count = records.filter((item) => item.fields[field]).length
      return [field, { count, pct: percentage(count, records.length) }]
    }),
  )
  const fitReady = records.filter((item) => item.fitReady).length
  const fullEvidence = records.filter((item) => item.fullEvidence).length
  const verifiedImage = records.filter((item) => item.fields.verifiedImage).length
  const completionQueue = [...records]
    .filter((item) => item.missing.length)
    .sort((a, b) => {
      const aCore = Number(a.fields.seatHeight) + Number(a.fields.seatDepth)
      const bCore = Number(b.fields.seatHeight) + Number(b.fields.seatDepth)
      return bCore - aCore || a.missing.length - b.missing.length || a.name.localeCompare(b.name)
    })
    .slice(0, 50)
  const priorityEvidence = [...records]
    .filter((item) => item.fitReady)
    .sort((a, b) =>
      b.approvedTopPicks - a.approvedTopPicks ||
      b.reviewCount - a.reviewCount ||
      (b.ratingOverall || 0) - (a.ratingOverall || 0) ||
      a.name.localeCompare(b.name),
    )
    .slice(0, 20)
  const report = {
    generatedAt: new Date().toISOString(),
    definition: {
      fitReady: ["seatHeight", "seatDepth"],
      fullEvidence: ["seatHeight", "seatDepth", "weightCapacity", "armrestFloorHeight"],
    },
    summary: {
      total: records.length,
      fitReady,
      fitReadyPct: percentage(fitReady, records.length),
      fullEvidence,
      fullEvidencePct: percentage(fullEvidence, records.length),
      sourcedFitReady: records.filter(item => item.sourcedFitReady).length,
      sourcedCore: records.filter(item => item.sourcedCore).length,
      verifiedImage,
      verifiedImagePct: percentage(verifiedImage, records.length),
      evidenceRows: evidenceRows.length,
      productsWithFieldEvidence: evidenceByProduct.size,
      evidenceTableAvailable: !evidenceResult.error,
    },
    fieldCoverage,
    sourceQueue: [...records].filter(item => item.missingCoreSources.length).sort((a, b) => b.approvedTopPicks - a.approvedTopPicks || a.name.localeCompare(b.name)).slice(0, 50),
    priorityEvidence,
    completionQueue,
    records,
  }

  fs.mkdirSync(outputDir, { recursive: true })
  const base = path.join(outputDir, `chair-fit-coverage-${reportDate}`)
  fs.writeFileSync(`${base}.json`, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(`${base}.md`, `${markdown(report)}\n`)
  console.log(JSON.stringify({ ...report.summary, output: `${base}.{md,json}` }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
