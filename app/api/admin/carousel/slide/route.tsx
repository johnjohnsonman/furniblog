import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import {
  RATIO_SIZE,
  CAROUSEL_COLORS as C,
  BRAND_WORDMARK,
  CTA_URL,
  type Ratio,
  type Slide,
} from "@/lib/carousel/types"

export const runtime = "nodejs"

// --- serif font (best-effort; falls back to the built-in sans) -------------
let serifCache: ArrayBuffer | null | undefined
async function loadSerif(): Promise<ArrayBuffer | null> {
  if (serifCache !== undefined) return serifCache
  try {
    // Old UA → Google returns a .ttf src (Satori can't use woff2).
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" }, cache: "force-cache" }
    ).then((r) => r.text())
    const m = css.match(/src:\s*url\(([^)]+\.ttf)\)/)
    if (!m) { serifCache = null; return null }
    const buf = await fetch(m[1], { cache: "force-cache" }).then((r) => r.arrayBuffer())
    serifCache = buf
    return buf
  } catch {
    serifCache = null
    return null
  }
}

function titleSize(title: string, base: number): number {
  const n = title.length
  if (n <= 18) return base
  if (n <= 30) return Math.round(base * 0.82)
  if (n <= 46) return Math.round(base * 0.66)
  return Math.round(base * 0.55)
}

const SERIF = "Serif"

function TopBar({ index, total, color }: { index: number; total: number; color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 80,
        right: 80,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color,
        fontSize: 26,
        letterSpacing: 4,
        fontWeight: 600,
      }}
    >
      <div style={{ display: "flex" }}>{BRAND_WORDMARK}</div>
      <div style={{ display: "flex" }}>{index + 1} / {total}</div>
    </div>
  )
}

function renderSlide(slide: Slide, index: number, total: number, hasSerif: boolean) {
  const serif = hasSerif ? SERIF : undefined
  const eyebrow = slide.eyebrow?.toUpperCase()

  if (slide.layout === "cta") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: C.accent,
          padding: 90,
        }}
      >
        <TopBar index={index} total={total} color="rgba(245,243,239,0.85)" />
        <div style={{ display: "flex", color: "rgba(245,243,239,0.8)", fontSize: 30, letterSpacing: 8, fontWeight: 600 }}>
          {eyebrow || "MORE STORY"}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: serif,
            color: C.cream,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.1,
            textAlign: "center",
            marginTop: 30,
            maxWidth: 820,
          }}
        >
          {slide.title || "Read the full story"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            background: C.cream,
            color: C.ink,
            fontSize: 38,
            fontWeight: 700,
            padding: "24px 48px",
            borderRadius: 999,
          }}
        >
          {CTA_URL} →
        </div>
        <div style={{ display: "flex", marginTop: 30, color: "rgba(245,243,239,0.85)", fontSize: 28 }}>
          👆 Link in bio
        </div>
      </div>
    )
  }

  if (slide.layout === "stat") {
    const s = slide.stat ?? {}
    const hasBA = Boolean(s.before && s.after)
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: C.ink,
          padding: 90,
        }}
      >
        <TopBar index={index} total={total} color={C.gold} />
        {eyebrow && (
          <div style={{ display: "flex", color: C.accent, fontSize: 30, letterSpacing: 8, fontWeight: 600 }}>
            {eyebrow}
          </div>
        )}
        {slide.title && (
          <div
            style={{
              display: "flex",
              fontFamily: serif,
              color: C.cream,
              fontSize: 58,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.1,
              marginTop: 18,
              maxWidth: 820,
            }}
          >
            {slide.title}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 30, gap: 28 }}>
          {hasBA && (
            <div style={{ display: "flex", fontFamily: serif, color: "rgba(201,195,184,0.55)", fontSize: 140, fontWeight: 700, textDecoration: "line-through" }}>
              {s.before}
            </div>
          )}
          {hasBA && (
            <div style={{ display: "flex", color: C.accent, fontSize: 96 }}>→</div>
          )}
          <div style={{ display: "flex", fontFamily: serif, color: C.cream, fontSize: hasBA ? 200 : 240, fontWeight: 700, lineHeight: 1 }}>
            {hasBA ? s.after : s.value}
          </div>
        </div>
        {s.label && (
          <div style={{ display: "flex", color: C.mutedCream, fontSize: 36, textAlign: "center", marginTop: 34, maxWidth: 760 }}>
            {s.label}
          </div>
        )}
      </div>
    )
  }

  // cover / text — full-bleed image + gradient + bottom-aligned text
  const base = slide.layout === "cover" ? 100 : 84
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: C.ink,
      }}
    >
      {slide.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.image}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `linear-gradient(180deg, rgba(20,17,14,0.15) 0%, rgba(20,17,14,0.45) 55%, rgba(20,17,14,0.92) 100%)`,
        }}
      />
      <TopBar index={index} total={total} color="rgba(245,243,239,0.9)" />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 90,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {eyebrow && (
          <div style={{ display: "flex", color: C.accent, fontSize: 30, letterSpacing: 7, fontWeight: 600, marginBottom: 20 }}>
            {eyebrow}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontFamily: serif,
            color: C.cream,
            fontSize: titleSize(slide.title, base),
            fontWeight: 700,
            lineHeight: 1.08,
          }}
        >
          {slide.title}
        </div>
        {slide.body && (
          <div style={{ display: "flex", color: C.mutedCream, fontSize: 34, lineHeight: 1.35, marginTop: 26, maxWidth: 860 }}>
            {slide.body}
          </div>
        )}
      </div>
    </div>
  )
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const ratio = (searchParams.get("ratio") as Ratio) || "1x1"
  const size = RATIO_SIZE[ratio] ?? RATIO_SIZE["1x1"]
  const index = Number(searchParams.get("i") ?? 0)
  const total = Number(searchParams.get("n") ?? 1)

  let slide: Slide
  try {
    slide = JSON.parse(searchParams.get("d") ?? "{}") as Slide
  } catch {
    slide = { layout: "text", title: "" }
  }

  const serif = await loadSerif()

  return new ImageResponse(renderSlide(slide, index, total, Boolean(serif)), {
    width: size.width,
    height: size.height,
    fonts: serif
      ? [{ name: SERIF, data: serif, weight: 700 as const, style: "normal" as const }]
      : undefined,
  })
}
