import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"
import { runPipeline } from "../lib/pipeline"

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing Supabase env vars")
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const slug = process.env.PIPELINE_SLUG ?? "steelcase-leap-v2"
  const sources = (process.env.PIPELINE_SOURCES ?? "reddit")
    .split(",")
    .map((s) => s.trim()) as ("reddit" | "youtube" | "naver" | "dcinside" | "japan_community")[]

  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !product) {
    console.error("Product not found:", slug, error?.message)
    process.exit(1)
  }

  console.log(`Running pipeline for ${product.name} (${product.id})…`)

  const debug = process.env.PIPELINE_DEBUG !== "false"

  const result = await runPipeline({
    chairSlug: product.slug,
    chairName: product.name,
    productId: product.id,
    sources,
    maxPerSource: Number(process.env.PIPELINE_MAX_PER_SOURCE ?? 5),
    debug,
  })

  console.log("Pipeline result:", {
    collected: result.collected,
    processed: result.processed,
    saved: result.saved,
    failed: result.failed,
    debugItems: result.debugItems?.length,
  })
  if (result.debugSamples?.length) {
    console.log("Debug samples:", JSON.stringify(result.debugSamples, null, 2))
  }
  if (result.debugItems?.length) {
    console.log("Debug items:", JSON.stringify(result.debugItems, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
