"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

// Fires a first-party pageview beacon on every route change. Skips admin so the
// dashboard doesn't inflate its own numbers.
export function PageviewTracker() {
  const pathname = usePathname()
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith("/admin")) return
    if (last.current === pathname) return
    last.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    })

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track/pageview",
          new Blob([payload], { type: "application/json" })
        )
      } else {
        void fetch("/api/track/pageview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        })
      }
    } catch {
      // never break navigation
    }
  }, [pathname])

  return null
}
