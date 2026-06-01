"use client"

import { useCallback, useEffect, useState } from "react"
import { Star, Trash2, Eye, EyeOff, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type ExperienceReview = {
  id: string
  created_at: string
  status: "pending" | "published"
  source: string
  gender: string | null
  height: string | null
  weight_or_body: string | null
  age_group: string | null
  job: string | null
  main_purpose: string | null
  sitting_hours: string | null
  previous_chair: string | null
  pain_areas: string[] | null
  standing_desk: string | null
  rank1_chair: string | null
  rank2_chair: string | null
  rank3_chair: string | null
  rating: number | null
  review_text: string | null
  selection_reasons: string[] | null
  purchase_reason: string | null
  photo_url: string | null
  store_location: string | null
  comparing_chairs: string | null
  nickname: string | null
  phone: string | null
}

const TABS = [
  { value: "pending", label: "검토 대기" },
  { value: "published", label: "게시됨" },
  { value: "all", label: "전체" },
] as const

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <span className="text-xs text-muted-foreground">
      <span className="text-foreground/50">{label}</span> {value}
    </span>
  )
}

function Chips({ items }: { items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
          {t}
        </span>
      ))}
    </div>
  )
}

export default function AdminExperiencePage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("pending")
  const [reviews, setReviews] = useState<ExperienceReview[]>([])
  const [counts, setCounts] = useState({ pending: 0, published: 0 })
  const [loading, setLoading] = useState(true)
  const [needsMigration, setNeedsMigration] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/experience?status=${tab}`)
    const data = await res.json()
    if (!res.ok) {
      toast({ title: "불러오기 실패", description: data.error, variant: "destructive" })
      setLoading(false)
      return
    }
    setReviews(data.reviews ?? [])
    if (data.counts) setCounts(data.counts)
    setNeedsMigration(Boolean(data.needsMigration))
    setLoading(false)
  }, [tab, toast])

  useEffect(() => {
    void load()
  }, [load])

  async function toggleStatus(r: ExperienceReview) {
    setBusy(r.id)
    const next = r.status === "published" ? "pending" : "published"
    const res = await fetch(`/api/admin/experience/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    })
    setBusy(null)
    if (!res.ok) {
      const d = await res.json()
      toast({ title: "변경 실패", description: d.error, variant: "destructive" })
      return
    }
    toast({ title: next === "published" ? "게시되었습니다" : "검토 대기로 변경" })
    void load()
  }

  async function remove(r: ExperienceReview) {
    if (!window.confirm("이 후기를 삭제할까요? 되돌릴 수 없습니다.")) return
    setBusy(r.id)
    const res = await fetch(`/api/admin/experience/${r.id}`, { method: "DELETE" })
    setBusy(null)
    if (!res.ok) {
      const d = await res.json()
      toast({ title: "삭제 실패", description: d.error, variant: "destructive" })
      return
    }
    toast({ title: "삭제되었습니다" })
    void load()
  }

  return (
    <div className="max-w-4xl p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium">체험 후기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          매장 체험 후기를 검토하고 게시 여부를 관리합니다. 검토 대기 {counts.pending} · 게시 {counts.published}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {t.label}
            {t.value === "pending" && counts.pending > 0 ? ` (${counts.pending})` : ""}
          </button>
        ))}
      </div>

      {needsMigration && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          experience_reviews 테이블이 아직 없습니다. Supabase SQL Editor에서{" "}
          <code>020_experience_reviews_store.sql</code> 마이그레이션을 먼저 실행하세요.
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">불러오는 중…</p>
      ) : reviews.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">후기가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      r.status === "published"
                        ? "bg-emerald-600/10 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {r.status === "published" ? "게시됨" : "검토 대기"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("ko-KR")}
                  </span>
                  {r.store_location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {r.store_location}
                    </span>
                  )}
                  {r.source === "import_614" && (
                    <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs text-blue-700">
                      614 import
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy === r.id}
                    onClick={() => void toggleStatus(r)}
                  >
                    {r.status === "published" ? (
                      <>
                        <EyeOff className="mr-1 h-3.5 w-3.5" /> 숨기기
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-3.5 w-3.5" /> 게시
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={busy === r.id}
                    onClick={() => void remove(r)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rankings */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {[r.rank1_chair, r.rank2_chair, r.rank3_chair].map((c, i) =>
                  c ? (
                    <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1">
                      <span className="font-semibold text-foreground/60">{i + 1}위</span>
                      <span className="font-medium">{c}</span>
                    </span>
                  ) : null
                )}
                {r.rating != null && (
                  <span className="inline-flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "h-4 w-4",
                          n <= (r.rating ?? 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </span>
                )}
              </div>

              {/* Review text */}
              {r.review_text && (
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                  “{r.review_text}”
                </p>
              )}

              {/* Photo */}
              {r.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photo_url}
                  alt="체험 사진"
                  className="mt-3 h-44 w-44 rounded-lg border border-border object-cover"
                />
              )}

              {/* Reasons */}
              {r.selection_reasons && r.selection_reasons.length > 0 && (
                <div className="mt-3">
                  <Chips items={r.selection_reasons} />
                </div>
              )}

              {/* Meta */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
                <Meta label="성별" value={r.gender} />
                <Meta label="키" value={r.height} />
                <Meta label="체형" value={r.weight_or_body} />
                <Meta label="연령" value={r.age_group} />
                <Meta label="직업" value={r.job} />
                <Meta label="목적" value={r.main_purpose} />
                <Meta label="착석" value={r.sitting_hours} />
                <Meta label="스탠딩" value={r.standing_desk} />
                <Meta label="기존의자" value={r.previous_chair} />
                <Meta label="비교중" value={r.comparing_chairs} />
                <Meta label="닉네임" value={r.nickname} />
                <Meta label="연락처" value={r.phone} />
              </div>
              {r.pain_areas && r.pain_areas.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-foreground/50">불편 부위</span>
                  <Chips items={r.pain_areas} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
