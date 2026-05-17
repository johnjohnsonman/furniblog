/**
 * Seed sample gallery images when the table is empty.
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run seed:gallery
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

config({ path: resolve(__dirname, "../.env.local") })

const SAMPLE_GALLERY = [
  {
    url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800",
    caption: "Minimal home office setup",
    category: "home_office",
    published: true,
  },
  {
    url: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
    caption: "Executive office with premium seating",
    category: "executive",
    published: true,
  },
  {
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    caption: "Modern workspace design",
    category: "office",
    published: true,
  },
  {
    url: "https://images.unsplash.com/photo-1593642634443-44adaa06bbe9?w=800",
    caption: "Gaming setup with ergonomic chair",
    category: "gaming",
    published: true,
  },
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    caption: "Open office with task chairs",
    category: "office",
    published: true,
  },
  {
    url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
    caption: "Scandinavian home office",
    category: "home_office",
    published: true,
  },
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { count, error: countError } = await supabase
    .from("gallery_images")
    .select("*", { count: "exact", head: true })

  if (countError) {
    console.error("gallery_images table error:", countError.message)
    console.error("Run migration 008_gallery_images.sql in Supabase first.")
    process.exit(1)
  }

  if ((count ?? 0) > 0) {
    console.log(`Gallery already has ${count} images — skipping seed.`)
    return
  }

  const rows = SAMPLE_GALLERY.map((item, index) => ({
    ...item,
    sort_order: index,
  }))

  const { error } = await supabase.from("gallery_images").insert(rows)

  if (error) {
    console.error("Insert failed:", error.message)
    process.exit(1)
  }

  console.log(`Seeded ${rows.length} gallery images.`)
}

void main()
