const assert = require("node:assert/strict")
const { load } = require("cheerio")

const paths = [
  "/chairpedia/knoll-womb-chair",
  "/compare/knoll-womb-chair-vs-knoll-barcelona-chair",
  "/chairpedia/herman-miller-embody-gaming-chair",
]

async function main() {
  for (const pathname of paths) {
    const url = `https://www.furniblog.com${pathname}`
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
    const html = await response.text()
    const $ = load(html)
    const amazon = $('a[rel~="sponsored"][href*="amazon.com"]').toArray().map(el => new URL($(el).attr("href")))
    assert.equal(response.status, 200, pathname)
    assert.equal($('link[rel="canonical"]').attr("href"), url, `${pathname}: canonical`)
    assert.equal($("h1").length, 1, `${pathname}: h1`)
    assert.ok($('script[type="application/ld+json"]').length >= 2, `${pathname}: JSON-LD`)
    assert.ok(!/noindex/i.test($('meta[name="robots"]').attr("content") || ""), `${pathname}: indexable`)
    if (pathname.includes("womb-chair")) {
      assert.ok(html.includes("Research note"), `${pathname}: research disclosure`)
      assert.ok(html.includes("knoll-womb-chair") && html.includes("knoll-barcelona-chair"), `${pathname}: mutual links`)
    }
    if (pathname.includes("embody-gaming")) {
      assert.ok(amazon.some(url => url.pathname === "/s" || url.searchParams.has("k")), `${pathname}: search destination`)
      assert.ok(amazon.every(url => url.searchParams.get("tag") === "furniblog0e-20"), `${pathname}: affiliate tag`)
      assert.ok(!amazon.some(url => /\/dp\/[A-Z0-9]{10}/i.test(url.pathname)), `${pathname}: no forced ASIN`)
    }
    console.log(JSON.stringify({ pathname, status: response.status, schemas: $('script[type="application/ld+json"]').length, amazonLinks: amazon.length }))
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
