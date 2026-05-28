"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ProductOption = {
  id: string
  slug: string
  name: string
  thumbnailUrl: string | null
}

type SingleValue<T extends string> = T | null

const SEX_OPTIONS = [
  { label: "남", value: "male" },
  { label: "여", value: "female" },
] as const
const HEIGHT_OPTIONS = ["~160", "160s", "170s", "180s", "185+"] as const
const BODY_OPTIONS = [
  { label: "보통 이하", value: "below" },
  { label: "보통", value: "normal" },
  { label: "보통 이상", value: "above" },
] as const
const AGE_OPTIONS = ["10s", "20s", "30s", "40s", "50s+"] as const
const JOB_OPTIONS = [
  "사무직",
  "개발·디자인",
  "전문직",
  "학생·고시생",
  "현장직",
  "기타",
] as const
const SIT_HOURS_OPTIONS = [
  { label: "2시간 미만", value: "under2" },
  { label: "2~6시간", value: "2to6" },
  { label: "6시간 이상", value: "over6" },
] as const
const USES_OPTIONS = [
  "업무",
  "공부",
  "게임",
  "영상 시청",
  "독서",
  "기타",
] as const
const PAIN_OPTIONS = [
  "목",
  "어깨",
  "허리",
  "엉덩이",
  "다리·하체",
  "없음",
] as const
const REASON_OPTIONS = [
  "편안한 등판",
  "푹신한 좌판",
  "헤드레스트",
  "사이즈가 잘 맞음",
  "팔걸이 조작",
  "소재",
  "디자인",
  "브랜드 명성",
] as const

const STEP_TITLES = [
  "순위 선택",
  "체형",
  "나는",
  "사용 패턴",
  "불편한 곳",
  "좋았던 점",
  "한마디",
  "추첨 응모",
] as const

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-black bg-black text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function selectSingle<T extends string>(
  current: SingleValue<T>,
  next: T
): SingleValue<T> {
  return current === next ? null : next
}

function toggleMulti(current: string[], value: string): string[] {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value]
}

export function ExperienceReviewWizard() {
  const [step, setStep] = useState(0)
  const [search, setSearch] = useState("")
  const [productResults, setProductResults] = useState<ProductOption[]>([])
  const [popularProducts, setPopularProducts] = useState<ProductOption[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [rankings, setRankings] = useState<ProductOption[]>([])
  const [sex, setSex] = useState<"male" | "female" | null>(null)
  const [heightBand, setHeightBand] = useState<
    "~160" | "160s" | "170s" | "180s" | "185+" | null
  >(null)
  const [body, setBody] = useState<"below" | "normal" | "above" | null>(null)
  const [ageBand, setAgeBand] = useState<
    "10s" | "20s" | "30s" | "40s" | "50s+" | null
  >(null)
  const [job, setJob] = useState<string | null>(null)
  const [sitHours, setSitHours] = useState<"under2" | "2to6" | "over6" | null>(
    null
  )
  const [uses, setUses] = useState<string[]>([])
  const [pain, setPain] = useState<string[]>([])
  const [reasons, setReasons] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [contact, setContact] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const progress = Math.round(((step + 1) / STEP_TITLES.length) * 100)
  const firstRankName = rankings[0]?.name

  async function fetchProducts(query = "") {
    setLoadingProducts(true)
    try {
      const res = await fetch(
        `/api/reviews/experience${query ? `?q=${encodeURIComponent(query)}` : ""}`
      )
      const json = (await res.json()) as { products?: ProductOption[] }
      if (!res.ok) throw new Error("의자 목록을 불러오지 못했습니다.")

      const list = json.products ?? []
      if (query) {
        setProductResults(list)
      } else {
        setPopularProducts(list)
      }
    } catch {
      if (query) setProductResults([])
      else setPopularProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    void fetchProducts("")
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) {
        setProductResults([])
        return
      }
      void fetchProducts(search.trim())
    }, 250)
    return () => clearTimeout(t)
  }, [search])

  const canGoNext = useMemo(() => {
    if (step === 0) return rankings.length >= 1
    return true
  }, [step, rankings.length])

  function addOrRemoveRanking(product: ProductOption) {
    const exists = rankings.some((r) => r.id === product.id)
    if (exists) {
      setRankings((prev) => prev.filter((r) => r.id !== product.id))
      return
    }
    if (rankings.length >= 3) return
    setRankings((prev) => [...prev, product])
  }

  async function handleSubmit() {
    if (rankings.length < 1) {
      setSubmitError("1위 의자는 필수입니다.")
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/reviews/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rankings: rankings.map((r) => r.id),
          sex,
          heightBand,
          body,
          ageBand,
          job,
          sitHours,
          uses,
          pain,
          reasons,
          comment: comment.trim() || null,
          contact: contact.trim() || null,
        }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setSubmitError(json.error ?? "제출에 실패했습니다.")
        return
      }
      setDone(true)
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
          제출이 완료되었습니다
        </h2>
        <p className="mt-2 text-sm text-neutral-600">검토 후 게시됩니다.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {sex ? <span className="rounded-full border px-3 py-1 text-xs">{sex === "male" ? "남" : "여"}</span> : null}
          {heightBand ? <span className="rounded-full border px-3 py-1 text-xs">{heightBand}</span> : null}
          {body ? (
            <span className="rounded-full border px-3 py-1 text-xs">
              {body === "below" ? "보통 이하" : body === "normal" ? "보통" : "보통 이상"}
            </span>
          ) : null}
          {ageBand ? <span className="rounded-full border px-3 py-1 text-xs">{ageBand}</span> : null}
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
          <span>
            STEP {step + 1} / {STEP_TITLES.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-neutral-100">
          <div
            className="h-1.5 rounded-full bg-neutral-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
          체험 후기 작성
        </h1>
        <p className="mt-1 text-sm text-neutral-600">{STEP_TITLES[step]}</p>
      </div>

      <div className="min-h-[320px]">
        {step === 0 && (
          <div className="space-y-5">
            <p className="text-sm text-neutral-600">
              의자를 탭한 순서대로 1·2·3위가 됩니다. (최대 3개)
            </p>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="의자 이름 검색 (예: Aeron)"
              className="h-11"
            />

            {rankings.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  선택된 순위
                </p>
                <div className="space-y-2">
                  {rankings.map((r, idx) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => addOrRemoveRanking(r)}
                      className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm"
                    >
                      <span>
                        {idx + 1}위 · {r.name}
                      </span>
                      <span className="text-xs text-neutral-500">제거</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
                {search.trim() ? "검색 결과" : "인기 의자"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(search.trim() ? productResults : popularProducts).map((p) => (
                  <Chip
                    key={p.id}
                    active={rankings.some((r) => r.id === p.id)}
                    onClick={() => addOrRemoveRanking(p)}
                  >
                    {p.name}
                  </Chip>
                ))}
                {loadingProducts && (
                  <span className="text-xs text-neutral-500">불러오는 중…</span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">성별</p>
              <div className="flex flex-wrap gap-2">
                {SEX_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    active={sex === o.value}
                    onClick={() => setSex(selectSingle(sex, o.value))}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">키</p>
              <div className="flex flex-wrap gap-2">
                {HEIGHT_OPTIONS.map((o) => (
                  <Chip
                    key={o}
                    active={heightBand === o}
                    onClick={() => setHeightBand(selectSingle(heightBand, o))}
                  >
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">체형</p>
              <div className="flex flex-wrap gap-2">
                {BODY_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    active={body === o.value}
                    onClick={() => setBody(selectSingle(body, o.value))}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">연령대</p>
              <div className="flex flex-wrap gap-2">
                {AGE_OPTIONS.map((o) => (
                  <Chip
                    key={o}
                    active={ageBand === o}
                    onClick={() => setAgeBand(selectSingle(ageBand, o))}
                  >
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">직업</p>
              <div className="flex flex-wrap gap-2">
                {JOB_OPTIONS.map((o) => (
                  <Chip
                    key={o}
                    active={job === o}
                    onClick={() => setJob(selectSingle(job, o))}
                  >
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">하루 착석시간</p>
              <div className="flex flex-wrap gap-2">
                {SIT_HOURS_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    active={sitHours === o.value}
                    onClick={() => setSitHours(selectSingle(sitHours, o.value))}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">주 용도 (복수)</p>
              <div className="flex flex-wrap gap-2">
                {USES_OPTIONS.map((o) => (
                  <Chip
                    key={o}
                    active={uses.includes(o)}
                    onClick={() => setUses((prev) => toggleMulti(prev, o))}
                  >
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-800">불편한 곳 (복수)</p>
            <div className="flex flex-wrap gap-2">
              {PAIN_OPTIONS.map((o) => (
                <Chip
                  key={o}
                  active={pain.includes(o)}
                  onClick={() => setPain((prev) => toggleMulti(prev, o))}
                >
                  {o}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-800">
              좋았던 점 (1위 의자 기준)
            </p>
            {firstRankName ? (
              <p className="mb-3 text-xs text-neutral-500">1위: {firstRankName}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {REASON_OPTIONS.map((o) => (
                <Chip
                  key={o}
                  active={reasons.includes(o)}
                  onClick={() => setReasons((prev) => toggleMulti(prev, o))}
                >
                  {o}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-800">
              1위 의자 한마디 (선택)
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="한 줄로 남겨주세요."
              className="min-h-[160px]"
            />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-800">추첨 응모 연락처 (선택)</p>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="이메일 또는 휴대폰"
              className="h-11"
            />
            <p className="text-xs text-neutral-500">
              연락처는 비공개로 저장되며 화면/응답에 노출되지 않습니다.
            </p>
          </div>
        )}
      </div>

      {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
        >
          이전
        </Button>
        <div className="flex gap-2">
          {step > 0 && step < STEP_TITLES.length - 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.min(STEP_TITLES.length - 1, s + 1))}
              disabled={submitting}
            >
              건너뛰기
            </Button>
          )}
          {step < STEP_TITLES.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(STEP_TITLES.length - 1, s + 1))}
              disabled={!canGoNext || submitting}
            >
              다음
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setContact("")
                  void handleSubmit()
                }}
                disabled={submitting}
              >
                건너뛰고 제출
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "제출 중..." : "제출"}
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
