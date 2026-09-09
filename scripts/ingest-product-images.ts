/**
 * Product-image ingest — the "connect a source, images flow in" path.
 *
 * Reads ONE manifest describing images from a source you are allowed to use
 * (a manufacturer/supplier page, an allowed URL list, or local files) and
 * registers them into `product_images` (the same table every public screen
 * reads). It downloads a copy into our storage bucket, records provenance, and
 * keeps ambiguous matches OUT of public view. It does NOT scrape search
 * results, bypass logins/paywalls/access controls, or remove watermarks.
 *
 * Manifest (JSON):
 * {
 *   "source": "SIHOO official (fr.sihoo.com)",       // default provenance label
 *   "sourceUrl": "https://fr.sihoo.com/products/...", // default original page
 *   "items": [
 *     {
 *       "productSlug": "sihoo-doro-c300",            // EXPLICIT match -> may auto-verify
 *       "image": "https://.../c300-front.jpg",       // URL (downloaded) or local path
 *       "alt": "SIHOO Doro C300, front view (black)",
 *       "caption": "Optional caption",
 *       "rights": "owner_policy",                    // permitted | owner_policy | kept  (USAGE only)
 *       "modelStatus": "verified",                   // verified | candidate  (PUBLIC gate)
 *       "matchBasis": "official base C300 page; black; ASIN B0C3T865C2",
 *       "source": "SIHOO official",                  // overrides manifest.source
 *       "sourceUrl": "https://fr.sihoo.com/products/..." // overrides manifest.sourceUrl
 *     }
 *   ]
 * }
 *
 * Two INDEPENDENT axes (never approve both with one field):
 *   - rights       = usage/licence classification (does NOT gate public display).
 *                    Never set to "permitted" just because the owner used it.
 *   - modelStatus  = product-match / publish gate. 'candidate' is held, hidden
 *                    from every public surface until reviewed.
 *
 * Rules:
 *  - Only EXPLICIT identifiers (productSlug, or productCode resolving to exactly
 *    one product) may auto-verify. Name-only / ambiguous items are forced to
 *    modelStatus='candidate'. No visual-similarity model matching.
 *  - Idempotent: an image already stored for a product (same stored URL or same
 *    origin URL) is skipped — re-running never duplicates.
 *  - Never overwrites a manual primary: is_thumbnail is set only when the product
 *    has no image yet. New images append after the existing max order.
 *  - Preserves source / origin URL / collected-at / match basis / rights.
 *  - Failures are written to <manifest>.failures.json for --retry.
 *
 * Requires migration 045 (provenance + model_status columns).
 *
 * Usage:
 *   npm run images:ingest -- <manifest.json>            # dry-run (default)
 *   npm run images:ingest -- <manifest.json> --apply    # download + register
 *   npm run images:ingest -- <manifest.json> --retry <failures.json> --apply
 */
import { config } from "dotenv"
import { resolve, basename, extname } from "path"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"

config({ path: resolve(__dirname, "../.env.local") })

const BUCKET = "product-images"
const MAX_BYTES = 5 * 1024 * 1024
const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}

type ManifestItem = {
  productSlug?: string
  productCode?: string
  productName?: string
  image: string
  alt?: string
  caption?: string
  rights?: "permitted" | "owner_policy" | "kept"
  modelStatus?: "verified" | "candidate"
  matchBasis?: string
  source?: string
  sourceUrl?: string
}
type Manifest = { source?: string; sourceUrl?: string; items: ManifestItem[] }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function sanitize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "")
}
function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s)
}
function extOf(path: string): string {
  const e = extname(path.split("?")[0]).toLowerCase()
  return CONTENT_TYPE[e] ? e : ".jpg"
}

/** ingest depends on the 045 columns (model_status + provenance). */
async function assertMigration(): Promise<boolean> {
  const { error } = await sb.from("product_images").select("model_status").limit(1)
  if (error?.code === "42703") {
    console.error(
      "✗ Migration 045 not applied. Run lib/supabase/migrations/045_product_images_provenance.sql in the app project (ref bvytheznlotwgavmytfr) first."
    )
    return false
  }
  return true
}

async function resolveProduct(
  item: ManifestItem
): Promise<{ id: string; slug: string; explicit: boolean } | null> {
  if (item.productSlug) {
    const { data } = await sb.from("products").select("id,slug").eq("slug", item.productSlug).maybeSingle()
    return data ? { id: data.id, slug: data.slug, explicit: true } : null
  }
  if (item.productCode) {
    const { data } = await sb.from("products").select("id,slug").eq("slug", item.productCode).maybeSingle()
    if (data) return { id: data.id, slug: data.slug, explicit: true }
  }
  if (item.productName) {
    const { data } = await sb.from("products").select("id,slug").ilike("name", item.productName)
    if (data && data.length === 1) return { id: data[0].id, slug: data[0].slug, explicit: false }
  }
  return null
}

/** Download a remote image (or read a local file) and store a copy in the
 *  bucket at a deterministic path. Idempotent: reuses an existing object. */
async function storeImage(
  slug: string,
  image: string,
  apply: boolean
): Promise<string> {
  const ext = extOf(image)
  const path = `${slug}/${sanitize(basename(image.split("?")[0]))}`.replace(/(\.[a-z]+)?$/, ext)
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path)
  const publicUrl = pub.publicUrl
  const { data: existing } = await sb.storage.from(BUCKET).list(slug, { search: basename(path) })
  if (existing?.some((o) => o.name === basename(path))) return publicUrl // already stored
  if (!apply) return publicUrl

  let bytes: Buffer
  if (isUrl(image)) {
    const res = await axios.get<ArrayBuffer>(image, {
      responseType: "arraybuffer",
      timeout: 20000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FurniblogImageIngest/1.0)" },
      maxContentLength: MAX_BYTES,
    })
    bytes = Buffer.from(res.data)
  } else {
    const local = resolve(image)
    if (!existsSync(local)) throw new Error(`local file not found: ${local}`)
    bytes = readFileSync(local)
  }
  if (bytes.length > MAX_BYTES) throw new Error(`image too large (${bytes.length} bytes > 5MB)`)
  const contentType = CONTENT_TYPE[ext] ?? "image/jpeg"
  const { error } = await sb.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false })
  if (error && !/already exists/i.test(error.message)) throw error
  return publicUrl
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--")
  const apply = args.includes("--apply")
  const retryIdx = args.indexOf("--retry")
  const retryFile = retryIdx !== -1 ? args[retryIdx + 1] : null
  const manifestPath = args.find((a) => !a.startsWith("--") && a !== retryFile)
  if (!manifestPath) {
    console.error("Usage: npm run images:ingest -- <manifest.json> [--apply] [--retry <failures.json>]")
    process.exit(1)
  }
  if (!(await assertMigration())) process.exit(1)

  const manifest = JSON.parse(readFileSync(resolve(manifestPath), "utf8")) as Manifest
  let items = manifest.items ?? []
  if (retryFile && existsSync(resolve(retryFile))) {
    const failed = JSON.parse(readFileSync(resolve(retryFile), "utf8")) as { item: ManifestItem }[]
    items = failed.map((f) => f.item)
    console.log(`Retry mode: ${items.length} previously failed item(s).`)
  }

  console.log(`\n${apply ? "APPLY" : "DRY RUN"} · manifest=${manifestPath} · items=${items.length}\n`)
  const summary = { verified: 0, candidate: 0, skipped: 0, failed: 0 }
  const failures: { item: ManifestItem; reason: string }[] = []

  for (const item of items) {
    const label = item.productSlug ?? item.productCode ?? item.productName ?? "?"
    try {
      const product = await resolveProduct(item)
      if (!product) {
        summary.failed++
        failures.push({ item, reason: "no matching product" })
        console.log(`  ✗ ${label}: no matching product`)
        continue
      }
      // Model-match gate: name-only/ambiguous matches are never auto-verified.
      const modelStatus = product.explicit ? item.modelStatus ?? "verified" : "candidate"
      // Usage classification is recorded honestly (owner decision != permission).
      const rights = item.rights ?? "owner_policy"
      const originUrl = isUrl(item.image) ? item.image : null

      // Idempotency: skip if this product already has this stored/origin image.
      const { data: existingRows } = await sb
        .from("product_images")
        .select("id,url,sort_order,is_thumbnail,origin_image_url")
        .eq("product_id", product.id)
      const storedUrl = await storeImage(product.slug, item.image, apply)
      const dup = (existingRows ?? []).some(
        (r) => r.url === storedUrl || (originUrl && r.origin_image_url === originUrl)
      )
      if (dup) {
        summary.skipped++
        console.log(`  = ${label}: already registered (skip)`)
        continue
      }

      const hasAny = (existingRows ?? []).length > 0
      const nextOrder = hasAny ? Math.max(...existingRows!.map((r) => r.sort_order)) + 1 : 0
      const isThumb = !hasAny // never overwrite an existing manual primary

      if (modelStatus === "candidate") summary.candidate++
      else summary.verified++
      console.log(
        `  ${modelStatus === "candidate" ? "⧗ candidate(held)" : "✓ verified"} ${label}` +
          `${isThumb ? " (primary)" : ` (#${nextOrder + 1})`} rights=${rights} -> ${storedUrl.replace(/^https?:\/\/[^/]+/, "")}`
      )

      if (apply) {
        const { error } = await sb.from("product_images").insert({
          product_id: product.id,
          url: storedUrl,
          sort_order: nextOrder,
          is_thumbnail: isThumb,
          alt: item.alt ?? null,
          caption: item.caption ?? null,
          source: item.source ?? manifest.source ?? null,
          source_url: item.sourceUrl ?? manifest.sourceUrl ?? null,
          origin_image_url: originUrl,
          collected_at: new Date().toISOString(),
          match_basis: item.matchBasis ?? (product.explicit ? "explicit slug/code" : "name match (review)"),
          rights,
          model_status: modelStatus,
        })
        if (error) throw error
      }
    } catch (err) {
      summary.failed++
      const reason = err instanceof Error ? err.message : String(err)
      failures.push({ item, reason })
      console.log(`  ✗ ${label}: ${reason}`)
    }
  }

  console.log(
    `\nSummary: verified=${summary.verified} candidate(held)=${summary.candidate} ` +
      `skipped=${summary.skipped} failed=${summary.failed}`
  )
  if (failures.length > 0) {
    const out = `${resolve(manifestPath)}.failures.json`
    writeFileSync(out, JSON.stringify(failures, null, 2), "utf8")
    console.log(`Failures written to ${out} (re-run with --retry <that file>).`)
  }
  if (!apply) console.log("\nDRY RUN — no downloads or DB writes. Re-run with --apply.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
