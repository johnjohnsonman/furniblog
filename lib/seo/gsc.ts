import crypto from "crypto"

/**
 * Minimal Google Search Console (Search Analytics) client using a service
 * account — no external deps. Mints a signed JWT, exchanges it for an OAuth
 * token (cached), and queries the Search Analytics API.
 *
 * Env (from the service-account JSON + GSC property):
 *   GSC_CLIENT_EMAIL   service account email
 *   GSC_PRIVATE_KEY    service account private key (PEM; \n-escaped is fine)
 *   GSC_SITE_URL       e.g. "sc-domain:furniblog.com" or "https://www.furniblog.com/"
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"

export function isGscConfigured(): boolean {
  return Boolean(
    process.env.GSC_CLIENT_EMAIL &&
      process.env.GSC_PRIVATE_KEY &&
      process.env.GSC_SITE_URL
  )
}

function siteUrl(): string {
  return (process.env.GSC_SITE_URL ?? "").trim()
}

/** Robustly normalize the PEM (tolerate surrounding quotes, trailing comma, \n escapes). */
function privateKey(): string {
  let k = (process.env.GSC_PRIVATE_KEY ?? "").trim()
  if (k.endsWith(",")) k = k.slice(0, -1)
  if (k.startsWith('"') && k.endsWith('"')) k = k.slice(1, -1)
  return k.split("\\n").join("\n")
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.value

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claim = b64url(
    JSON.stringify({
      iss: process.env.GSC_CLIENT_EMAIL,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  )
  const signature = b64url(
    crypto.sign("RSA-SHA256", Buffer.from(`${header}.${claim}`), privateKey())
  )
  const jwt = `${header}.${claim}.${signature}`

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const json = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string }
  if (!json.access_token) {
    throw new Error(`GSC token error: ${json.error_description ?? "no access_token"}`)
  }
  cachedToken = { value: json.access_token, expiresAt: now + (json.expires_in ?? 3600) }
  return cachedToken.value
}

export type GscRow = {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

async function query(body: Record<string, unknown>): Promise<GscRow[]> {
  const token = await getAccessToken()
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl())}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GSC query failed (HTTP ${res.status}): ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as { rows?: GscRow[] }
  return json.rows ?? []
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export type SeoOverview = {
  range: { startDate: string; endDate: string; days: number }
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  trend: { date: string; clicks: number; impressions: number }[]
  topQueries: GscRow[]
  topPages: GscRow[]
  byCountry: GscRow[]
}

/** One call → everything the admin SEO dashboard needs. */
export async function getSeoOverview(days = 28): Promise<SeoOverview> {
  const end = new Date()
  const start = new Date(end.getTime() - days * 86400 * 1000)
  const startDate = ymd(start)
  const endDate = ymd(end)
  const base = { startDate, endDate }

  const [byDate, queries, pages, countries] = await Promise.all([
    query({ ...base, dimensions: ["date"], rowLimit: 1000 }),
    query({ ...base, dimensions: ["query"], rowLimit: 25 }),
    query({ ...base, dimensions: ["page"], rowLimit: 25 }),
    query({ ...base, dimensions: ["country"], rowLimit: 20 }),
  ])

  const totals = byDate.reduce(
    (acc, r) => {
      acc.clicks += r.clicks
      acc.impressions += r.impressions
      return acc
    },
    { clicks: 0, impressions: 0 }
  )
  const ctr = totals.impressions ? totals.clicks / totals.impressions : 0
  // Impression-weighted average position across the period.
  const weightedPos = byDate.reduce((s, r) => s + r.position * r.impressions, 0)
  const position = totals.impressions ? weightedPos / totals.impressions : 0

  return {
    range: { startDate, endDate, days },
    totals: { clicks: totals.clicks, impressions: totals.impressions, ctr, position },
    trend: byDate
      .map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topQueries: queries,
    topPages: pages,
    byCountry: countries,
  }
}
