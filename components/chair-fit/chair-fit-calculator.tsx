"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CircleHelp, LoaderCircle, MapPin, Printer, Ruler, Save } from "lucide-react"
import { ChairProductImage } from "@/components/chairs/ChairProductImage"
import { buildFitProfile, type FitInputs, type FitProfile, type ProductFit } from "@/lib/recommend/fit"
import { finderSessionKey, readFinderSession } from "@/lib/recommend/finder-session"
import { ChairAI } from "@/components/chair-ai/chair-ai"
import { FinderQuestionnaire, initialFinderAnswers, type FinderAnswers } from "./finder-questionnaire"
import { FitElevation } from "./fit-elevation"
import "./chair-report.css"
import { ManageReportLinks } from "./manage-report-links"
import { ShareReport } from "./share-report"
import { ConfigurationCheck } from "./configuration-check"
import { trackConversionEvent } from "@/lib/analytics/conversion"

type Stage = "chat" | "opening" | "body" | "desk" | "preferences" | "passport"
type Layer = "seat" | "depth" | "desk"

type Recommendation = {
  id: string
  slug: string
  name: string
  brand: string | null
  image: string | null
  priceRange: string | null
  fitStatus: "good" | "conditional" | "insufficient-data"
  fitConfidence: "high" | "medium" | "limited"
  fit: ProductFit
  sourceUpdatedAt: string | null
  fitEvidence?: Array<{
    fieldKey: string
    evidenceType: string
    sourceTitle: string
    notes?: string
    sourceUrl: string
    checkedOn: string
  }>
  awards?: Array<{ id: string; title: string; reason: string }>
  strongAlternative?: boolean
  alternativeReason?: string | null
}
export type RecommendationPayload = {
  signature?: string
  profile: FitProfile
  results: Recommendation[]
  standouts?: Recommendation[]
  alternatives?: Recommendation[]
  showrooms?: Array<{
    productSlug: string
    finderPath: string
    exactTrialCount: number
    brandStoreCount: number
  }>
}

const layerCopy: Record<Layer, { index: string; title: string; body: string }> = {
  seat: {
    index: "01",
    title: "Seat height",
    body: "A starting range for keeping the feet supported while the thighs remain close to level.",
  },
  depth: {
    index: "02",
    title: "Seat depth",
    body: "A starting range for supporting the thighs without loading the back of the knees.",
  },
  desk: {
    index: "03",
    title: "Desk clearance",
    body: "Checks whether the seated position and armrests can work beneath the entered desk.",
  },
}

function cmRange(value: { min: number; max: number } | null) {
  return value ? `${value.min}–${value.max} cm` : "Add a measurement"
}

function MeasurementPlate({
  height,
  desk,
  active,
  onActive,
  compact = false,
}: {
  height: number
  desk?: number
  active: Layer
  onActive: (layer: Layer) => void
  compact?: boolean
}) {
  return (
    <div className="relative min-w-0 overflow-hidden border border-[#b8b1a4] bg-[#f4f0e8]">
      <div className="flex items-center justify-between border-b border-[#d3ccc0] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6f6a61]">
        <span>Body · chair · desk</span>
        <span>Side elevation / illustrative</span>
      </div>
      <div className={compact ? "mx-auto max-w-[420px]" : ""}><FitElevation height={height} desk={desk} active={active} /></div>
      <div className="grid grid-cols-3 border-t border-[#d3ccc0]">
        {(Object.keys(layerCopy) as Layer[]).map((layer) => (
          <button
            key={layer}
            type="button"
            onClick={() => onActive(layer)}
            className={`border-b border-[#d3ccc0] px-4 py-3 text-left transition-colors last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${active === layer ? "bg-[#244f73] text-white" : "bg-[#f8f5ef] text-[#292723] hover:bg-white"}`}
          >
            <span className="font-mono text-[10px] opacity-70">{layerCopy[layer].index}</span>
            <span className="ml-2 text-xs font-semibold uppercase tracking-[0.08em]">{layerCopy[layer].title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChairFitCalculator({ initialMode, initialQuery, onQuestionnaireChange }: { initialMode?: string; initialQuery?: string; onQuestionnaireChange?: (active: boolean) => void } = {}) {
  const [stage, setStage] = useState<Stage>(initialMode === "chat" ? "chat" : "opening")
  useEffect(() => { onQuestionnaireChange?.(stage !== "opening" && stage !== "chat") }, [stage, onQuestionnaireChange])
  const [sessionReady, setSessionReady] = useState(false)
  useEffect(() => {
    if (!sessionReady || stage === "chat") return
    const url = new URL(window.location.href)
    if (url.searchParams.has("mode")) {
      url.searchParams.delete("mode")
      url.searchParams.delete("q")
      window.history.replaceState(window.history.state, "", url.pathname + url.search)
    }
  }, [sessionReady, stage])
  const [questionStep, setQuestionStep] = useState(0)
  const [answers, setAnswers] = useState<FinderAnswers>(initialFinderAnswers)
  const height = answers.height ?? 172
  const weight = answers.weight
  const effectiveDesk = answers.unknownDesk ? undefined : answers.desk
  const underDesk = answers.underDesk && !answers.keyboardTray
  const requestAnswers = useMemo(() => {
    const painMap: Record<string, string[]> = { "Lower back": ["Lower back"], "Neck and shoulders": ["Neck", "Shoulders"], "Hips and tailbone": ["Hips", "Tailbone"], "Legs and thigh pressure": ["Legs & lower body"], "Arms and wrists": ["Arms"] }
    return { useCase: "office", heightCm: answers.height, weightKg: answers.weight,
      deskHeightCm: answers.unknownDesk ? undefined : answers.desk,
      armrestsUnderDesk: answers.underDesk && !answers.keyboardTray, keyboardTray: answers.keyboardTray,
      sitHours: answers.hours || undefined, material: answers.material || undefined,
      pain: answers.concerns.flatMap(c => painMap[c] ?? []), priorities: answers.priorities,
      posture: answers.posture || undefined, countryCode: answers.country || undefined,
      maxPriceUsd: answers.country === "US" ? answers.budget : undefined }
  }, [answers])
  const [activeLayer, setActiveLayer] = useState<Layer>("seat")
  const [recommendations, setRecommendations] = useState<RecommendationPayload | null>(null)
  const [recommendationError, setRecommendationError] = useState(false)
  const [recommendationAttempt, setRecommendationAttempt] = useState(0)
  const [activeChair, setActiveChair] = useState(0)
  const [passportSaved, setPassportSaved] = useState(false)
  const resultCache = useRef(new Map<string, { at: number; payload: RecommendationPayload }>())

  useEffect(() => {
    let stored: ReturnType<typeof readFinderSession> = null
    try { stored = readFinderSession(window.sessionStorage) } catch { /* Private browsing may block storage. */ }
    const explicitChat = new URL(window.location.href).searchParams.get("mode") === "chat"
    if (stored && !explicitChat) {
      setAnswers(stored.answers)
      setQuestionStep(stored.step)
      setStage(stored.stage)
      setActiveChair(stored.activeChair)
      if (stored.payload) {
        setRecommendations(stored.payload)
        resultCache.current.set(stored.requestKey, { at: Date.now(), payload: stored.payload })
      }
    }
    if (!stored && !explicitChat) setStage("opening")
    setSessionReady(true)
  }, [initialMode])

  useEffect(() => {
    if (!sessionReady || stage === "chat") return
    try {
      const requestKey = JSON.stringify(requestAnswers)
      const payload = resultCache.current.get(requestKey)?.payload ?? null
      window.sessionStorage.setItem(finderSessionKey, JSON.stringify({ version: 2, savedAt: Date.now(), stage, step: questionStep, activeChair, answers, requestKey, payload }))
    } catch { /* Storage may be unavailable; the current session still works. */ }
  }, [sessionReady, stage, questionStep, activeChair, answers, requestAnswers, recommendations])

  const profile = useMemo(
    () => buildFitProfile({ heightCm: height, weightKg: weight, deskHeightCm: effectiveDesk, armrestsUnderDesk: underDesk, keyboardTray: answers.keyboardTray }),
    [height, weight, effectiveDesk, underDesk, answers.keyboardTray],
  )
  const shouldPrefetchRecommendations = stage === "passport"

  const savePassport = () => {
    const stored = {
      version: 1,
      savedAt: new Date().toISOString(),
      inputs: requestAnswers,
      preferences: answers,
      profile,
    }
    window.localStorage.setItem("chairpedia-fit-passport", JSON.stringify(stored))
    setPassportSaved(true)
  }

  useEffect(() => {
    if (!sessionReady || !shouldPrefetchRecommendations) return
    const body = JSON.stringify(requestAnswers)
    const cached = resultCache.current.get(body)
    if (cached && Date.now() - cached.at < 24 * 60 * 60 * 1000) {
      setRecommendations(cached.payload)
      setRecommendationError(false)
      return
    }
    const controller = new AbortController()
    setRecommendationError(false)
    setRecommendations(null)
    let timeout: number | undefined
    const delay = window.setTimeout(() => {
      timeout = window.setTimeout(() => {
        setRecommendationError(true)
        controller.abort()
      }, 15_000)
      fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Recommendation request failed")
          return response.json() as Promise<RecommendationPayload>
        })
        .then((payload) => {
          if (controller.signal.aborted) return
          if (resultCache.current.size >= 10) resultCache.current.delete(resultCache.current.keys().next().value!)
          resultCache.current.set(body, { at: Date.now(), payload })
          setRecommendations(payload)
          setActiveChair(0)
        })
        .catch((error) => {
          if (!controller.signal.aborted && (error as Error).name !== "AbortError") setRecommendationError(true)
        })
        .finally(() => window.clearTimeout(timeout))
    }, 120)
    return () => {
      window.clearTimeout(delay)
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [sessionReady, shouldPrefetchRecommendations, requestAnswers, recommendationAttempt])

  if (!sessionReady) return <div className="mx-auto max-w-6xl px-5 py-16" role="status">Opening Chair Finder...</div>

  if (stage === "chat") return (
    <section className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
      <button type="button" onClick={() => setStage("opening")} className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-[#575249]"><ArrowLeft className="h-4 w-4" />Back to Chair Finder</button>
      <p className="text-xs uppercase tracking-widest text-[#244f73]">Chair Finder / Conversation</p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Tell us what you need.</h1>
      <p className="my-6 leading-7 text-[#575249]">Describe your budget, room and preferences. chA.I.r suggests chairs to research; use the measurement path to check dimensions and desk clearance.</p>
      <ChairAI initialQuery={initialQuery} />
    </section>
  )

  if (stage === "opening") {
    return (
      <>
        <section className="border-b border-[#aaa397] bg-[#f4f0e8]">
          <div className="mx-auto grid min-h-[620px] max-w-[1280px] items-start gap-8 px-5 py-10 lg:grid-cols-[1.4fr_1fr] lg:py-16">
            <div>
              <p className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244f73]">Chair Finder</p>
              <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-[#1f1d19] sm:text-6xl">
                Find a chair that fits your body and your desk.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#575249]">
                Get measurement-backed matches, understand what may not fit, and find places to try your shortlist in person.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => { trackConversionEvent({ eventName: "chair_finder_started", placement: "opening_primary" }); setQuestionStep(0); setStage("body") }} className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#244f73] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#193a55]">
                  Calculate my fit <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/compare" className="inline-flex min-h-12 items-center justify-center border border-[#8e887d] px-6 text-sm font-semibold text-[#292723] transition-colors hover:bg-white">
                  Check chairs I already know
                </Link>
              </div>
              <p className="mt-4 text-sm text-[#6b655c]">
                Prefer to describe what you need? <button type="button" onClick={() => setStage("chat")} className="min-h-11 font-semibold text-[#244f73] underline underline-offset-4">Find chairs through conversation</button> with chA.I.r.
              </p>
              <div className="mt-8 grid max-w-2xl gap-px border-y border-[#aaa397] bg-[#aaa397] sm:grid-cols-3">
                {["Published dimensions", "Claim-level evidence", "Verified showrooms"].map((item) => (
                  <div key={item} className="bg-[#f4f0e8] px-3 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#575249]">{item}</div>
                ))}
              </div>
            </div>
            <div>
              <MeasurementPlate height={height} active={activeLayer} onActive={setActiveLayer} />
              <div className="mt-4 grid grid-cols-[42px_1fr] gap-3 text-sm leading-6 text-[#575249]">
                <span className="font-mono text-xs text-[#244f73]">{layerCopy[activeLayer].index}</span>
                <p><strong className="text-[#292723]">{layerCopy[activeLayer].title}.</strong> {layerCopy[activeLayer].body}</p>
              </div>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-5"><ManageReportLinks /></div>
        <AuthorityPrimer />
      </>
    )
  }

  if (stage === "passport" && !recommendations && !recommendationError) return (
    <section className="mx-auto flex min-h-[calc(100dvh-73px)] max-w-4xl flex-col justify-center px-5 py-8" role="status" aria-live="polite">
      <p className="text-xs uppercase tracking-[.18em] text-[#244f73]">Your personal chair shortlist</p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Finding your chair matches.</h1>
      <p className="mt-5 max-w-xl text-sm leading-6 text-[#575249]">Comparing your measurements and preferences with the published catalog. Missing measurements stay visible in your results.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="border border-[#c9c2b6] p-5"><Check className="mb-4 h-5 w-5 text-[#244f73]" /><strong className="text-sm">Your inputs are ready</strong><p className="mt-2 text-xs text-[#777168]">Body, desk and preferences</p></div>
        <div className="border border-[#244f73] p-5"><LoaderCircle className="mb-4 h-5 w-5 text-[#244f73] motion-safe:animate-spin" /><strong className="text-sm">Comparing the catalog</strong><p className="mt-2 text-xs text-[#777168]">Fit ranges and adjustment features</p></div>
        <div className="border border-[#c9c2b6] p-5"><BookOpen className="mb-4 h-5 w-5 text-[#777168]" /><strong className="text-sm">Evidence with every match</strong><p className="mt-2 text-xs text-[#777168]">Sources, trade-offs and unknowns</p></div>
      </div>
      <div aria-hidden="true" className="mt-6 h-1 overflow-hidden bg-[#ddd6ca]"><div className="h-full w-1/3 bg-[#244f73] motion-safe:animate-pulse" /></div>
      <button type="button" onClick={() => setStage("body")} className="mt-6 min-h-11 self-start text-sm underline underline-offset-4">Back to my answers</button>
    </section>
  )

  if (stage === "passport") {
    return (
      <section className="fit-passport-page mx-auto max-w-6xl px-5 py-6 sm:py-8">
        <button type="button" onClick={() => { setQuestionStep(0); setStage("desk") }} className="print:hidden mr-6 inline-flex min-h-11 items-center gap-2 text-sm text-[#575249] hover:text-[#1f1d19]"><ArrowLeft className="h-4 w-4" /> Edit inputs</button>
        <button type="button" onClick={() => { try { window.sessionStorage.removeItem(finderSessionKey) } catch {} resultCache.current.clear(); setRecommendations(null); setAnswers(initialFinderAnswers); setActiveChair(0); setQuestionStep(0); setStage("body") }} className="print:hidden min-h-11 text-sm text-[#575249] underline underline-offset-4">Start a new test</button>
        <div className="report-cover mt-5 border-t-2 border-[#244f73] pb-5 pt-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-serif text-2xl">Chairpedia</p>
            <p className="text-[10px] uppercase tracking-[.18em] text-[#244f73]">Your personal chair report / Method 1.0</p>
          </div>
          <h1 className="mt-8 max-w-3xl font-serif text-4xl leading-tight text-[#1f1d19] sm:text-5xl">Years of chair expertise.<br />A clearer choice for you.</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#575249]">Drawing on years of experience with chairs, Chairpedia brings together product specifications, online reviews, and offline showroom information to help you understand your options and find a chair worth trying.</p>
          <p className="mt-3 text-sm italic text-[#244f73]">Prepared around your measurements, workspace, and preferences.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 print:hidden">
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 bg-[#244f73] px-5 text-sm font-semibold text-white hover:bg-[#193a55]"><Printer className="h-4 w-4" />Save as PDF</button>
            {recommendations && <ShareReport payload={recommendations} onRefresh={() => { resultCache.current.clear(); setRecommendations(null); setRecommendationAttempt(attempt => attempt + 1) }} />}
            <ManageReportLinks />
            <p className="text-xs text-[#777168]">Choose Save as PDF in the print window. Your results are also saved in this tab.</p>
          </div>
        </div>
        <h2 className="mt-6 font-serif text-2xl">Your starting point</h2>
        <p className="mt-3 text-sm leading-6 text-[#575249]">We compare height-based seat ranges with published chair dimensions, then consider your preferences. The scores are comparison indices, not comfort guarantees. Reviews and showroom information support your research; the fit checks below use recorded specifications.</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt className="text-xs text-[#777168]">Your height / weight</dt><dd className="mt-1">{height} cm / {weight ? `${weight} kg` : "Not entered"}</dd></div>
          <div><dt className="text-xs text-[#777168]">Desk height</dt><dd className="mt-1">{effectiveDesk ? `${effectiveDesk} cm` : "Not entered"}{answers.keyboardTray ? " / keyboard tray" : ""}</dd></div>
          <div><dt className="text-xs text-[#777168]">Material / sitting time</dt><dd className="mt-1 capitalize">{answers.material || "No preference"} / {answers.hours ? `${answers.hours} hours` : "Not entered"}</dd></div>
          <div><dt className="text-xs text-[#777168]">Your priorities</dt><dd className="mt-1 capitalize">{answers.priorities.join(", ") || "No preference"}</dd></div>
        </dl>
        <div className="mt-4 grid gap-3 border-y border-[#c9c2b6] py-3 sm:grid-cols-3">
          <div><p className="text-xs text-[#777168]">Seat height</p><p className="mt-1 font-serif text-2xl">{cmRange(profile.suggestedSeatHeightCm)}</p></div>
          <div><p className="text-xs text-[#777168]">Seat depth</p><p className="mt-1 font-serif text-2xl">{cmRange(profile.suggestedSeatDepthCm)}</p></div>
          <div><p className="text-xs text-[#777168]">Your buying preferences</p><p className="mt-1 text-sm">{answers.country || "Any country"} / {answers.condition === "used" ? "Used acceptable" : "New only"}</p><p className="mt-1 text-xs text-[#777168]">{answers.budget === undefined ? "No budget entered" : `Budget: ${answers.budget.toLocaleString()} (${answers.country})`}</p></div>
        </div>
        {answers.country && answers.country !== "US" && answers.budget !== undefined && <p className="mt-3 text-xs text-[#777168]">Local prices are not verified; the budget above is saved for your research and has not filtered matches.</p>}
        {answers.keyboardTray && <p className="mt-3 text-xs text-[#777168]">Keyboard tray selected: body-based seat range; tray and armrest clearance remain unconfirmed.</p>}
        <RecommendationResults
          payload={recommendations}
          failed={recommendationError}
          onRetry={() => setRecommendationAttempt(attempt => attempt + 1)}
          userProfile={profile}
          inputs={{ heightCm: height, weightKg: weight, deskHeightCm: effectiveDesk, armrestsUnderDesk: underDesk, keyboardTray: answers.keyboardTray }}
        />
        <details className="mt-10 border-t border-[#aaa397] pt-5 print:hidden"><summary className="cursor-pointer font-semibold">Your measurements and sources</summary>
        <div className="mt-10 grid border border-[#aaa397] md:grid-cols-3">
          {[
            ["Seat height", cmRange(profile.suggestedSeatHeightCm), "Estimated from entered height"],
            ["Seat depth", cmRange(profile.suggestedSeatDepthCm), "Estimated thigh-support range"],
            ["Desk clearance", answers.keyboardTray || (underDesk && effectiveDesk == null) ? "Unconfirmed" : underDesk ? `${effectiveDesk} cm desk` : "Not required", underDesk ? "Armrests must tuck below" : "Armrests may remain outside"],
          ].map(([label, value, note], index) => (
            <div key={label} className="border-b border-[#aaa397] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <span className="font-mono text-[10px] text-[#777168]">0{index + 1}</span>
              <h2 className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#575249]">{label}</h2>
              <p className="mt-2 font-serif text-3xl text-[#1f1d19]">{value}</p>
              <p className="mt-3 text-xs leading-5 text-[#777168]">{note}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 border-l-4 border-[#244f73] bg-[#eef2f4] p-5 text-sm leading-6 text-[#3e4b54]">
          <strong className="text-[#1f1d19]">Evidence note.</strong> Body proportions vary. These are broad starting ranges based on height, not a scan or medical assessment. Product matching should show unknown dimensions rather than infer them.
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
          <button type="button" onClick={savePassport} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#8e887d] px-5 text-sm font-semibold text-[#292723] hover:bg-white">
            {passportSaved ? <Check className="h-4 w-4 text-[#30633f]" /> : <Save className="h-4 w-4" />}
            {passportSaved ? "Saved on this device" : "Save on this device"}
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#8e887d] px-5 text-sm font-semibold text-[#292723] hover:bg-white">
            <Printer className="h-4 w-4" /> Print or save PDF
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#777168] print:hidden">Device saves stay in this browser. Body inputs are not placed in a public URL.</p>

        </details>
        <div className="print:hidden mt-8 flex flex-col gap-3 border-t border-[#aaa397] pt-6 sm:flex-row">
          <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#244f73] px-6 text-sm font-semibold text-white hover:bg-[#193a55]">Browse the full chair catalog <ArrowRight className="h-4 w-4" /></Link>
          <Link href={`/stores${answers.country ? `?country=${answers.country}` : ""}`} className="inline-flex min-h-12 items-center justify-center border border-[#8e887d] px-6 text-sm font-semibold text-[#292723] hover:bg-white">Browse verified showrooms</Link>
        </div>
      </section>
    )
  }

  return <FinderQuestionnaire step={questionStep} onStepChange={setQuestionStep} answers={answers} onChange={setAnswers} onSubmit={() => { trackConversionEvent({ eventName: "chair_finder_completed", placement: "questionnaire", metadata: { country: answers.country || "unspecified", shopping: answers.shopping } }); setPassportSaved(false); setStage("passport") }} onExit={() => setStage("opening")} />
}

export function RecommendationResults({
  payload,
  failed,
  onRetry,
  userProfile,
  inputs,
  includeMeasurements = true,
}: {
  payload: RecommendationPayload | null
  failed: boolean
  onRetry: () => void
  userProfile: FitProfile
  inputs?: FitInputs
  includeMeasurements?: boolean
}) {
  if (failed) {
    return (
      <div className="mt-14 border border-[#aaa397] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8a5a20]">Catalog temporarily unavailable</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#575249]">Your entered measurements remain available. Product matching was not guessed; browse the catalog and use these ranges until the catalog connection is available.</p>
        <button type="button" onClick={onRetry} className="mt-4 min-h-11 border border-[#8e887d] px-5 text-sm font-semibold text-[#292723] hover:bg-white">Try matching again</button>
      </div>
    )
  }
  if (!payload) {
    return (
      <div className="mt-14 border-y border-[#aaa397] py-6" role="status">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#244f73]">Reading published catalog dimensions…</p>
      </div>
    )
  }
  if (!payload.results.length) {
    return (
      <div className="mt-14 border border-[#aaa397] p-6">
        <p className="font-serif text-2xl text-[#1f1d19]">No published catalog chairs are available for this check.</p>
        <p className="mt-3 text-sm leading-6 text-[#575249]">Your ranges remain available. Chairpedia will not substitute sample products or estimate missing catalog records.</p>
      </div>
    )
  }

  const standouts = payload.standouts?.length ? payload.standouts : payload.results.slice(0, 5)
  const alternatives = payload.alternatives ?? payload.results.slice(standouts.length, 10)
  const displayResults = [...standouts, ...alternatives, ...payload.results].filter((item, index, all) => all.findIndex(candidate => candidate.id === item.id) === index).sort((a, b) => b.fit.score - a.fit.score).slice(0, 10).map(item => ({ ...item, awards: item.awards?.filter(award => award.id !== "long-workday") }))
  return (
    <section className="mt-6 border-t border-[#817b71] pt-5" aria-labelledby="catalog-matches">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#244f73]">Catalog application</p>
          <h2 id="catalog-matches" className="mt-3 font-serif text-3xl text-[#1f1d19]">{displayResults.length} chair {displayResults.length === 1 ? "match" : "matches"}</h2>
        </div>
        <p className="max-w-md text-xs leading-5 text-[#777168]">{inputs ? "Candidates are drawn from the live Chairpedia catalog. Missing measurements reduce confidence and remain visible." : "A saved shortlist from the Chairpedia catalog. Scores reflect the sender's original fit check, not your own."}</p>
      </div>

      <nav aria-label="Jump to a recommendation" className="my-6 flex flex-wrap gap-2 print:hidden">
        {displayResults.map((item, index) => <a key={item.id} href={`#report-${item.slug}`} className="border border-[#c8c1b5] px-3 py-2 text-xs text-[#244f73] hover:bg-white">{String(index + 1).padStart(2, "0")} / {item.name}</a>)}
      </nav>
      <div className="space-y-8">
        {displayResults.slice(0, 10).map((chair, index) => {
  const status = chair.fitStatus === "good" ? "Good range overlap" : chair.fitStatus === "conditional" ? "Check before choosing" : "Fit data incomplete"
  const statusTone = chair.fitStatus === "good" ? "text-[#30633f]" : chair.fitStatus === "conditional" ? "text-[#8a5a20]" : "text-[#68645d]"
  const showroom = payload.showrooms?.find((item) => item.productSlug === chair.slug)
  const sourceDate = chair.sourceUpdatedAt
    ? new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(chair.sourceUpdatedAt))
    : "Date not recorded"

        return (
        <article key={chair.id} id={`report-${chair.slug}`} className="chair-report-entry scroll-mt-24 border border-[#aaa397] bg-[#f8f5ef]">
          <div className="grid lg:grid-cols-[.32fr_.68fr]">
          <div className="report-chair-identity border-b border-[#c8c1b5] p-6 lg:border-b-0 lg:border-r">
            <p className="font-mono text-xs uppercase tracking-[.14em] text-[#244f73]">Recommendation {String(index + 1).padStart(2, "0")}</p>
            <div className="relative mx-auto my-5 h-48 w-full max-w-60 bg-white"><ChairProductImage src={chair.image} alt={chair.name} category="office" className="object-contain p-4" /></div>
            <p className="text-xs text-[#777168]">{chair.brand}</p>
            <h3 className="mt-2 font-serif text-3xl text-[#1f1d19]">{chair.name}</h3>
            {chair.priceRange && <p className="mt-3 text-sm text-[#575249]">Price tier: {chair.priceRange}</p>}
            <p className="mt-4 text-xs leading-5 text-[#777168]">A candidate for your shortlist. Confirm the exact configuration and local price before buying.</p>
          </div>
          <div className="min-w-0">
          <div className="grid min-w-0 gap-4 border-b border-[#c8c1b5] p-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0"><p className="text-xs text-[#777168]">{chair.brand ?? "Brand not listed"}</p><p className="mt-1 font-serif text-2xl text-[#1f1d19]">Why this chair made your shortlist</p><div className="mt-3 flex flex-wrap gap-2">{chair.awards?.map((award, index) => <span key={award.id} className={`border border-[#244f73] px-2 py-1 text-[10px] font-semibold uppercase tracking-[.08em] ${index === 0 ? "bg-[#244f73] text-white" : "text-[#244f73]"}`}>{award.title}</span>)}</div></div>
            <div className="grid justify-items-start gap-1 sm:justify-items-end"><p className="font-serif text-4xl font-semibold text-[#1f1d19]">{chair.fit.score}<span className="text-base text-[#777168]">/100</span></p><p className="text-[9px] uppercase tracking-[.1em] text-[#777168]">Fit Score · index, not a probability</p><div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${statusTone}`}>{chair.fitStatus === "good" ? <Check className="h-4 w-4" /> : chair.fitStatus === "conditional" ? <AlertTriangle className="h-4 w-4" /> : <CircleHelp className="h-4 w-4" />}{status}</div></div>
          </div>
          <div className="p-5">
            {chair.awards?.map(award => <p key={award.id} className="mb-3 text-sm leading-6 text-[#244f73]"><strong>{award.title}.</strong> {award.reason}</p>)}
            {chair.alternativeReason && <p className="mb-4 text-sm leading-6 text-[#575249]">{chair.alternativeReason}</p>}
            {includeMeasurements ? <><div className="grid gap-6 sm:grid-cols-2">
              <EvidenceList title="Why it fits your measurements" items={chair.fit.evidence} empty="More published measurements are needed to explain this match." tone="good" />
              <div className="space-y-5"><EvidenceList title="Before you choose" items={chair.fit.conflicts} empty="No recorded dimensional conflict. Try the chair in person to judge comfort." tone="warn" /><EvidenceList title="What remains unknown" items={chair.fit.unknowns} empty="No key measurement is missing from this check." tone="neutral" /></div>
            </div>
            <div className="report-rails mt-6 border-t border-[#c8c1b5] pt-5">
              <EvidenceRail label="Seat height" user={userProfile.suggestedSeatHeightCm} chair={chair.fit.measurements.seatHeightCm} />
              <EvidenceRail label="Seat depth" user={userProfile.suggestedSeatDepthCm} chair={chair.fit.measurements.seatDepthCm} />
            </div>
            </> : <p className="mt-4 text-sm leading-6 text-[#575249]">The sender shared their shortlist and scores without personal measurement analysis. Start your own Chair Finder test to check your fit.</p>}
            {inputs && <div className="print:hidden">
            <ConfigurationCheck key={`${chair.slug}:${JSON.stringify(inputs)}`} slug={chair.slug} inputs={inputs} />
            </div>}
            <details className="print:hidden report-sources mt-5 border-t border-[#c8c1b5] pt-4"><summary className="cursor-pointer text-sm font-semibold text-[#244f73]">Measurement sources and verification</summary>
            <div className="mt-6 border-t border-[#c8c1b5] pt-5">
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#244f73]">Measurement sources</h4>
              {chair.fitEvidence?.length ? (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {chair.fitEvidence.slice(0, 6).map((source) => (
                    <li key={`${source.fieldKey}-${source.sourceUrl}`} className="text-xs leading-5 text-[#575249]">
                      <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#244f73] underline underline-offset-4">
                        {source.sourceTitle || "Published specification"}
                      </a>
                      <span className="block">{source.fieldKey.replaceAll("_", " ")} · {source.evidenceType.replaceAll("_", " ")} · checked {source.checkedOn}</span>
                      {source.notes && <span className="mt-1 block break-words">{source.notes}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-[#777168]">Field-level source records are being added. Until then, use the product record date below and verify the exact configuration in the chair dossier.</p>
              )}
            </div>
            </details>
            <div className="report-print-sources hidden print:block">
              <h4>Measurement references</h4>
              {chair.fitEvidence?.length ? [...new Map(chair.fitEvidence.map(source => [source.sourceUrl, source])).values()].map(source => <p key={source.sourceUrl}><a href={source.sourceUrl}>{source.sourceTitle || "Published specification"}</a> / checked {source.checkedOn}</p>) : <p>Field-level references are not recorded. Verify the exact configuration in the product dossier.</p>}
              <p><a href={`https://www.chairpedia.com/products/${chair.slug}`}>Chairpedia product dossier: {chair.name}</a></p>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row print:hidden">
              <Link href={`/products/${chair.slug}`} onClick={() => trackConversionEvent({ eventName: "chair_finder_result_opened", productSlug: chair.slug, placement: "report_dossier" })} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#244f73] px-5 text-sm font-semibold text-white hover:bg-[#193a55]">Open chair dossier <ArrowRight className="h-4 w-4" /></Link>
              <Link href={showroom?.finderPath ?? `/stores?model=${encodeURIComponent(chair.slug)}`} onClick={() => trackConversionEvent({ eventName: "chair_finder_showroom_opened", productSlug: chair.slug, placement: "report_showroom" })} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#8e887d] px-5 text-sm font-semibold text-[#292723] hover:bg-white"><MapPin className="h-4 w-4" />{showroom?.exactTrialCount ? `${showroom.exactTrialCount} confirmed trial location${showroom.exactTrialCount === 1 ? "" : "s"}` : "Find places to try it"}</Link>
            </div>
            {showroom && (showroom.exactTrialCount > 0 || showroom.brandStoreCount > 0) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#575249]">
                <span><strong className="text-[#292723]">{showroom.exactTrialCount}</strong> exact-model trial locations</span>
                <span><strong className="text-[#292723]">{showroom.brandStoreCount}</strong> additional brand-carrying stores</span>
              </div>
            )}
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-[#777168]">Confidence: {chair.fitConfidence} · Product record checked {sourceDate} · Verify configuration in the dossier</p>
          </div>
          </div></div>
        </article>
        )})}
      </div>


    </section>
  )
}

function EvidenceRail({ label, user, chair }: { label: string; user: { min: number; max: number } | null; chair: { min: number; max: number } | null }) {
  const values = [...(user ? [user.min, user.max] : []), ...(chair ? [chair.min, chair.max] : [])]
  const min = values.length ? Math.floor(Math.min(...values) - 3) : 0
  const max = values.length ? Math.ceil(Math.max(...values) + 3) : 1
  const left = (value: number) => `${((value - min) / Math.max(1, max - min)) * 100}%`
  const width = (range: { min: number; max: number }) => `${((range.max - range.min) / Math.max(1, max - min)) * 100}%`
  return (
    <div className="mb-5">
      <div className="flex justify-between text-xs"><span className="font-semibold text-[#292723]">{label}</span><span className="text-[#777168]">{chair ? `${chair.min}–${chair.max} cm published` : "Not published"}</span></div>
      <div className="relative mt-3 h-9 border-y border-[#d3ccc0] bg-white">
        {user && <div className="absolute top-2 h-2 bg-[#244f73]" style={{ left: left(user.min), width: width(user) }} title={`Your suggested range ${user.min}–${user.max} cm`} />}
        {chair && <div className="absolute bottom-2 h-2 border border-[#8a5a20] bg-[#d9b87f]" style={{ left: left(chair.min), width: Math.max(2, Number.parseFloat(width(chair))) + "%" }} title={`Published chair range ${chair.min}–${chair.max} cm`} />}
      </div>
      <div className="mt-2 flex gap-5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#777168]"><span><i className="mr-1 inline-block h-2 w-3 bg-[#244f73]" />Your range</span><span><i className="mr-1 inline-block h-2 w-3 border border-[#8a5a20] bg-[#d9b87f]" />Published chair range</span></div>
    </div>
  )
}

function EvidenceList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "good" | "warn" | "neutral" }) {
  const color = tone === "good" ? "text-[#30633f]" : tone === "warn" ? "text-[#8a5a20]" : "text-[#68645d]"
  return <div><h4 className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${color}`}>{title}</h4><ul className="mt-2 space-y-3 text-sm leading-6 text-[#575249]">{(items.length ? items : [empty]).map((item) => <li key={item}>{item}</li>)}</ul></div>
}

function AuthorityPrimer() {
  const items = [
    { icon: Ruler, title: "Measurements that matter", body: "Seat height, usable depth and desk clearance are separated from comfort preferences." },
    { icon: BookOpen, title: "Evidence before claims", body: "Published values, editorial interpretation and missing data remain visibly distinct." },
    { icon: Check, title: "Try before you decide", body: "Exact-model verification is separated from stores that only carry the brand." },
  ]
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <div className="grid gap-8 border-t border-[#aaa397] pt-8 lg:grid-cols-[.8fr_1.2fr]">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#244f73]">Methodology</p><h2 className="mt-3 font-serif text-3xl text-[#1f1d19]">How Chairpedia calculates fit</h2></div>
        <p className="max-w-2xl leading-7 text-[#575249]">We turn entered measurements into suggested ranges, then compare those ranges only with published product dimensions. Unknown values stay unknown. The calculator narrows the field; it does not certify comfort.</p>
      </div>
      <div className="mt-10 grid border-l border-t border-[#aaa397] md:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => <div key={title} className="border-b border-r border-[#aaa397] p-6"><Icon className="h-5 w-5 text-[#244f73]"/><h3 className="mt-8 font-serif text-xl text-[#1f1d19]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6b655c]">{body}</p></div>)}
      </div>
    </section>
  )
}
