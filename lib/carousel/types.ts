// Shared types for the Instagram carousel generator (admin tool).

export type SlideLayout = "cover" | "text" | "stat" | "cta"

export type SlideStat = {
  before?: string // e.g. "110" (shown struck-through)
  after?: string // e.g. "43"  (the emphasized number)
  value?: string // e.g. "−60%" (single big value, when no before→after)
  label?: string // e.g. "Backrest pressure −60%"
}

export type Slide = {
  layout: SlideLayout
  eyebrow?: string // small caps kicker, e.g. "WHY MOVEMENT"
  title: string // the headline
  body?: string // supporting sentence(s)
  stat?: SlideStat
  image?: string | null // background image URL (cover/text layouts)
}

export type CarouselDraft = {
  slides: Slide[]
  caption: string // Instagram caption (first line hook + CTA + link-in-bio)
  hashtags: string[]
}

export type Ratio = "1x1" | "4x5"

export const RATIO_SIZE: Record<Ratio, { width: number; height: number }> = {
  "1x1": { width: 1080, height: 1080 },
  "4x5": { width: 1080, height: 1350 },
}

export const RATIO_LABEL: Record<Ratio, string> = {
  "1x1": "1:1 (square)",
  "4x5": "4:5 (portrait)",
}

// Editorial palette (matches the site's OG card + Chairpark tone).
export const CAROUSEL_COLORS = {
  ink: "#14110E",
  cream: "#F5F3EF",
  mutedCream: "#C9C3B8",
  accent: "#B4552F", // terracotta
  gold: "#B79B6E",
}

export const BRAND_WORDMARK = "FURNIBLOG"
export const CTA_URL = "furniblog.com"
