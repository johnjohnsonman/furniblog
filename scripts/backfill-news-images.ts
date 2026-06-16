/**
 * Backfill news rows that are missing a slug and/or a thumbnail image.
 *
 * For each news row:
 *   1. slug      — generated from the title + URL if missing (so the card links
 *                  to the internal /news/[slug] detail page instead of going
 *                  straight to the publisher).
 *   2. image_url — best-effort real article thumbnail (resolved from the Google
 *                  News link), falling back to the matched brand's image.
 *
 * Rows where an admin already uploaded a custom thumbnail (a Supabase storage
 * URL) are left untouched.
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run backfill:news-images            # DRY RUN — reports what would change
 *   npm run backfill:news-images -- --apply # actually write the updates
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"
import { newsSlug } from "../lib/news/slug"
import { resolveArticleThumbnail } from "../lib/news/thumbnail"

config({ path: resolve(__dirname, "../.env.local") })

type NewsRow = {
  id: string
  url: string
  title: string | null
  slug: string | null
  brand: string | null
  image_url: string | null
}

/** True when image_url is a thumbnail an admin uploaded to our storage. */
function isUploadedThumbnail(url: string | null): boolean {
  return !!url && url.includes("/storage/v1/object/public/")
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const apply = process.argv.includes("--apply")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }
  const supabase = createClient(url, key)

  // Brand image map (lowercased name -> hero/logo image).
  const { data: brandRows, error: brandErr } = await supabase
    .from("brands")
    .select("name, hero_image_url, logo_url")
  if (brandErr) {
    console.error("brands fetch error:", brandErr.message)
    process.exit(1)
  }
  const brandImages = new Map<string, string>()
  for (const b of brandRows ?? []) {
    const name = (b.name as string | null)?.trim().toLowerCase()
    if (!name) continue
    const img =
      (b.hero_image_url as string | null)?.trim() ||
      (b.logo_url as string | null)?.trim() ||
      ""
    if (img) brandImages.set(name, img)
  }
  console.log(`Loaded ${brandImages.size} brand images.`)

  const { data, error } = await supabase
    .from("news")
    .select("id, url, title, slug, brand, image_url")
    .limit(10000)
  if (error) {
    console.error("news fetch error:", error.message)
    process.exit(1)
  }
  const rows = (data ?? []) as NewsRow[]
  console.log(`Scanning ${rows.length} news rows…\n`)

  let slugFills = 0
  let realThumbs = 0
  let brandThumbs = 0
  let unchanged = 0

  for (const row of rows) {
    const update: { slug?: string; image_url?: string } = {}

    // 1) slug
    if (!row.slug?.trim()) {
      update.slug = newsSlug(row.title ?? "", row.url)
    }

    // 2) image — skip rows that already have a real/uploaded image.
    if (!row.image_url?.trim()) {
      const real = await resolveArticleThumbnail(row.url).catch(() => null)
      const brandImg = row.brand
        ? brandImages.get(row.brand.trim().toLowerCase()) ?? null
        : null
      const chosen = real ?? brandImg
      if (chosen) {
        update.image_url = chosen
        if (real) realThumbs++
        else brandThumbs++
      }
      // Be gentle with Google between network probes.
      await sleep(250)
    } else if (isUploadedThumbnail(row.image_url)) {
      // Admin-uploaded — never touch.
    }

    if (update.slug) slugFills++

    if (Object.keys(update).length === 0) {
      unchanged++
      continue
    }

    const label = update.image_url
      ? update.slug
        ? "slug+image"
        : "image"
      : "slug"
    console.log(`  [${label}] ${(row.title ?? "(untitled)").slice(0, 60)}`)

    if (apply) {
      const { error: upErr } = await supabase
        .from("news")
        .update(update)
        .eq("id", row.id)
      if (upErr) console.error(`    ! update failed: ${upErr.message}`)
    }
  }

  console.log(
    `\nSummary: slug filled ${slugFills}, real thumbnails ${realThumbs}, ` +
      `brand-image fallbacks ${brandThumbs}, unchanged ${unchanged}.`
  )
  if (!apply) {
    console.log(`\nDRY RUN — nothing written. Re-run with "--apply" to save.`)
  } else {
    console.log(`\nDone.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
