/**
 * Amazon Associates Creators API — product image fetch by ASIN.
 *
 * The classic Product Advertising API (PA-API 5.0, AWS SigV4) was retired on
 * 2026-05-15. Its replacement, the Creators API, uses OAuth2 client-credentials
 * (a bearer token) instead of request signing. Credentials come from the
 * Associates "Creators API" portal and are read from env only:
 *   PAAPI_ACCESS_KEY   — Credential ID  (used as OAuth client_id, e.g. amzn1.*)
 *   PAAPI_SECRET_KEY   — Credential Secret (OAuth client_secret; shown once)
 *   PAAPI_PARTNER_TAG  — store id (furniblog0e-20); falls back to NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG
 * Optional overrides:
 *   PAAPI_TOKEN_ENDPOINT (default https://api.amazon.com/auth/o2/token)
 *   PAAPI_BASE_URL       (default https://creatorsapi.amazon)
 *   PAAPI_MARKETPLACE    (default www.amazon.com)
 *   PAAPI_SCOPE          (default creatorsapi::default)
 *
 * Design notes:
 * - Fully env-gated: with no keys, calls return "NotConfigured" and
 *   getProductImages() returns null. Nothing throws.
 * - Eligibility: GetItems needs 10 qualifying sales in the trailing 30 days
 *   (up to 48h review). Until then Amazon rejects the call; we treat any miss as
 *   a soft fallback (empty frames / collapsed hero).
 * - The access token is cached in-process until shortly before it expires.
 */

const DEFAULT_TOKEN_ENDPOINT = "https://api.amazon.com/auth/o2/token"
const DEFAULT_BASE_URL = "https://creatorsapi.amazon"
const GETITEMS_PATH = "/catalog/v1/getItems"

// Resource names use lowercase dot-notation in the Creators API.
const RESOURCES = [
  "images.primary.large",
  "images.primary.medium",
  "images.variants.large",
  "itemInfo.title",
]

type PaapiEnv = {
  clientId: string
  clientSecret: string
  partnerTag: string
  tokenEndpoint: string
  baseUrl: string
  marketplace: string
  scope: string
}

export type ProductImages = {
  asin: string
  primary: string | null
  variants: string[]
  source: "creatorsapi"
}

export type PaapiOutcome = {
  ok: boolean
  images?: ProductImages
  errorCode?: string
  errorMessage?: string
  httpStatus?: number
  /** Raw response body, for debugging/inspection only. */
  raw?: unknown
}

function readEnv(): PaapiEnv | null {
  const clientId = process.env.PAAPI_ACCESS_KEY?.trim()
  const clientSecret = process.env.PAAPI_SECRET_KEY?.trim()
  const partnerTag =
    process.env.PAAPI_PARTNER_TAG?.trim() ||
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim()
  if (!clientId || !clientSecret || !partnerTag) return null
  return {
    clientId,
    clientSecret,
    partnerTag,
    tokenEndpoint: process.env.PAAPI_TOKEN_ENDPOINT?.trim() || DEFAULT_TOKEN_ENDPOINT,
    baseUrl: (process.env.PAAPI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, ""),
    marketplace: process.env.PAAPI_MARKETPLACE?.trim() || "www.amazon.com",
    scope: process.env.PAAPI_SCOPE?.trim() || "creatorsapi::default",
  }
}

/** True when Creators API credentials are present (does not check eligibility). */
export function isPaapiConfigured(): boolean {
  return readEnv() !== null
}

/** Case-insensitive nested getter (Creators API keys are camelCase; be tolerant). */
function ciGet(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj
  for (const seg of path) {
    if (cur == null || typeof cur !== "object") return undefined
    const rec = cur as Record<string, unknown>
    const key = Object.keys(rec).find((k) => k.toLowerCase() === seg.toLowerCase())
    if (key === undefined) return undefined
    cur = rec[key]
  }
  return cur
}

// ── OAuth2 token (cached in-process) ──────────────────────────────────────
let tokenCache: { value: string; expiresAt: number } | null = null

type TokenResult = { token?: string; errorCode?: string; errorMessage?: string; httpStatus?: number }

async function getAccessToken(env: PaapiEnv): Promise<TokenResult> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return { token: tokenCache.value }
  }

  let res: Response
  try {
    res = await fetch(env.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: env.clientId,
        client_secret: env.clientSecret,
        scope: env.scope,
      }),
    })
  } catch (e) {
    return { errorCode: "NetworkError", errorMessage: String(e) }
  }

  const text = await res.text()
  let json: Record<string, unknown> | null = null
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : null
  } catch {
    /* non-JSON */
  }

  if (!res.ok || !json?.access_token) {
    return {
      httpStatus: res.status,
      errorCode: (json?.error as string) || `TokenHTTP_${res.status}`,
      errorMessage: (json?.error_description as string) || text.slice(0, 300),
    }
  }

  const token = String(json.access_token)
  const expiresInSec = Number(json.expires_in) || 3600
  tokenCache = { value: token, expiresAt: now + expiresInSec * 1000 }
  return { token }
}

/** Low-level GetItems for a single ASIN. Never throws; returns a typed outcome. */
export async function fetchItemImages(asin: string): Promise<PaapiOutcome> {
  const env = readEnv()
  if (!env) {
    return { ok: false, errorCode: "NotConfigured", errorMessage: "Creators API env vars are not set." }
  }

  const tok = await getAccessToken(env)
  if (!tok.token) {
    return { ok: false, httpStatus: tok.httpStatus, errorCode: tok.errorCode ?? "TokenError", errorMessage: tok.errorMessage }
  }

  const body = JSON.stringify({
    itemIds: [asin],
    itemIdType: "ASIN",
    marketplace: env.marketplace,
    partnerTag: env.partnerTag,
    resources: RESOURCES,
  })

  let res: Response
  try {
    res = await fetch(`${env.baseUrl}${GETITEMS_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tok.token}`,
        "Content-Type": "application/json",
        "x-marketplace": env.marketplace,
      },
      body,
    })
  } catch (e) {
    return { ok: false, errorCode: "NetworkError", errorMessage: String(e) }
  }

  const text = await res.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    /* non-JSON */
  }

  const errors = ciGet(json, ["errors"]) as Array<Record<string, unknown>> | undefined
  if (errors?.length) {
    const err = errors[0]
    return {
      ok: false,
      httpStatus: res.status,
      errorCode: String(err.code ?? err.Code ?? "ApiError"),
      errorMessage: String(err.message ?? err.Message ?? ""),
      raw: json,
    }
  }
  // Access-denied / eligibility responses come back as { message, reason, type }.
  const reason = ciGet(json, ["reason"]) as string | undefined
  if (reason) {
    return {
      ok: false,
      httpStatus: res.status,
      errorCode: reason,
      errorMessage: (ciGet(json, ["message"]) as string | undefined) ?? "",
      raw: json,
    }
  }
  if (!res.ok) {
    return { ok: false, httpStatus: res.status, errorCode: `HTTP_${res.status}`, errorMessage: text.slice(0, 300), raw: json ?? text }
  }

  const items = ciGet(json, ["itemsResult", "items"]) as unknown[] | undefined
  const item = items?.[0]
  if (!item) {
    return { ok: false, httpStatus: res.status, errorCode: "NoItem", errorMessage: "No item returned.", raw: json }
  }

  const primary =
    (ciGet(item, ["images", "primary", "large", "url"]) as string | undefined) ??
    (ciGet(item, ["images", "primary", "medium", "url"]) as string | undefined) ??
    null

  const variantList = (ciGet(item, ["images", "variants"]) as unknown[] | undefined) ?? []
  const variants = variantList
    .map((v) => ciGet(v, ["large", "url"]))
    .filter((u): u is string => typeof u === "string")

  return { ok: true, httpStatus: res.status, images: { asin, primary, variants, source: "creatorsapi" }, raw: json }
}

/**
 * Friendly wrapper: returns images or null on any miss (not configured, not
 * eligible, no image). Never throws — safe to call unconditionally from page or
 * generation code.
 */
export async function getProductImages(
  asin: string | null | undefined
): Promise<ProductImages | null> {
  if (!asin) return null
  const outcome = await fetchItemImages(asin)
  if (outcome.ok && outcome.images?.primary) return outcome.images
  if (!outcome.ok && outcome.errorCode !== "NotConfigured") {
    console.warn(`[creatorsapi] ${asin}: ${outcome.errorCode} ${outcome.errorMessage ?? ""}`.trim())
  }
  return null
}
