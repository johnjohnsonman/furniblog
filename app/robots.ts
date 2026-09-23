import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview" || process.env.CHAIRPEDIA_PREVIEW === "true") {
    return { rules: { userAgent: "*", disallow: "/" } }
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
