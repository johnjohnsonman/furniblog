const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { chromium } = require('playwright');
const cases = [
  ['herman-miller-aeron-tilt-lock-why-your-chair-still-moves-and-why-that-s-normal', 'herman-miller-aeron'],
  ['herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c', 'herman-miller-aeron'],
  ['how-to-use-the-herman-miller-aeron-a-complete-control-guide', 'herman-miller-aeron'],
  ['steelcase-leap-v2-review-the-chair-that-hugs-your-body', 'steelcase-leap-v2'],
  ['steelcase-leap-vs-gesture-which-high-end-ergonomic-chair-is-right-for-you', 'steelcase-leap-v2'],
  ['steelcase-leap-vs-gesture-which-high-end-ergonomic-chair-is-right-for-you', 'steelcase-gesture'],
  ['herman-miller-x-logitech-g-embody-gaming-chair-materials-and-features-explained', 'herman-miller-embody-gaming'],
  ['libernovo-lineup-explained-omni-omni-se-omni-pro-maxis-compared', 'libernovo-omni'],
];
async function main() {
  const base = process.argv[2] || 'https://www.furniblog.com';
  const dir = resolve(__dirname, '../data/seo-audit');
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const [width, country] of [[390, 'US'], [1440, 'US'], [390, 'SG']]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      let calls = 0;
      await context.route('**/*', route => {
        const u = new URL(route.request().url());
        if (/google-analytics\.com$|googletagmanager\.com$|clarity\.ms$|vercel-insights\.com$|amazon\.(com|sg)$/.test(u.hostname)) return route.abort();
        if (u.pathname === '/api/affiliate/track') { calls++; return route.fulfill({ status: 200, body: '{}' }); }
        if (u.pathname.startsWith('/api/track/')) return route.fulfill({ status: 200, body: '{}' });
        return route.continue();
      });
      await context.addInitScript(country => {
        document.cookie = `x-country=${country}; path=/`;
        document.addEventListener('click', e => { if (e.target instanceof Element && e.target.closest('a[rel~="sponsored"]')) e.preventDefault(); }, true);
      }, country);
      const page = await context.newPage();
      for (const [slug, product] of cases) {
        const path = '/blog/' + slug;
        const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 });
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.furniblog.com' + path);
        const section = page.getByTestId('blog-buying');
        assert.equal(await section.count(), 1);
        const offer = section.locator(`[data-buying-product="${product}"]`);
        assert.equal(await offer.count(), 1);
        assert.equal(await section.locator('[data-buying-product]').count(), slug.startsWith('steelcase-leap-vs-gesture-') ? 2 : 1);
        const button = offer.locator('a[rel~="sponsored"]').first();
        const url = new URL(await button.getAttribute('href'));
        assert.equal(url.hostname, country === 'SG' ? 'www.amazon.sg' : 'www.amazon.com');
        assert.equal(url.searchParams.get('tag'), country === 'SG' ? 'furniblog-22' : 'furniblog0e-20');
        const asin = { 'steelcase-leap-v2': 'B073G1K465' }[product];
        const direct = Boolean(asin) && country === 'US';
        assert.match(await button.innerText(), direct ? /View on Amazon/ : /Search on Amazon/);
        if (direct) assert.equal(url.pathname, '/dp/' + asin);
        if (product === 'herman-miller-embody-gaming') assert.match(url.searchParams.get('k'), /Logitech G Embody Gaming/);
        if (product === 'libernovo-omni') assert.equal(url.searchParams.get('k'), 'LiberNovo Omni');
        if (product === 'steelcase-gesture') assert.equal(url.searchParams.get('k').toLowerCase(), 'steelcase gesture');
        for (const href of await section.locator('li a').evaluateAll(links => links.map(a => a.href))) {
          assert.equal((await context.request.get(href)).status(), 200);
        }
        await section.scrollIntoViewIfNeeded();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
        await page.screenshot({ path: resolve(dir, `blog-buying-${slug}-${country}-${width}.png`) });
        const before = calls;
        const logged = page.waitForResponse(r => new URL(r.url()).pathname === '/api/affiliate/track');
        await button.click();
        await logged;
        const events = await page.evaluate(() => (window.dataLayer || []).filter(e => e[0] === 'event' && e[1] === 'affiliate_click').map(e => e[2]));
        assert.equal(events.length, 1);
        assert.equal(events[0].product_id, product);
        assert.equal(events[0].page_path, path);
        assert.equal(calls - before, 1);
        console.log(JSON.stringify({ slug, product, width, country, routing: 'pass', related: 'pass', oneClick: true }));
      }
      await context.close();
    }
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
