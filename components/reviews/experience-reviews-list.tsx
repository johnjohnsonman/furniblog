import Link from "next/link"
import { Button } from "@/components/ui/button"

export type ExperienceReviewCard = {
  id: string
  createdAt: string
  sex: "male" | "female" | null
  heightBand:
    | "under_5_4"
    | "5_4_5_7"
    | "5_8_5_11"
    | "6_0_6_2"
    | "6_3plus"
    | null
  body: string | null
  ageBand: "under20" | "20s" | "30s" | "40s" | "50plus" | null
  job: string | null
  sitHours: "under2" | "2to6" | "over6" | null
  pain: string[]
  reasons: string[]
  comment: string | null
  rankings: Array<{
    rank: 1 | 2 | 3
    chairSlug: string
    chairName: string
  }>
}

function decodeSex(value: ExperienceReviewCard["sex"]): string | null {
  if (value === "male") return "Male"
  if (value === "female") return "Female"
  return null
}

function decodeBody(value: ExperienceReviewCard["body"]): string | null {
  const map: Record<string, string> = {
    slim: "Slim",
    below: "Below average",
    normal: "Average",
    above: "Above average",
    large: "Larger",
  }
  return value ? map[value] ?? value : null
}

function decodeHeight(value: ExperienceReviewCard["heightBand"]): string | null {
  if (value === "under_5_4") return `under 5'4" · <163 cm`
  if (value === "5_4_5_7") return `5'4"–5'7" · 163–170 cm`
  if (value === "5_8_5_11") return `5'8"–5'11" · 171–180 cm`
  if (value === "6_0_6_2") return `6'0"–6'2" · 181–188 cm`
  if (value === "6_3plus") return `6'3"+ · 189+ cm`
  return null
}

function decodeAge(value: ExperienceReviewCard["ageBand"]): string | null {
  if (value === "under20") return "Under 20"
  if (value === "50plus") return "50+"
  return value
}

function decodeSitHours(value: ExperienceReviewCard["sitHours"]): string | null {
  if (value === "under2") return "Under 2 hrs"
  if (value === "2to6") return "2–6 hrs"
  if (value === "over6") return "6+ hrs"
  return null
}

function buildProfileChips(item: ExperienceReviewCard): string[] {
  return [
    decodeSex(item.sex),
    decodeHeight(item.heightBand),
    decodeBody(item.body),
    decodeAge(item.ageBand),
    item.job,
    decodeSitHours(item.sitHours),
    ...(item.pain ?? []),
  ].filter((v): v is string => Boolean(v))
}

export function ExperienceReviewsList({
  items,
}: {
  items: ExperienceReviewCard[]
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[#EFEFEF] bg-white px-6 py-14 text-center">
        <p className="font-medium text-foreground">Be the first to share your experience review.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your real-world body profile and usage pattern can help others choose better.
        </p>
        <Button asChild className="mt-5">
          <Link href="/reviews/new">Write a Review</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        return (
          <article
            key={item.id}
            className="rounded-xl border border-[#EFEFEF] bg-white p-5"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString("en-US")}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {buildProfileChips(item).map((chip, idx) => (
                <span
                  key={`${item.id}-chip-${idx}-${chip}`}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
                >
                  {chip}
                </span>
              ))}
            </div>

            {item.rankings.length > 0 ? (
              <ol className="space-y-1.5">
                {item.rankings.map((r) => (
                  <li key={r.chairSlug} className="flex items-baseline gap-2.5">
                    <span
                      className={`shrink-0 font-semibold ${
                        r.rank === 1
                          ? "text-sm text-[#9a7b4f]"
                          : "text-xs text-muted-foreground"
                      }`}
                    >
                      #{r.rank}
                    </span>
                    <Link
                      href={`/products/${r.chairSlug}`}
                      className={`hover:underline ${
                        r.rank === 1
                          ? "text-lg font-medium text-foreground"
                          : "text-sm text-neutral-700"
                      }`}
                    >
                      {r.chairName}
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <h3 className="text-lg font-medium text-foreground">
                No top chair selected
              </h3>
            )}

            {item.reasons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.reasons.map((reason) => (
                  <span
                    key={`${item.id}-reason-${reason}`}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}

            {item.comment ? (
              <p className="mt-4 text-sm leading-6 text-neutral-700">{item.comment}</p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
