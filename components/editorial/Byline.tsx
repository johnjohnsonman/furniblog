import Link from "next/link"
import { SITE_AUTHOR } from "@/lib/seo/author"

/** "By Leo" — links to the About page. */
export function Byline() {
  return (
    <span>
      By{" "}
      <Link href={SITE_AUTHOR.path} className="font-medium text-foreground hover:underline">
        {SITE_AUTHOR.name}
      </Link>
    </span>
  )
}
