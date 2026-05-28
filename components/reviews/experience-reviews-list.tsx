import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type ExperienceReviewCard = {
  id: string
  createdAt: string
  sex: "male" | "female" | null
  heightBand: "~160" | "160s" | "170s" | "180s" | "185+" | null
  body: "below" | "normal" | "above" | null
  ageBand: "10s" | "20s" | "30s" | "40s" | "50s+" | null
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
  if (value === "male") return "남"
  if (value === "female") return "여"
  return null
}

function decodeBody(value: ExperienceReviewCard["body"]): string | null {
  if (value === "below") return "보통 이하"
  if (value === "normal") return "보통"
  if (value === "above") return "보통 이상"
  return null
}

function decodeSitHours(value: ExperienceReviewCard["sitHours"]): string | null {
  if (value === "under2") return "2시간 미만"
  if (value === "2to6") return "2~6시간"
  if (value === "over6") return "6시간 이상"
  return null
}

function buildProfileChips(item: ExperienceReviewCard): string[] {
  return [
    decodeSex(item.sex),
    item.heightBand,
    decodeBody(item.body),
    item.ageBand,
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
        <p className="font-medium text-foreground">첫 체험 후기를 남겨보세요</p>
        <p className="mt-2 text-sm text-muted-foreground">
          실제 체형과 사용 패턴을 공유하면 다른 사용자에게 큰 도움이 됩니다.
        </p>
        <Button asChild className="mt-5">
          <Link href="/reviews/new">체험 후기 쓰기</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const first = item.rankings.find((r) => r.rank === 1) ?? item.rankings[0]
        const compared = item.rankings
          .filter((r) => r.rank !== 1)
          .map((r) => r.chairName)

        return (
          <article
            key={item.id}
            className="rounded-xl border border-[#EFEFEF] bg-white p-5"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-50 text-emerald-800"
              >
                Chairpark Verified
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString("ko-KR")}
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

            {first ? (
              <h3 className="text-lg font-medium text-foreground">
                <Link href={`/products/${first.chairSlug}`} className="hover:underline">
                  1위: {first.chairName}
                </Link>
              </h3>
            ) : (
              <h3 className="text-lg font-medium text-foreground">1위 의자 없음</h3>
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

            {compared.length > 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">
                함께 비교: {compared.join(", ")}
              </p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
