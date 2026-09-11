"use client"

import { useEffect, useState, type ReactNode } from "react"
import { readAmazonCountry, singaporeAmazonUrl } from "@/lib/affiliate/amazon-region"

export function RegionalAmazonLink({ href, name, className, children }: {
  href: string
  name: string
  className?: string
  children: ReactNode
}) {
  const [country, setCountry] = useState("US")
  useEffect(() => setCountry(readAmazonCountry()), [])
  const destination = singaporeAmazonUrl(href, name, country)
  const localized = country === "SG" && destination !== href
  return <a href={destination} target="_blank" rel="sponsored nofollow noopener noreferrer" className={className}>
    {localized ? (new URL(destination).pathname === "/s" ? "Search on Amazon.sg" : "View on Amazon.sg") : children}
  </a>
}
