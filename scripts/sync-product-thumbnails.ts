/**
 * Backfill products.thumbnail_url from product_images.
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run sync:thumbnails
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

config({ path: resolve(__dirname, "../.env.local") })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { data: images, error } = await supabase
    .from("product_images")
    .select("product_id, url, is_thumbnail, sort_order, created_at")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("product_images error:", error.message)
    process.exit(1)
  }

  if (!images?.length) {
    console.log("No product_images rows — nothing to sync.")
    return
  }

  const byProduct = new Map<string, string>()
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
  for (const row of sorted) {
    if (!byProduct.has(row.product_id)) {
      byProduct.set(row.product_id, row.url)
    }
  }

  let updated = 0
  for (const [productId, thumbUrl] of byProduct) {
    const { error: updateError } = await supabase
      .from("products")
      .update({ thumbnail_url: thumbUrl })
      .eq("id", productId)

    if (updateError) {
      console.error(`Failed ${productId}:`, updateError.message)
      continue
    }
    updated += 1
    console.log(`Updated ${productId} → ${thumbUrl}`)
  }

  console.log(`Done. Synced thumbnail_url for ${updated} product(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
