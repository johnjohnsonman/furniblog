"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { readAmazonCountry, resolveAmazonDestination } from "@/lib/affiliate/amazon-region"
import { buildAffiliateUrl, pageSubtag, trackAffiliateClick, type AffiliateCountry } from "@/lib/affiliate/links"

export function RegionalAmazonLink({ href, name, productId, className }: {
  href: string
  name: string
  productId: string
  className?: string
}) {
  const [country, setCountry] = useState("US")
  useEffect(() => setCountry(readAmazonCountry()), [])
  const destination = resolveAmazonDestination(buildAffiliateUrl(href, "amazon", "US", pageSubtag(usePathname())), name, country)
  const trackingCountry = destination.country as AffiliateCountry
  return <a href={destination.url} target="_blank" rel={`${destination.affiliate ? "sponsored " : ""}nofollow noopener noreferrer`} className={className}
    onClick={() => { void trackAffiliateClick(productId, "amazon", trackingCountry, "regional_amazon_link") }}>
    {destination.search ? `Search on ${destination.label}` : `View on ${destination.label}`} <ExternalLink className="inline-block h-3 w-3 shrink-0" />
  </a>
}
