const assert = require("node:assert/strict")
const { load } = require("cheerio")
const slugs = [
  "x-chair-x4-vs-x-chair-x3",
  "gtplayer-footrest-vs-homall-racing-gaming-chair",
  "homall-executive-vs-la-z-boy-bellamy",
  "libernovo-omni-vs-sihoo-doro-s300",
]
async function main() {
  for (const slug of slugs) {
    const url = `https://www.furniblog.com/compare/${slug}`
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
    const $ = load(await response.text())
    const schemas = $('script[type="application/ld+json"]').toArray().map(el => JSON.parse($(el).text()))
    const amazon = $('a[rel~="sponsored"][href*="amazon.com"]').toArray().map(el => new URL($(el).attr("href")))
    assert.equal(response.status, 200, slug)
    assert.equal($('link[rel="canonical"]').attr("href"), url, `${slug}: canonical`)
    assert.equal($("h1").length, 1, `${slug}: h1`)
    assert.ok(schemas.some(schema => schema["@type"] === "Article"), `${slug}: Article schema`)
    assert.ok(schemas.some(schema => schema["@type"] === "FAQPage"), `${slug}: FAQ schema`)
    assert.ok(amazon.length >= 2 && amazon.every(link => link.searchParams.get("tag") === "furniblog0e-20"), `${slug}: Amazon tag`)
    assert.ok($('main a[href^="/products/"]').length >= 2, `${slug}: product links`)
    console.log(JSON.stringify({ slug, status: response.status, amazon: amazon.length, schemas: schemas.map(schema => schema["@type"]) }))
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
