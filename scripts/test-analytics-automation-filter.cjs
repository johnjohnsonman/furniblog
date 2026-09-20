const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const vm = require('node:vm')

const source = readFileSync(resolve(__dirname, '../components/analytics/GoogleAnalytics.tsx'), 'utf8')
const match = source.match(/const bootstrap = `([\s\S]*?)`\n/)
assert(match, 'GA bootstrap script must remain testable')

function boot({ webdriver = false, search = '', stored = null } = {}) {
  const appended = []
  const values = new Map(stored ? [['chairpedia_analytics', stored]] : [])
  const window = {
    location: { search },
    navigator: { webdriver },
    sessionStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    },
  }
  const document = {
    createElement: () => ({}),
    head: { appendChild: node => appended.push(node) },
  }
  const script = match[1].replace('${JSON.stringify(id)}', JSON.stringify('G-TEST123'))
  vm.runInNewContext(script, { window, document, URLSearchParams, encodeURIComponent, Date })
  return { window, appended, values }
}

const human = boot()
assert.equal(human.window.__chairpediaAnalyticsEnabled, true)
assert.equal(human.appended.length, 1)
assert.match(human.appended[0].src, /googletagmanager\.com/)

const automated = boot({ webdriver: true })
assert.equal(automated.window.__chairpediaAnalyticsEnabled, false)
assert.equal(automated.appended.length, 0)
assert.equal(automated.window.gtag, undefined)

const optedOut = boot({ search: '?__analytics=off' })
assert.equal(optedOut.window.__chairpediaAnalyticsEnabled, false)
assert.equal(optedOut.values.get('chairpedia_analytics'), 'off')

const restored = boot({ search: '?__analytics=on', stored: 'off' })
assert.equal(restored.window.__chairpediaAnalyticsEnabled, true)
assert.equal(restored.appended.length, 1)

console.log('PASS: analytics loads for visitors and stays off for automation or explicit test sessions')
