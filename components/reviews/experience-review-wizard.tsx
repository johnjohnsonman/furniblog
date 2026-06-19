"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, GripVertical, ChevronUp, ChevronDown } from "lucide-react"
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
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
] as const

const HEIGHT_OPTIONS = [
  { label: "Under 5'4\" · <163 cm", value: "under_5_4" },
  { label: "5'4\"–5'7\" · 163–170 cm", value: "5_4_5_7" },
  { label: "5'8\"–5'11\" · 171–180 cm", value: "5_8_5_11" },
  { label: "6'0\"–6'2\" · 181–188 cm", value: "6_0_6_2" },
  { label: "6'3\"+ · 189+ cm", value: "6_3plus" },
] as const

const BODY_OPTIONS = [
  { label: "Slim", value: "slim" },
  { label: "Below average", value: "below" },
  { label: "Average", value: "normal" },
  { label: "Above average", value: "above" },
  { label: "Larger", value: "large" },
] as const

const AGE_OPTIONS = [
  { label: "Under 20", value: "under20" },
  { label: "20s", value: "20s" },
  { label: "30s", value: "30s" },
  { label: "40s", value: "40s" },
  { label: "50+", value: "50plus" },
] as const

const JOB_OPTIONS = [
  "Office worker",
  "Developer or designer",
  "Professional",
  "Student",
  "Manual or field work",
  "Other",
] as const

const SIT_HOURS_OPTIONS = [
  { label: "Under 2 hrs", value: "under2" },
  { label: "2–6 hrs", value: "2to6" },
  { label: "6+ hrs", value: "over6" },
] as const

const USES_OPTIONS = [
  "Work & study",
  "Gaming & internet",
  "Creative work",
  "Watching & relaxing",
] as const

const PAIN_OPTIONS = [
  "Neck",
  "Shoulders",
  "Lower back",
  "Hips",
  "Legs",
  "None",
] as const

const REASON_OPTIONS = [
  "Comfortable backrest",
  "Cushioned seat",
  "Headrest",
  "Good fit for my size",
  "Easy armrest adjustment",
  "Build materials",
  "Design",
  "Brand reputation",
] as const

const STEP_TITLES = [
  "Rank your chairs",
  "Your body type",
  "About you",
  "How do you use it?",
  "Any discomfort?",
  "What did you like?",
  "Anything to add?",
  "Enter our monthly giveaway",
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

function decodeHeight(value: (typeof HEIGHT_OPTIONS)[number]["value"] | null): string | null {
  if (!value) return null
  return HEIGHT_OPTIONS.find((v) => v.value === value)?.label ?? null
}

function decodeAge(value: (typeof AGE_OPTIONS)[number]["value"] | null): string | null {
  if (!value) return null
  return AGE_OPTIONS.find((v) => v.value === value)?.label ?? null
}

function decodeSitHours(value: "under2" | "2to6" | "over6" | null): string | null {
  if (!value) return null
  return SIT_HOURS_OPTIONS.find((v) => v.value === value)?.label ?? null
}

export function ExperienceReviewWizard() {
  const [step, setStep] = useState(0)
  const [search, setSearch] = useState("")
  const [productResults, setProductResults] = useState<ProductOption[]>([])
  const [popularProducts, setPopularProducts] = useState<ProductOption[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [rankings, setRankings] = useState<ProductOption[]>([])
  const dragIndex = useRef<number | null>(null)

  function moveRanking(from: number, to: number) {
    if (from === to || to < 0 || to >= rankings.length) return
    setRankings((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  // Live reorder as the dragged item passes over another row.
  function handleDragEnter(idx: number) {
    const from = dragIndex.current
    if (from === null || from === idx) return
    moveRanking(from, idx)
    dragIndex.current = idx
  }
  const [sex, setSex] = useState<"male" | "female" | null>(null)
  const [heightBand, setHeightBand] = useState<
    "under_5_4" | "5_4_5_7" | "5_8_5_11" | "6_0_6_2" | "6_3plus" | null
  >(null)
  const [body, setBody] = useState<
    "slim" | "below" | "normal" | "above" | "large" | null
  >(null)
  const [ageBand, setAgeBand] = useState<
    "under20" | "20s" | "30s" | "40s" | "50plus" | null
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
      if (!res.ok) throw new Error("Failed to load chair list.")

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
      setSubmitError("You must select at least one chair.")
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
        setSubmitError(json.error ?? "Failed to submit.")
        return
      }
      setDone(true)
    } catch {
      setSubmitError("A network error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    const preview = [
      sex ? (sex === "male" ? "Male" : "Female") : null,
      decodeHeight(heightBand),
      decodeAge(ageBand),
      job,
      decodeSitHours(sitHours),
      ...pain,
    ].filter(Boolean) as string[]

    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
          Thanks! Your review is now live.
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Your profile preview is shown below.
        </p>
        {preview.length > 0 && (
          <p className="mt-5 text-sm text-neutral-700">{preview.join(" · ")}</p>
        )}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Step {step + 1} / {STEP_TITLES.length}
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
          Write a Review
        </h1>
        <p className="mt-1 text-sm text-neutral-600">{STEP_TITLES[step]}</p>
      </div>

      <div className="min-h-[320px]">
        {step === 0 && (
          <div className="space-y-5">
            <p className="text-sm text-neutral-600">
              Tap chairs in the order you liked them — 1st, 2nd, 3rd (up to 3).
              Drag the handle or use ↑↓ to reorder.
            </p>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chairs (e.g. Aeron)"
              className="h-11"
            />

            {rankings.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Selected ranking
                </p>
                <div className="space-y-2">
                  {rankings.map((r, idx) => (
                    <div
                      key={r.id}
                      draggable
                      onDragStart={() => {
                        dragIndex.current = idx
                      }}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnd={() => {
                        dragIndex.current = null
                      }}
                      className="flex cursor-grab items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-neutral-300" />
                      <span className="flex-1">
                        <span className="font-medium text-neutral-900">#{idx + 1}</span>{" "}
                        · {r.name}
                      </span>
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={idx === 0}
                        onClick={() => moveRanking(idx, idx - 1)}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={idx === rankings.length - 1}
                        onClick={() => moveRanking(idx, idx + 1)}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => addOrRemoveRanking(r)}
                        className="ml-1 text-xs text-neutral-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
                {search.trim() ? "Search results" : "Popular"}
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
                  <span className="text-xs text-neutral-500">Loading...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">Gender</p>
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
              <p className="mb-2 text-sm font-medium text-neutral-800">Height</p>
              <div className="flex flex-wrap gap-2">
                {HEIGHT_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    active={heightBand === o.value}
                    onClick={() => setHeightBand(selectSingle(heightBand, o.value))}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">Build</p>
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
              <p className="mb-2 text-sm font-medium text-neutral-800">Age</p>
              <div className="flex flex-wrap gap-2">
                {AGE_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    active={ageBand === o.value}
                    onClick={() => setAgeBand(selectSingle(ageBand, o.value))}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800">Occupation</p>
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
              <p className="mb-2 text-sm font-medium text-neutral-800">Daily sitting</p>
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
              <p className="mb-2 text-sm font-medium text-neutral-800">
                Main use (select all)
              </p>
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
            <p className="mb-2 text-sm font-medium text-neutral-800">
              Any discomfort? (select all)
            </p>
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
              What did you like? (select all)
            </p>
            {firstRankName ? (
              <p className="mb-3 text-xs text-neutral-500">For your #1: {firstRankName}</p>
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
            <p className="mb-2 text-sm font-medium text-neutral-800">Anything to add?</p>
            <p className="mb-2 text-xs text-neutral-500">Optional</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. The lumbar support felt great for long sessions."
              className="min-h-[160px]"
            />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-800">
              Enter our monthly giveaway
            </p>
            <p className="text-xs text-neutral-500">Optional</p>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Your email (optional)"
              className="h-11"
            />
            <p className="text-xs text-neutral-500">
              Contact is stored privately and is never returned to client responses.
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
          Back
        </Button>
        <div className="flex gap-2">
          {step > 0 && step < STEP_TITLES.length - 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.min(STEP_TITLES.length - 1, s + 1))}
              disabled={submitting}
            >
              Skip
            </Button>
          )}
          {step < STEP_TITLES.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(STEP_TITLES.length - 1, s + 1))}
              disabled={!canGoNext || submitting}
            >
              Next
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
                Skip
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}