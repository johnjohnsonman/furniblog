/**
 * Apply brand country fixes (015_brand_countries_fix.sql logic).
 * Run: npx ts-node --project scripts/tsconfig.json scripts/fix-brand-countries.ts
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

config({ path: resolve(__dirname, "../.env.local") })

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing env")
    process.exit(1)
  }

  const sb = createClient(url, key)

  const { error: updateError } = await sb
    .from("brands")
    .update({ country: "KR", updated_at: new Date().toISOString() })
    .in("slug", ["sidiz", "fursys"])
    .or("country.is.null,country.neq.KR")

  if (updateError) {
    console.error("Update KR failed:", updateError.message)
  } else {
    console.log("Updated sidiz/fursys to KR where needed")
  }

  const { error: upsertError } = await sb.from("brands").upsert(
    {
      slug: "fursys",
      name: "Fursys",
      country: "KR",
      tier: "premium",
      founded_year: 1984,
      website_url: "https://www.fursys.com",
      description_ko:
        "Leading Korean office furniture brand known for Tim, Slim, and Aria chair series.",
    },
    { onConflict: "slug" }
  )

  if (upsertError) {
    console.error("Upsert fursys failed:", upsertError.message)
  } else {
    console.log("Upserted fursys brand (KR)")
  }

  const { data, error } = await sb
    .from("brands")
    .select("name, slug, country")
    .order("country")

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  console.log("\n=== brands after fix ===\n")
  console.log(JSON.stringify(data, null, 2))

  const missing = data?.filter((b) => !b.country?.trim()) ?? []
  console.log("\nMissing country:", missing.length ? missing : "none")
}

main().catch(console.error)
