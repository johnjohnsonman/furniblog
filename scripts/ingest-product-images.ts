/**
 * Product-image ingest — the "connect a source, images flow in" path.
 *
 * Reads ONE manifest describing a licensed source (a manufacturer/supplier feed
 * folder or an allowed URL list) and registers images into `product_images`
 * (reusing the same table every public screen already reads). It does NOT scrape
 * the web, download search results, or bypass access controls — you point it at
 * a manifest you are allowed to use.
 *
 * Manifest (JSON):
 * {
 *   "source": "Brand X press kit (licensed)",          // default provenance
 *   "items": [
 *     {
 *       "productSlug": "sihoo-doro-c300",               // EXPLICIT match -> auto-register
 *       "image": "https://.../c300-front.jpg",          // allowed URL, or a local file path
 *       "alt": "SIHOO Doro C300, front view",
 *       "caption": "Optional caption",
 *       "rights": "confirmed",                          // confirmed | candidate  (default: confirmed)
 *       "source": "Brand X press kit",                  // overrides top-level source
 *       "matchBasis": "manufacturer SKU DORO-C300"
 *     },
 *     { "productName": "Some Chair", "image": "..." }    // NAME only -> held as 'candidate'
 *   ]
 * }
 *
 * Rules:
 *  - Only EXPLICIT identifiers (productSlug, or productCode resolving to exactly
 *    one product) auto-register. Name-only / ambiguous items are stored as
 *    rights='candidate' (hidden from public until reviewed). No visual matching.
 *  - Idempotent: an image already present for a product (same public URL, or same
 *    deterministic upload path) is skipped — re-running never duplicates.
 *  - Never overwrites a manually-set primary: is_thumbnail is set only when the
 *    product has no images yet. New images append after the existing max order.
 *  - Preserves source / match basis / rights on every row.
 *  - Failures are written to <manifest>.failures.json for --retry.
 *
 * Requires migration 044 (alt/caption/source/match_basis/rights columns).
 *
 * Usage:
 *   npm run images:ingest -- <manifest.json>            # dry-run (default)
 *   npm run images:ingest -- <manifest.json> --apply    # upload + register
 *   npm run images:ingest -- <manifest.json> --retry <failures.json> --apply
 */
import { config } from "dotenv"
import { resolve, basename, extname } from "path"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"

config({ path: resolve(__dirname, "../.env.local") })

const BUCKET = "product-images"
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`
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
  rights?: "confirmed" | "candidate"
  source?: string
  matchBasis?: string
}
type Manifest = { source?: string; items: ManifestItem[] }

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function sanitize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "")
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s)
}

/** Verify the 044 metadata columns exist; ingest depends on them. */
async function assertMigration(): Promise<boolean> {
  const { error } = await sb.from("product_images").select("rights").limit(1)
  if (error?.code === "42703") {
    console.error(
      "✗ Migration 044 not applied. Run lib/supabase/migrations/044_product_images_meta.sql in the Supabase SQL editor first."
    )
    return false
  }
  return true
}

/** Resolve a manifest item to a product id + whether the match is explicit. */
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

/** Deterministic storage path so re-uploading the same file is idempotent. */
function uploadPathFor(slug: string, image: string): string {
  const base = sanitize(basename(image))
  return `${slug}/${base}`
}

async function ensureUploaded(slug: string, localPath: string, apply: boolean): Promise<string> {
  const path = uploadPathFor(slug, localPath)
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path)
  const publicUrl = pub.publicUrl
  // Idempotent: if the object already exists, reuse its URL.
  const { data: existing } = await sb.storage.from(BUCKET).list(slug, { search: basename(path) })
  if (existing?.some((o) => o.name === basename(path))) return publicUrl
  if (!apply) return publicUrl
  const ext = extname(localPath).toLowerCase()
  const contentType = CONTENT_TYPE[ext]
  if (!contentType) throw new Error(`Unsupported file type: ${ext}`)
  const bytes = readFileSync(localPath)
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
  if (apply && !(await assertMigration())) process.exit(1)

  const manifest = JSON.parse(readFileSync(resolve(manifestPath), "utf8")) as Manifest
  let items = manifest.items ?? []
  if (retryFile && existsSync(resolve(retryFile))) {
    const failed = JSON.parse(readFileSync(resolve(retryFile), "utf8")) as { item: ManifestItem }[]
    items = failed.map((f) => f.item)
    console.log(`Retry mode: ${items.length} previously failed item(s).`)
  }

  console.log(`\n${apply ? "APPLY" : "DRY RUN"} · manifest=${manifestPath} · items=${items.length}\n`)

  const summary = { registered: 0, candidate: 0, skipped: 0, failed: 0 }
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
      // Ambiguous / name-only matches are held for review, never auto-published.
      const rights = product.explicit ? item.rights ?? "confirmed" : "candidate"

      // Resolve the final public URL (upload local files; use allowed URLs as-is).
      let url: string
      if (isUrl(item.image)) {
        url = item.image
      } else {
        const localPath = resolve(item.image)
        if (!existsSync(localPath)) throw new Error(`local file not found: ${localPath}`)
        url = await ensureUploaded(product.slug, localPath, apply)
      }

      // Idempotency: skip if this product already has this image URL.
      const { data: existingRows } = await sb
        .from("product_images")
        .select("id,url,sort_order,is_thumbnail")
        .eq("product_id", product.id)
      if ((existingRows ?? []).some((r) => r.url === url)) {
        summary.skipped++
        console.log(`  = ${label}: already registered (skip)`)
        continue
      }

      const hasAny = (existingRows ?? []).length > 0
      const nextOrder = hasAny ? Math.max(...existingRows!.map((r) => r.sort_order)) + 1 : 0
      const isThumb = !hasAny // never overwrite an existing manual primary

      if (rights === "candidate") summary.candidate++
      else summary.registered++

      console.log(
        `  ${rights === "candidate" ? "⧗" : "✓"} ${label}: ${rights}` +
          `${isThumb ? " (primary)" : ` (#${nextOrder + 1})`} -> ${url.replace(/^https?:\/\/[^/]+/, "")}`
      )

      if (apply) {
        const { error } = await sb.from("product_images").insert({
          product_id: product.id,
          url,
          sort_order: nextOrder,
          is_thumbnail: isThumb,
          alt: item.alt ?? null,
          caption: item.caption ?? null,
          source: item.source ?? manifest.source ?? null,
          match_basis: item.matchBasis ?? (product.explicit ? "explicit slug/code" : "name match (review)"),
          rights,
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
    `\nSummary: registered=${summary.registered} candidate(held)=${summary.candidate} ` +
      `skipped=${summary.skipped} failed=${summary.failed}`
  )
  if (failures.length > 0) {
    const out = `${resolve(manifestPath)}.failures.json`
    writeFileSync(out, JSON.stringify(failures, null, 2), "utf8")
    console.log(`Failures written to ${out} (re-run with --retry <that file>).`)
  }
  if (!apply) console.log("\nDRY RUN — no uploads or DB writes. Re-run with --apply.")
  void PUBLIC_PREFIX
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
