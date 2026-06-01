"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, Star, Upload, X, Check, PartyPopper, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Product = {
  id: string
  slug: string
  name: string
  thumbnailUrl: string | null
}

const GENDER = ["남성", "여성"]
const HEIGHT = ["~160", "161-165", "166-170", "171-175", "176-180", "181+"]
const BODY = ["마른 편", "보통", "통통한 편", "건장한 편"]
const AGE = ["10대", "20대", "30대", "40대", "50대", "60대+"]
const JOB = ["사무직", "개발·디자인", "전문직", "학생", "현장직", "프리랜서", "기타"]
const PURPOSE = ["업무·학습", "게임·인터넷", "창작 작업", "휴식·시청"]
const SIT_HOURS = ["~2시간", "2-4시간", "4-6시간", "6-8시간", "8-10시간", "10시간+"]
const PAIN = ["목", "어깨", "허리", "엉덩이", "다리·하체", "없음"]
const STANDING = ["사용", "안 함"]
const REASONS = [
  "편안한 등판",
  "사이즈 잘 맞음",
  "소재 품질",
  "팔걸이 조작",
  "디자인",
  "브랜드 명성",
  "좌압 분산",
  "통기성",
]
const STORES = ["한남", "강남", "일산", "마포"]

const STEP_TITLES = ["의자 선택", "체험자 정보", "사용 패턴", "평가 & 후기"]
const TOTAL_STEPS = 4

function ChoiceButton({
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
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export function StoreExperienceWizard() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — chairs
  const [chairQuery, setChairQuery] = useState("")
  const [chairResults, setChairResults] = useState<Product[]>([])
  const [loadingChairs, setLoadingChairs] = useState(false)
  const [ranked, setRanked] = useState<Product[]>([])

  // Step 2
  const [gender, setGender] = useState<string | null>(null)
  const [height, setHeight] = useState<string | null>(null)
  const [body, setBody] = useState<string | null>(null)
  const [age, setAge] = useState<string | null>(null)

  // Step 3
  const [job, setJob] = useState<string | null>(null)
  const [purpose, setPurpose] = useState<string | null>(null)
  const [sitHours, setSitHours] = useState<string | null>(null)
  const [prevChair, setPrevChair] = useState("")
  const [pain, setPain] = useState<string[]>([])
  const [standing, setStanding] = useState<string | null>(null)

  // Step 4
  const [rating, setRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [reasons, setReasons] = useState<string[]>([])
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [store, setStore] = useState<string | null>(null)
  const [comparing, setComparing] = useState("")
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingChairs(true)
    const t = setTimeout(() => {
      const qs = chairQuery.trim() ? `?q=${encodeURIComponent(chairQuery.trim())}` : ""
      fetch(`/api/reviews/experience${qs}`)
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setChairResults(d.products ?? [])
        })
        .catch(() => {
          if (!cancelled) setChairResults([])
        })
        .finally(() => {
          if (!cancelled) setLoadingChairs(false)
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [chairQuery])

  function toggleChair(p: Product) {
    setRanked((prev) => {
      const idx = prev.findIndex((c) => c.id === p.id)
      if (idx >= 0) return prev.filter((c) => c.id !== p.id)
      if (prev.length >= 3) return prev
      return [...prev, p]
    })
  }

  function rankOf(p: Product): number | null {
    const idx = ranked.findIndex((c) => c.id === p.id)
    return idx >= 0 ? idx + 1 : null
  }

  function toggleMulti(
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    noneValue?: string
  ) {
    if (noneValue && value === noneValue) {
      setList(list.includes(noneValue) ? [] : [noneValue])
      return
    }
    let next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value]
    if (noneValue) next = next.filter((v) => v !== noneValue)
    setList(next)
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    setPhoto(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const canNext = useMemo(() => {
    if (step === 1) return ranked.length >= 1
    if (step === 4) return reviewText.trim().length > 0
    return true
  }, [step, ranked.length, reviewText])

  async function submit() {
    if (!ranked.length) {
      setStep(1)
      setError("1위 의자를 선택해 주세요.")
      return
    }
    if (!reviewText.trim()) {
      setError("한 줄 후기를 입력해 주세요.")
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      rank1_chair: ranked[0]?.name ?? null,
      rank2_chair: ranked[1]?.name ?? null,
      rank3_chair: ranked[2]?.name ?? null,
      rank1_chair_id: ranked[0]?.id ?? null,
      rank2_chair_id: ranked[1]?.id ?? null,
      rank3_chair_id: ranked[2]?.id ?? null,
      gender,
      height,
      weight_or_body: body,
      age_group: age,
      job,
      main_purpose: purpose,
      sitting_hours: sitHours,
      previous_chair: prevChair,
      pain_areas: pain,
      standing_desk: standing,
      rating,
      review_text: reviewText,
      selection_reasons: reasons,
      store_location: store,
      comparing_chairs: comparing,
      nickname,
      phone,
    }

    const fd = new FormData()
    fd.append("payload", JSON.stringify(payload))
    if (photo) fd.append("photo", photo)

    try {
      const res = await fetch("/api/experience/submit", {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "제출에 실패했습니다.")
      setDone(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-semibold">
          감사합니다! 🎉
        </h1>
        <p className="mt-3 text-muted-foreground">
          소중한 후기가 정상적으로 접수되었어요. 검토 후 사이트에 게시됩니다.
        </p>
        <div className="mt-6 w-full rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          후기가 게시되면 <span className="font-medium text-foreground">매장 적립금/쿠폰</span> 등
          소정의 혜택을 안내드릴 예정이에요. (입력하신 연락처로 안내)
        </div>
        <Button asChild className="mt-8 w-full">
          <a href="/">처음으로</a>
        </Button>
      </div>
    )
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {step}. {STEP_TITLES[step - 1]}
          </span>
          <span className="text-muted-foreground">
            {step} / {TOTAL_STEPS}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1 — chairs */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-semibold">
              앉아본 의자를 좋았던 순서로 골라주세요
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              1위는 필수, 2·3위는 선택이에요. 탭해서 선택/해제할 수 있어요.
            </p>
          </div>

          {ranked.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ranked.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleChair(c)}
                  className="flex items-center gap-1.5 rounded-full bg-foreground py-1.5 pl-2.5 pr-2 text-sm text-background"
                >
                  <span className="font-semibold">{i + 1}위</span>
                  <span className="max-w-[140px] truncate">{c.name}</span>
                  <X className="h-3.5 w-3.5 opacity-70" />
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="의자 이름 검색 (예: 아론, 립)"
              value={chairQuery}
              onChange={(e) => setChairQuery(e.target.value)}
            />
          </div>

          {loadingChairs ? (
            <p className="py-10 text-center text-sm text-muted-foreground">불러오는 중…</p>
          ) : chairResults.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              검색 결과가 없어요.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {chairResults.map((p) => {
                const rank = rankOf(p)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleChair(p)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border bg-card text-left transition-all",
                      rank
                        ? "border-foreground ring-2 ring-foreground"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <div className="aspect-square w-full bg-muted">
                      {p.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnailUrl}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          이미지 없음
                        </div>
                      )}
                    </div>
                    {rank && (
                      <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                        {rank}
                      </span>
                    )}
                    <div className="p-2.5">
                      <p className="line-clamp-2 text-xs font-medium leading-snug">
                        {p.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2 — about you */}
      {step === 2 && (
        <div className="space-y-7">
          <p className="text-sm text-muted-foreground">
            전부 선택 항목이에요. 해당되는 것만 탭해주세요.
          </p>
          <Field label="성별">
            <div className="flex flex-wrap gap-2">
              {GENDER.map((g) => (
                <ChoiceButton key={g} active={gender === g} onClick={() => setGender(gender === g ? null : g)}>
                  {g}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="키" hint="cm">
            <div className="flex flex-wrap gap-2">
              {HEIGHT.map((h) => (
                <ChoiceButton key={h} active={height === h} onClick={() => setHeight(height === h ? null : h)}>
                  {h}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="체형">
            <div className="flex flex-wrap gap-2">
              {BODY.map((b) => (
                <ChoiceButton key={b} active={body === b} onClick={() => setBody(body === b ? null : b)}>
                  {b}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="연령대">
            <div className="flex flex-wrap gap-2">
              {AGE.map((a) => (
                <ChoiceButton key={a} active={age === a} onClick={() => setAge(age === a ? null : a)}>
                  {a}
                </ChoiceButton>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* Step 3 — usage */}
      {step === 3 && (
        <div className="space-y-7">
          <p className="text-sm text-muted-foreground">
            평소 의자를 어떻게 쓰시는지 알려주세요. (전부 선택)
          </p>
          <Field label="직업">
            <div className="flex flex-wrap gap-2">
              {JOB.map((j) => (
                <ChoiceButton key={j} active={job === j} onClick={() => setJob(job === j ? null : j)}>
                  {j}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="주 사용 목적">
            <div className="flex flex-wrap gap-2">
              {PURPOSE.map((p) => (
                <ChoiceButton key={p} active={purpose === p} onClick={() => setPurpose(purpose === p ? null : p)}>
                  {p}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="하루 앉는 시간">
            <div className="flex flex-wrap gap-2">
              {SIT_HOURS.map((s) => (
                <ChoiceButton key={s} active={sitHours === s} onClick={() => setSitHours(sitHours === s ? null : s)}>
                  {s}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="불편한 부위" hint="복수 선택">
            <div className="flex flex-wrap gap-2">
              {PAIN.map((p) => (
                <ChoiceButton
                  key={p}
                  active={pain.includes(p)}
                  onClick={() => toggleMulti(p, pain, setPain, "없음")}
                >
                  {p}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="스탠딩데스크">
            <div className="flex flex-wrap gap-2">
              {STANDING.map((s) => (
                <ChoiceButton key={s} active={standing === s} onClick={() => setStanding(standing === s ? null : s)}>
                  {s}
                </ChoiceButton>
              ))}
            </div>
          </Field>
          <Field label="기존에 쓰던 의자" hint="선택">
            <Input
              placeholder="예: 시디즈 T50, 일반 사무용 의자"
              value={prevChair}
              onChange={(e) => setPrevChair(e.target.value)}
            />
          </Field>
        </div>
      )}

      {/* Step 4 — rating & review */}
      {step === 4 && (
        <div className="space-y-7">
          <Field label="1위 의자 별점" hint="선택">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n}점`}
                  onClick={() => setRating(rating === n ? null : n)}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      rating && n <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>
          </Field>

          <Field label="한 줄 후기" hint="필수 · 짧아도 괜찮아요">
            <Textarea
              rows={3}
              placeholder="예: 허리 받침이 확실해서 오래 앉아도 편했어요!"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </Field>

          <Field label="선정 이유" hint="복수 선택">
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <ChoiceButton
                  key={r}
                  active={reasons.includes(r)}
                  onClick={() => toggleMulti(r, reasons, setReasons)}
                >
                  {r}
                </ChoiceButton>
              ))}
            </div>
          </Field>

          <Field label="사진 업로드" hint="선택 · 앉아본 사진 환영, 얼굴 안 나와도 OK">
            {photoPreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="첨부 사진 미리보기"
                  className="h-40 w-40 rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null)
                    setPhotoPreview(null)
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                  aria-label="사진 제거"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              >
                <Upload className="h-5 w-5" />
                사진 첨부하기
              </button>
            )}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
          </Field>

          <Field label="체험 매장" hint="선택">
            <div className="flex flex-wrap gap-2">
              {STORES.map((s) => (
                <ChoiceButton key={s} active={store === s} onClick={() => setStore(store === s ? null : s)}>
                  {s}
                </ChoiceButton>
              ))}
            </div>
          </Field>

          <Field label="다른 의자와 비교 중이신가요?" hint="선택">
            <Input
              placeholder="예: 아론 vs 립 고민 중"
              value={comparing}
              onChange={(e) => setComparing(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="닉네임" hint="선택">
              <Input
                placeholder="후기에 표시될 이름"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </Field>
            <Field label="연락처" hint="선택 · 혜택 안내용">
              <Input
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Nav */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setError(null)
            setStep((s) => Math.max(1, s - 1))
          }}
          disabled={step === 1}
        >
          이전
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            onClick={() => {
              if (!canNext) {
                setError(step === 1 ? "1위 의자를 선택해 주세요." : null)
                return
              }
              setError(null)
              setStep((s) => Math.min(TOTAL_STEPS, s + 1))
            }}
            disabled={!canNext}
          >
            다음
          </Button>
        ) : (
          <Button onClick={() => void submit()} disabled={!canNext || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> 제출 중…
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-4 w-4" /> 후기 제출
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
