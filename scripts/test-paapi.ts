/**
 * Manually test Amazon Creators API credentials from .env.local.
 * Read-only getItems call. Does NOT print secrets.
 *
 * Usage:
 *   npm run test:paapi -- B0C3T865C2   # a specific ASIN
 *   npm run test:paapi                 # defaults to the SIHOO Doro C300 ASIN
 */
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env.local") })

import { fetchItemImages, isPaapiConfigured } from "../lib/amazon/paapi"

async function main() {
  const asin = process.argv[2]?.trim() || "B0C3T865C2"
  console.log(`Creators API configured (keys present): ${isPaapiConfigured()}`)
  console.log(`Testing ASIN: ${asin}\n`)

  const out = await fetchItemImages(asin)

  if (out.ok) {
    console.log("✅ SUCCESS — Creators API is live and eligible.")
    console.log("Primary image:", out.images?.primary)
    console.log("Variant images:", out.images?.variants.length ?? 0)
    out.images?.variants.forEach((u, i) => console.log(`  ${i + 1}. ${u}`))
  } else {
    console.log(`❌ ${out.errorCode}${out.httpStatus ? ` (HTTP ${out.httpStatus})` : ""}`)
    if (out.errorMessage) console.log(out.errorMessage)

    const code = (out.errorCode ?? "").toLowerCase()
    if (code.includes("noteligible") || code.includes("eligible")) {
      console.log(
        "\n→ Auth WORKS, but not eligible yet: needs 10 qualifying sales in the trailing 30 days (up to 48h review). The module auto-activates once eligible."
      )
    } else if (out.errorCode === "NotConfigured") {
      console.log("\n→ Keys not found. Check PAAPI_ACCESS_KEY / PAAPI_SECRET_KEY / PAAPI_PARTNER_TAG in .env.local.")
    } else if (code.includes("invalid_client") || code.includes("unauthorized") || (out.httpStatus === 401)) {
      console.log("\n→ Auth FAILED at token or call. Re-check the Credential ID / Secret values.")
    }
  }

  console.log("\n--- raw response (for shape inspection) ---")
  console.log(JSON.stringify(out.raw ?? null, null, 2)?.slice(0, 2000))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
