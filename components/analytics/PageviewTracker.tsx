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
    if (pathname.startsWith("/admin") || pathname.startsWith("/chair-fit-report/")) return
    if (navigator.webdriver || window.__chairpediaAnalyticsEnabled === false) return
    if (last.current === pathname) return
    last.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    })

    try {
      window.gtag?.("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      })

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

declare global {
  interface Window {
    __chairpediaAnalyticsEnabled?: boolean
    gtag?: (
      command: "event",
      eventName: string,
      parameters: Record<string, string>
    ) => void
  }
}
