/**
 * Best-effort resolution of a real article thumbnail from a Google News URL.
 *
 * Google News RSS links are encoded redirects that hide both the publisher URL
 * and the article image (the page's own og:image is just the generic Google
 * News logo). We resolve the real publisher URL via Google's internal
 * `batchexecute` endpoint, then read that page's og:image.
 *
 * This is intentionally best-effort: Google changes this format periodically,
 * so EVERY failure path returns null and the caller falls back to a brand image.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

async function fetchText(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Resolve a Google News RSS article URL to the real publisher URL (or null). */
export async function resolveRealArticleUrl(
  googleNewsUrl: string,
  timeoutMs = 6000
): Promise<string | null> {
  const m = googleNewsUrl.match(/articles\/([^?]+)/)
  if (!m) return null
  const enc = m[1]

  const page = await fetchText(
    googleNewsUrl,
    { headers: { "User-Agent": UA } },
    timeoutMs
  )
  if (!page) return null

  const sig = page.match(/data-n-a-sg="([^"]+)"/)?.[1]
  const ts = page.match(/data-n-a-ts="([^"]+)"/)?.[1]
  if (!sig || !ts) return null

  const payload = [
    "garturlreq",
    [
      ["X", "X", ["X", "X"], null, null, 1, 1, "US:en", null, 1, null, null, null, null, null, 0, 1],
      enc,
      Number(ts),
      sig,
    ],
  ]
  const freq = [[["Fbv4je", JSON.stringify(payload), null, "generic"]]]
  const body = "f.req=" + encodeURIComponent(JSON.stringify(freq))

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let text: string
  try {
    const res = await fetch(
      "https://news.google.com/_/DotsSplashUi/data/batchexecute",
      {
        method: "POST",
        headers: {
          "User-Agent": UA,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
        signal: controller.signal,
      }
    )
    text = await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }

  // The real URL is embedded in the (JSON-ish) batchexecute response.
  const real = text.match(
    /"(https?:\/\/(?!news\.google\.com|www\.google\.com)[^"\\]+)"/
  )?.[1]
  return real ?? null
}

/** Extract og:image (or twitter:image) from a publisher page's HTML. */
function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ]
  for (const p of patterns) {
    const found = html.match(p)?.[1]
    if (found && /^https?:\/\//.test(found)) return found
  }
  return null
}

/**
 * Full pipeline: Google News URL -> real publisher URL -> og:image.
 * Returns null on any failure so the caller can fall back to a brand image.
 */
export async function resolveArticleThumbnail(
  googleNewsUrl: string,
  timeoutMs = 6000
): Promise<string | null> {
  try {
    const realUrl = await resolveRealArticleUrl(googleNewsUrl, timeoutMs)
    if (!realUrl) return null
    const html = await fetchText(
      realUrl,
      { headers: { "User-Agent": UA }, redirect: "follow" },
      timeoutMs
    )
    if (!html) return null
    return extractOgImage(html)
  } catch {
    return null
  }
}
