const { createPrivateKey, sign } = require('node:crypto')
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: resolve(__dirname, '../.env.gsc.local'), quiet: true })
require('dotenv').config({ path: resolve(__dirname, '../.env.local'), quiet: true })

async function main() {
  const end = new Date(Date.now() - 3 * 864e5)
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27)
  const range = { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) }
  const report = { generatedAt: new Date().toISOString(), range, notes: ['GSC and GA4 use their own reporting timezones; counts are not a joined conversion funnel.', 'Affiliate events are not unique visitors, orders or commission.', 'Associates orders and net commission are unavailable through these APIs.'], ga4: {}, gsc: {}, affiliate: {} }
  const credentials = process.env.GSC_CREDENTIALS_FILE ? JSON.parse(readFileSync(process.env.GSC_CREDENTIALS_FILE, 'utf8')) : null
  const pem = (credentials?.private_key || process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n') || '').trim().replace(/^["']/, '').replace(/["'],?\s*$/, '')
  const key = createPrivateKey(pem)
  const enc = data => Buffer.from(JSON.stringify(data)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: credentials?.client_email || process.env.GSC_CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 1200 })}`
  const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}` }), signal: AbortSignal.timeout(30000) })
  const token = await auth.json()
  if (!auth.ok || !token.access_token) throw Error('Google read-only authentication failed')
  async function google(url, body) {
    const res = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) })
    const data = await res.json()
    if (!res.ok) throw Error(`Google API ${res.status}: ${data.error?.message || 'request failed'}`)
    return data
  }
  try {
    const accounts = await google('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200')
    if (accounts.nextPageToken) throw Error('Account list incomplete')
    const properties = (accounts.accountSummaries || []).flatMap(a => a.propertySummaries || []).filter(p => /chairpedia|furniblog/i.test(p.displayName || ''))
    if (properties.length !== 1) throw Error(`Expected one Chairpedia/Furniblog property; found ${properties.length}`)
    const definitions = [
      ['sources', ['countryId', 'sessionSourceMedium'], ['sessions', 'engagedSessions']],
      ['landings', ['countryId', 'landingPagePlusQueryString'], ['sessions', 'engagedSessions']],
      ['affiliateEvents', ['countryId', 'pagePath'], ['eventCount']],
      ['showroomEvents', ['countryId', 'pagePath'], ['eventCount']],
    ]
    for (const [name, dimensions, metrics] of definitions) {
      const data = await google(`https://analyticsdata.googleapis.com/v1beta/${properties[0].property}:runReport`, {
        dateRanges: [range], dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })),
        ...(['affiliateEvents', 'showroomEvents'].includes(name) ? {
          dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: {
            matchType: 'EXACT', value: name === 'affiliateEvents' ? 'affiliate_click' : 'showroom_action',
          } } },
        } : {}),
        limit: 10000, orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
      })
      if ((data.rowCount || 0) > (data.rows || []).length) throw Error(`${name}: result truncated`)
      report.ga4[name] = { metadata: data.metadata, rows: (data.rows || []).map(r => Object.fromEntries([...dimensions.map((d, i) => [d, r.dimensionValues[i].value]), ...metrics.map((m, i) => [m, Number(r.metricValues[i].value)])])) }
    }
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    const recent = await google(`https://analyticsdata.googleapis.com/v1beta/${properties[0].property}:runReport`, {
      dateRanges: [{ startDate: '2026-09-11', endDate: yesterday }],
      dimensions: [{ name: 'date' }, { name: 'countryId' }], metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'affiliate_click' } } }, limit: 10000,
    })
    report.ga4.postInstrumentation = { startDate: '2026-09-11', endDate: yesterday, rows: recent.rows || [], metadata: recent.metadata, note: 'Separate short observation window; not comparable to the 28-day baseline.' }
    report.ga4.status = 'ok'
  } catch (error) { report.ga4.status = 'unavailable'; report.ga4.error = error.message }
  try {
    const data = await google(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(process.env.GSC_SITE_URL)}/searchAnalytics/query`, { ...range, type: 'web', dataState: 'final', dimensions: ['page', 'country'], rowLimit: 25000 })
    if ((data.rows || []).length === 25000) throw Error('GSC pagination required')
    report.gsc = { status: 'ok', aggregation: data.responseAggregationType, rows: data.rows || [] }
  } catch (error) { report.gsc = { status: 'unavailable', error: error.message } }
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const nextDay = new Date(`${range.endDate}T00:00:00Z`); nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  const byPage = new Map()
  let total = 0
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('affiliate_clicks').select('product_id,retailer_name,referrer,country,clicked_at')
      .gte('clicked_at', `${range.startDate}T00:00:00+09:00`).lt('clicked_at', `${nextDay.toISOString().slice(0, 10)}T00:00:00+09:00`).order('clicked_at').range(from, from + 999)
    if (error) throw error
    total += data.length
    for (const row of data) {
      let page = '(unknown)'
      try { const u = new URL(row.referrer); page = ['www.furniblog.com', 'furniblog.com', 'www.chairpedia.com', 'chairpedia.com'].includes(u.hostname) ? u.pathname : '(external/test)' } catch {}
      const key = JSON.stringify([page, row.country, row.retailer_name, row.product_id])
      byPage.set(key, (byPage.get(key) || 0) + 1)
    }
    if (data.length < 1000) break
  }
  report.affiliate = { status: 'ok', timeZone: 'Asia/Seoul', totalEvents: total, historicalCountryCaveat: 'Before the September 10 country fix, US may be a routing fallback.', rows: [...byPage].map(([key, events]) => { const [page, country, retailer, productId] = JSON.parse(key); return { page, country, retailer, productId, events } }).sort((a, b) => b.events - a.events) }
  const dir = resolve(__dirname, '../data/revenue')
  mkdirSync(dir, { recursive: true })
  const file = resolve(dir, `baseline-${Date.now()}.json`)
  writeFileSync(file, JSON.stringify(report, null, 2), { flag: 'wx' })
  console.log(JSON.stringify({ file, range, ga4: report.ga4.status, gsc: report.gsc.status, affiliateEvents: total, showroomEvents: report.ga4.showroomEvents, sources: report.ga4.sources?.rows.filter(r => r.countryId === 'US').slice(0, 12), landings: report.ga4.landings?.rows.filter(r => r.countryId === 'US').slice(0, 30), ga4Affiliate: report.ga4.affiliateEvents, postInstrumentation: report.ga4.postInstrumentation, errors: [report.ga4.error, report.gsc.error].filter(Boolean) }, null, 2))
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
