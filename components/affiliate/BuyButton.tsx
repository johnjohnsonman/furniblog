"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  buildAffiliateUrl,
  trackAffiliateClick,
  type AffiliateCountry,
} from "@/lib/affiliate/links"

type BuyButtonVariant = "amazon" | "coupang" | "official"

const VARIANT_STYLES: Record<BuyButtonVariant, string> = {
  amazon: "bg-foreground hover:bg-foreground/90 text-background",
  coupang: "bg-[#C0392B] hover:bg-[#a93226] text-white",
  official: "border border-border bg-background hover:bg-muted text-foreground",
}

const VARIANT_LABELS: Record<BuyButtonVariant, string> = {
  amazon: "View details & price",
  coupang: "Check price on Coupang",
  official: "Visit official store",
}

function readCountryCookie(): AffiliateCountry {
  if (typeof document === "undefined") return "US"
  const match = document.cookie.match(/(?:^|;\s*)x-country=([^;]+)/)
  const value = match?.[1]?.toUpperCase()
  if (value === "KR" || value === "JP") return value
  return "US"
}

interface BuyButtonProps {
  productId: string
  baseUrl: string
  retailer: BuyButtonVariant
  country?: AffiliateCountry
  className?: string
  fullWidth?: boolean
}

export function BuyButton({
  productId,
  baseUrl,
  retailer,
  country: countryProp,
  className,
  fullWidth = false,
}: BuyButtonProps) {
  const [country, setCountry] = useState<AffiliateCountry>(countryProp ?? "US")

  useEffect(() => {
    if (countryProp) {
      setCountry(countryProp)
      return
    }
    setCountry(readCountryCookie())
  }, [countryProp])

  const href = buildAffiliateUrl(baseUrl, retailer, country)

  const handleClick = useCallback(() => {
    void trackAffiliateClick(productId, retailer, country)
  }, [productId, retailer, country])

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        VARIANT_STYLES[retailer],
        fullWidth && "w-full",
        className
      )}
    >
      {VARIANT_LABELS[retailer]}
      <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
    </a>
  )
}

interface BuyButtonGroupProps {
  productId: string
  amazonUrl?: string | null
  coupangUrl?: string | null
  officialUrl?: string | null
  country?: AffiliateCountry
  className?: string
}

export function BuyButtonGroup({
  productId,
  amazonUrl,
  coupangUrl,
  officialUrl,
  country: countryProp,
  className,
}: BuyButtonGroupProps) {
  const [country, setCountry] = useState<AffiliateCountry>(countryProp ?? "US")

  useEffect(() => {
    if (countryProp) {
      setCountry(countryProp)
      return
    }
    setCountry(readCountryCookie())
  }, [countryProp])

  const showCoupang = country === "KR" && Boolean(coupangUrl)

  if (!amazonUrl && !coupangUrl && !officialUrl) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showCoupang && coupangUrl && (
        <BuyButton
          productId={productId}
          baseUrl={coupangUrl}
          retailer="coupang"
          country={country}
          fullWidth
        />
      )}
      {officialUrl && (
        <BuyButton
          productId={productId}
          baseUrl={officialUrl}
          retailer="official"
          country={country}
          fullWidth
        />
      )}
      {amazonUrl && (
        <BuyButton
          productId={productId}
          baseUrl={amazonUrl}
          retailer="amazon"
          country={country}
          fullWidth
        />
      )}
      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
        Affiliate link — we may earn a commission
      </p>
    </div>
  )
}
