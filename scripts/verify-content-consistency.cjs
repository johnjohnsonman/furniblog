const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "..")
const required = {
  "app/blog/[slug]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "ProductComparisonRail", 'placement="blog-buying"'],
  "app/chairpedia/[slug]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "ProductComparisonRail"],
  "app/compare/[slug]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "compare-top-a", "compare-bottom-a"],
  "app/products/[id]/page.tsx": ["BuyingGuideRail", "ContentStandardsNote", "ProductComparisonRail", "product-mobile-sticky"],
}

const errors = []
for (const [file, needles] of Object.entries(required)) {
  const source = fs.readFileSync(path.join(root, file), "utf8")
  for (const needle of needles) if (!source.includes(needle)) errors.push(`${file}: missing ${needle}`)
  if (/\uFFFD/.test(source)) errors.push(`${file}: contains replacement characters`)
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log("contentRoutes 4")
console.log("sharedStandards true")
console.log("buyingGuideCoverage true")
