import type { Brand } from "@/types/brand"

export const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  US: { name: "USA", flag: "🇺🇸" },
  JP: { name: "Japan", flag: "🇯🇵" },
  DE: { name: "Germany", flag: "🇩🇪" },
  IT: { name: "Italy", flag: "🇮🇹" },
  NO: { name: "Norway", flag: "🇳🇴" },
  CH: { name: "Switzerland", flag: "🇨🇭" },
  KR: { name: "Korea", flag: "🇰🇷" },
  CN: { name: "China", flag: "🇨🇳" },
  SE: { name: "Sweden", flag: "🇸🇪" },
  FI: { name: "Finland", flag: "🇫🇮" },
  GB: { name: "UK", flag: "🇬🇧" },
  AT: { name: "Austria", flag: "🇦🇹" },
  CA: { name: "Canada", flag: "🇨🇦" },
  AU: { name: "Australia", flag: "🇦🇺" },
  SG: { name: "Singapore", flag: "🇸🇬" },
  FR: { name: "France", flag: "🇫🇷" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
  DK: { name: "Denmark", flag: "🇩🇰" },
}

export type CountryFilterPill = { label: string; value: string }

export function getCountryFilterPills(brands: Brand[]): CountryFilterPill[] {
  const codes = [
    ...new Set(
      brands
        .map((b) => b.country?.trim().toUpperCase())
        .filter((c): c is string => Boolean(c))
    ),
  ].sort()

  return [
    { label: "All", value: "all" },
    ...codes.map((code) => {
      const mapped = COUNTRY_MAP[code]
      const label = mapped ? `${mapped.flag} ${mapped.name}` : code
      return { label, value: code }
    }),
  ]
}

export function getCountryDisplayLabel(code: string | undefined): string {
  if (!code?.trim()) return ""
  const upper = code.trim().toUpperCase()
  const mapped = COUNTRY_MAP[upper]
  return mapped ? `${mapped.flag} ${mapped.name}` : upper
}

export const BRAND_HERO_FALLBACKS: Record<string, string> = {
  "herman-miller":
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200",
  steelcase:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
  okamura:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
  humanscale:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
  "hag-flokk":
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
  vitra:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
  knoll:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
  haworth:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
  sidiz:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200",
}

export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200"

export const BRAND_WARRANTY_YEARS: Record<string, number> = {
  "herman-miller": 12,
  steelcase: 12,
  humanscale: 15,
  okamura: 10,
  "hag-flokk": 10,
  vitra: 10,
  knoll: 10,
  haworth: 12,
  sidiz: 5,
}

const BRAND_DESCRIPTION_FALLBACKS: Record<string, string> = {
  "herman-miller":
    "Pioneers of modern furniture design, Herman Miller has defined ergonomic office seating for decades with icons like the Aeron and Embody.",
  steelcase:
    "Steelcase leads global workplace design with research-driven ergonomic chairs built for enterprise environments and hybrid work.",
  okamura:
    "Okamura combines Japanese precision engineering with premium ergonomic seating trusted in offices across Asia and worldwide.",
  humanscale:
    "Humanscale designs intuitive ergonomic products that prioritize natural movement, comfort, and long-hour desk work.",
  "hag-flokk":
    "HÅG and Flokk bring Scandinavian design philosophy to dynamic seating that encourages movement and active sitting.",
  vitra:
    "Vitra collaborates with leading designers to produce furniture that balances architectural aesthetics with everyday comfort.",
  knoll:
    "Knoll pairs modernist design heritage with rigorous manufacturing for iconic task and lounge seating.",
  haworth:
    "Haworth delivers sustainable, adaptable workplace furniture with a strong focus on ergonomic task chairs.",
  sidiz:
    "Sidiz is a leading Korean ergonomic chair brand offering strong value, local availability, and competitive features at mid-range pricing.",
}

export function getBrandHeroImage(slug: string, heroImageUrl?: string | null): string {
  if (heroImageUrl?.trim()) return heroImageUrl.trim()
  return BRAND_HERO_FALLBACKS[slug] ?? DEFAULT_HERO_IMAGE
}

export function getBrandLogoInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function getBrandLongDescription(brand: Brand): string {
  if (brand.descriptionLong?.trim()) return brand.descriptionLong.trim()
  if (brand.description?.trim()) return brand.description.trim()
  return (
    BRAND_DESCRIPTION_FALLBACKS[brand.slug] ??
    `${brand.name} manufactures premium ergonomic seating for modern workspaces.`
  )
}

export function getBrandWarrantyLabel(slug: string): string | null {
  const years = BRAND_WARRANTY_YEARS[slug]
  if (!years) return null
  return `${years}yr Warranty`
}

export function getBrandGradientStyle(
  colorPrimary?: string,
  colorSecondary?: string
): { background: string } {
  const primary = colorPrimary ?? "#1A1A1A"
  const secondary = colorSecondary ?? "#4A4A4A"
  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 55%, ${primary} 100%)`,
  }
}
