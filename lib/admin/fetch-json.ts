/** Safe JSON parse for admin client fetch calls. */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, init)

    const text = await res.text()
    let data: T | { error?: string; details?: string }

    try {
      data = text ? (JSON.parse(text) as T) : ({} as T)
    } catch {
      console.error("API error (non-JSON):", text.slice(0, 200))
      return {
        ok: false,
        error: res.ok
          ? "Invalid JSON response from server"
          : `API request failed (${res.status})`,
      }
    }

    if (!res.ok) {
      const errBody = data as { error?: string; details?: string }
      console.error("API error:", text)
      return {
        ok: false,
        error: errBody.error ?? errBody.details ?? `API request failed (${res.status})`,
      }
    }

    return { ok: true, data: data as T }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    }
  }
}
