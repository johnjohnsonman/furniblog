import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { config } from "dotenv"

config({ path: process.env.AUDIT_ENV_FILE || ".env.local", override: true })
process.env.VERCEL_ENV = "production"
delete process.env.CHAIRPEDIA_PREVIEW

async function main() {
  const [{ default: robots }, { VERIFIED_COMPARISON_PILOT_SLUGS, getVerifiedComparisonPilot }, { comparisonPublicationMetadata, isChairpediaPreview }] = await Promise.all([
    import("../app/robots"),
    import("../lib/comparisons/verified-pilots"),
    import("../lib/comparisons/publication"),
  ])

  const titles = new Set<string>()
  const descriptions = new Set<string>()
  for (const slug of VERIFIED_COMPARISON_PILOT_SLUGS) {
    const pilot = getVerifiedComparisonPilot(slug)
    assert.ok(pilot, `pilot missing: ${slug}`)
    const title = pilot.title
    const description = pilot.description
    assert.ok(title && description, `production metadata incomplete: ${slug}`)
    assert.ok(!titles.has(title), `duplicate production title: ${title}`)
    assert.ok(!descriptions.has(description), `duplicate production description: ${description}`)
    const publication = comparisonPublicationMetadata(slug, false)
    assert.equal(publication.alternates?.canonical, `/compare/${slug}`, `canonical mismatch: ${slug}`)
    assert.equal(publication.robots, undefined, `production robots block remains: ${slug}`)
    assert.equal(publication.openGraphUrl, `/compare/${slug}`, `Open Graph URL mismatch: ${slug}`)
    titles.add(title)
    descriptions.add(description)
  }
  assert.equal(isChairpediaPreview({ VERCEL_ENV: "production" }), false)
  assert.equal(isChairpediaPreview({ VERCEL_ENV: "preview" }), true)

  const robotsResult = robots()
  assert.deepEqual(robotsResult.rules, { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] })

  const page = readFileSync(resolve("app/compare/[slug]/page.tsx"), "utf8")
  const component = readFileSync(resolve("components/compare/verified-comparison.tsx"), "utf8")
  const nextConfig = readFileSync(resolve("next.config.mjs"), "utf8")
  const sitemapSource = readFileSync(resolve("app/sitemap.ts"), "utf8")
  assert.match(page, /preview && <div[^>]*>Chairpedia preview/, "Preview badge condition missing")
  assert.match(nextConfig, /VERCEL_ENV !== "preview"[\s\S]*return \[\]/, "production X-Robots-Tag condition missing")
  assert.doesNotMatch(page, /generateProductSchema|generateReviewSchema|generateAggregateRatingSchema/, "unsafe schema generator found")
  assert.match(page, /c\.faq\.length > 0 && !c\.requiresSourceReview && !pilot/, "pilot FAQ schema guard missing")
  assert.match(component, /alt=\{`\$\{record\.name\} product view`\}/, "product-specific image alt missing")
  assert.doesNotMatch(component, /rel="[^"]*nofollow/, "manufacturer sources unexpectedly nofollowed")
  assert.match(sitemapSource, /from\("comparisons"\)[\s\S]*\.eq\("status", "published"\)/, "published comparison sitemap query missing")

  console.log("comparison production readiness tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
