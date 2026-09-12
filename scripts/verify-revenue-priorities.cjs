const { readFileSync } = require("node:fs")
const { resolve } = require("node:path")

const root = resolve(__dirname, "..")
const prioritySource = readFileSync(resolve(root, "lib/growth/revenue-priorities.ts"), "utf8")
const catalogSource = readFileSync(resolve(root, "lib/data/affiliate-links-data.ts"), "utf8")

function parseList(name) {
  const block = prioritySource.match(new RegExp(`${name}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as const`))
  if (!block) throw new Error(`Missing ${name}`)
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
}

const priorities = [
  ...parseList("REVENUE_PRIORITY_SLUGS"),
  ...parseList("REVENUE_EXPANSION_SLUGS"),
]
const directSlugs = new Set()
let currentSlug = null

for (const line of catalogSource.split(/\r?\n/)) {
  const key = line.match(/^\s*"([^"]+)"\s*:\s*\[/)
  if (key) currentSlug = key[1]
  if (currentSlug && /amazon\.com\/dp\/[A-Z0-9]{10}/i.test(line)) {
    directSlugs.add(currentSlug)
    currentSlug = null
  }
}

const duplicates = priorities.filter((slug, index) => priorities.indexOf(slug) !== index)
const missingDirectLinks = priorities.filter((slug) => !directSlugs.has(slug))

const result = {
  priorityCount: priorities.length,
  uniqueCount: new Set(priorities).size,
  directCatalogCount: directSlugs.size,
  duplicates: [...new Set(duplicates)],
  missingDirectLinks,
}

console.log(JSON.stringify(result, null, 2))

if (priorities.length !== 70 || duplicates.length > 0 || missingDirectLinks.length > 0) {
  process.exitCode = 1
}
