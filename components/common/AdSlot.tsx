"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface AdSlotProps {
  position: "header" | "in-content" | "sidebar" | "footer"
  className?: string
  adSlot?: string
}

const SIZE_MAP: Record<
  AdSlotProps["position"],
  { width: number; height: number; label: string }
> = {
  header: { width: 728, height: 90, label: "728 × 90" },
  "in-content": { width: 336, height: 280, label: "336 × 280" },
  sidebar: { width: 300, height: 250, label: "300 × 250" },
  footer: { width: 728, height: 90, label: "728 × 90" },
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID

function isAdsenseEnabled(): boolean {
  return Boolean(ADSENSE_ID && ADSENSE_ID !== "ca-pub-XXXXXXXX")
}

export function AdSlot({ position, className, adSlot }: AdSlotProps) {
  const insRef = useRef<HTMLElement>(null)
  const { width, height, label } = SIZE_MAP[position]
  const enabled = isAdsenseEnabled()

  useEffect(() => {
    if (!enabled || !insRef.current) return
    try {
      const w = window as Window & { adsbygoogle?: unknown[] }
      w.adsbygoogle = w.adsbygoogle ?? []
      w.adsbygoogle.push({})
    } catch {
      // AdSense script not loaded yet
    }
  }, [enabled, position])

  if (!enabled) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground mx-auto",
          className
        )}
        style={{ width: "100%", maxWidth: width, minHeight: height }}
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-wider font-medium">
          Advertisement
        </span>
        <span className="text-xs mt-1">{label}</span>
      </div>
    )
  }

  return (
    <div
      className={cn("overflow-hidden mx-auto", className)}
      style={{ width: "100%", maxWidth: width, minHeight: height }}
    >
      <ins
        ref={insRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: "block", width: `${width}px`, height: `${height}px` }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={adSlot ?? ""}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </div>
  )
}
