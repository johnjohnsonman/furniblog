const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "..")
const required = {
  "app/blog/[slug]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "ProductComparisonRail", 'placement="blog-buying"'],
  "app/chairpedia/[slug]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "ProductComparisonRail"],
  "app/compare/[slug]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "compare-top-a", "compare-bottom-a"],
  "app/products/[id]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "ProductComparisonRail", "product-mobile-sticky"],
}

required["app/chairpedia/[slug]/page.tsx"].push(
  "Research-based Chair Guide",
  "In short",
  "Confirm the seller, condition, delivery and return terms on Amazon."
)

const errors = []
for (const [file, needles] of Object.entries(required)) {
  const source = fs.readFileSync(path.join(root, file), "utf8")
  for (const needle of needles) if (!source.includes(needle)) errors.push(`${file}: missing ${needle}`)
  if (/\uFFFD/.test(source)) errors.push(`${file}: contains replacement characters`)
}

const richReview = fs.readFileSync(path.join(root, "components/chairpedia/rich-review.tsx"), "utf8")
if (!richReview.includes("data.includeDeepDive !== false")) {
  errors.push("rich-review.tsx: missing legacy-body suppression")
}
const richRegistry = fs.readFileSync(path.join(root, "lib/chairpedia/rich-data/index.ts"), "utf8")
if (!richRegistry.includes('"herman-miller-embody-gaming-chair"')) {
  errors.push("rich-data registry: missing reviewed Embody Gaming guide")
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log("contentRoutes 4")
console.log("sharedStandards true")
console.log("buyingGuideCoverage true")
