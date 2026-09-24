import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const page = readFileSync(resolve("app/compare/[slug]/page.tsx"), "utf8")
const component = readFileSync(resolve("components/compare/verified-comparison.tsx"), "utf8")
const publication = readFileSync(resolve("lib/comparisons/publication.ts"), "utf8")
const robots = readFileSync(resolve("app/robots.ts"), "utf8")
const nextConfig = readFileSync(resolve("next.config.mjs"), "utf8")

assert.match(publication, /VERCEL_ENV === "preview"/, "comparison preview detection missing")
assert.match(publication, /robots: preview \? \{ index: false/, "preview metadata noindex missing")
assert.match(publication, /alternates: preview \? undefined/, "preview canonical must be omitted")
assert.match(page, /robots: publication\.robots/, "comparison metadata must use the shared publication policy")
assert.match(page, /Chairpedia preview · Not for publication/, "preview disclosure missing")
assert.match(nextConfig, /X-Robots-Tag[\s\S]*noindex, nofollow/, "preview response header missing")
assert.match(robots, /disallow: "\/"/, "preview robots.txt block missing")
assert.match(page, /!c\.requiresSourceReview && !pilot/, "legacy FAQ must not reach pilot pages")
assert.doesNotMatch(page, /generateReviewSchema|generateAggregateRatingSchema|generateProductSchema/, "unsupported structured data generator found")
assert.match(page, /c\.requiresSourceReview \? <section/, "non-pilot safety block missing")
assert.match(page, /!pilot && <BuyingGuideRail/, "pilot must not render generic commercial guide rail")
assert.match(page, /pilot \? <footer/, "pilot must use the neutral footer")
assert.match(page, /c\.hero_image_url && !pilot/, "pilot must not render legacy comparison artwork")
assert.match(component, /data-testid="mobile-comparison-cards"/, "mobile comparison layout missing")
assert.match(component, /Selected configurations/, "consumer-facing option wording missing")
assert.doesNotMatch(component, /Verification pending|By configuration/, "admin-facing status wording remains")

console.log("comparison preview safety tests passed")
