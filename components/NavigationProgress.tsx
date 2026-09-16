"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

/** Immediate navigation feedback without streaming 404 pages as HTTP 200. */
export function NavigationProgress() {
  const pathname = usePathname()
  const [pending, setPending] = useState(false)
  useEffect(() => { setPending(false) }, [pathname])
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const start = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!link || link.download || (link.target && link.target !== "_self") || link.classList.contains("atlas-store-card")) return
      const url = new URL(link.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      setPending(true)
      clearTimeout(timer)
      timer = setTimeout(() => setPending(false), 15000)
    }
    const reset = () => { clearTimeout(timer); setPending(false) }
    document.addEventListener("click", start, true)
    window.addEventListener("pageshow", reset)
    window.addEventListener("popstate", reset)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("click", start, true)
      window.removeEventListener("pageshow", reset)
      window.removeEventListener("popstate", reset)
    }
  }, [])
  if (!pending) return null
  return <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
    <div className="h-1 bg-blue-600 motion-safe:animate-pulse" />
    <span className="absolute right-3 top-3 rounded-full border bg-white px-3 py-1.5 text-xs text-neutral-700 shadow-sm">Loading page…</span>
  </div>
}
