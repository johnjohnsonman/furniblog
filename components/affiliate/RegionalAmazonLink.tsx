"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { readAmazonCountry, singaporeAmazonUrl } from "@/lib/affiliate/amazon-region"
import { buildAffiliateUrl, pageSubtag, trackAffiliateClick, type AffiliateCountry } from "@/lib/affiliate/links"

export function RegionalAmazonLink({ href, name, productId, className }: {
  href: string
  name: string
  productId: string
  className?: string
}) {
  const [country, setCountry] = useState("US")
  useEffect(() => setCountry(readAmazonCountry()), [])
  const destination = singaporeAmazonUrl(buildAffiliateUrl(href, "amazon", "US", pageSubtag(usePathname())), name, country)
  const search = /[?&]k=/.test(destination) || /amazon\.[a-z.]+\/s(\/|\?|$)/.test(destination)
  const retailer = /^https:\/\/(www\.)?amazon\.sg\//.test(destination) ? "Amazon.sg" : "Amazon"
  const trackingCountry: AffiliateCountry = country === "SG" || country === "JP" || country === "KR" ? country : "US"
  return <a href={destination} target="_blank" rel="sponsored nofollow noopener noreferrer" className={className}
    onClick={() => { void trackAffiliateClick(productId, "amazon", trackingCountry) }}>
    {search ? `Search on ${retailer}` : `View on ${retailer}`} <ExternalLink className="inline-block h-3 w-3 shrink-0" />
  </a>
}
