import { SITE_URL } from "@/lib/site-config"

/** Site-wide author for editorial pages (blog, guides, comparisons). */
export const SITE_AUTHOR = { name: "Leo", path: "/about" } as const

/** schema.org author for editorial articles. */
export const SITE_AUTHOR_SCHEMA = { "@type": "Person", name: SITE_AUTHOR.name, url: `${SITE_URL}${SITE_AUTHOR.path}` } as const
