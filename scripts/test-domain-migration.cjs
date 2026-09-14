const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
function load(file, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(id => {
    assert.ok(Object.hasOwn(imports, id), `Unexpected dependency ${id}`)
    return imports[id]
  }, mod, mod.exports)
  return mod.exports
}
const site = load('lib/site-config.ts')
for (const host of site.CONTENT_HOSTS) {
  for (const scheme of ['http:', 'https:', '']) {
    assert.equal(site.publicSiteUrl(`${scheme}//${host}/blog/a?utm_source=old&tag=furniblog0e-20#details`), `${site.SITE_URL}/blog/a?utm_source=old&tag=furniblog0e-20#details`)
  }
}
for (const url of ['https://furniblog.com.evil.test/a', 'https://evilfurniblog.com/a', 'https://furniblog.com@evil.test/a', 'https://user@furniblog.com/a', 'https://furniblog.com:1234/a', 'javascript:alert(1)', 'mailto:hello@chairpark.com', 'https://www.amazon.com/dp/B012345678?tag=furniblog0e-20']) {
  assert.equal(site.publicSiteUrl(url), url)
}
assert.equal(site.publicSiteUrl('/products/a?x=1'), site.SITE_URL + '/products/a?x=1')
const { rewriteOwnedSiteLinks } = load('lib/blog/site-links.ts', { cheerio: require('cheerio'), '../site-config': site })
const html = '<p>Historical Furniblog credit</p><a href="https://www.furniblog.com/products/a?q=1#fit">Guide</a><img src="https://storage.example/furniblog.jpg" alt="Furniblog photo"><a href="https://amazon.com/dp/B012345678?tag=furniblog0e-20">Buy</a>'
const rewritten = rewriteOwnedSiteLinks(html)
assert.match(rewritten, /https:\/\/www.chairpedia.com\/products\/a\?q=1#fit/)
assert.match(rewritten, /Historical Furniblog credit/)
assert.match(rewritten, /https:\/\/storage.example\/furniblog.jpg/)
assert.match(rewritten, /tag=furniblog0e-20/)
assert.equal(rewriteOwnedSiteLinks(rewritten), rewritten)
const unrelated = '<p>Furniblog historical text</p><a href="/blog/a">Local</a>'
assert.equal(rewriteOwnedSiteLinks(unrelated), unrelated)
const media = load('lib/blog/media.ts', { cheerio: require('cheerio'), '../site-config': site })
for (const host of site.CONTENT_HOSTS) {
  assert.deepEqual(media.linkedProductSlugs(`<a href="https://${host}/products/aeron">Aeron</a>`), ['aeron'])
  assert.deepEqual(media.linkedChairpediaSlugs(`<a href="https://${host}/chairpedia/aeron-guide">Guide</a>`), ['aeron-guide'])
}
assert.deepEqual(media.linkedProductSlugs('<a href="https://furniblog.com.evil.test/products/aeron">Other</a>'), [])
assert.ok(media.bodyContainsImage('<img src="https://furniblog.com/images/chair.jpg">', 'https://www.chairpedia.com/images/chair.jpg'))
assert.equal(media.usableImageUrl('https://www.furniblog.com/images/chair.jpg'), 'https://www.chairpedia.com/images/chair.jpg')
const schemas = load('lib/seo/schemas.ts', { '@/lib/site-config': site })
const source = fs.readFileSync(path.resolve(__dirname, '../lib/seo/schemas.ts'), 'utf8')
assert.ok(!source.includes('https://www.furniblog.com'))
assert.ok(Object.keys(schemas).length > 0)
console.log('PASS: domain normalization, hostile lookalikes, path/query/fragment, historical text, affiliate tags, idempotent HTML and schema imports.')
