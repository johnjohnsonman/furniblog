"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CircleHelp, MapPin, Printer, Ruler, Save } from "lucide-react"
import { ChairProductImage } from "@/components/chairs/ChairProductImage"
import { buildFitProfile, type FitInputs, type FitProfile, type ProductFit } from "@/lib/recommend/fit"
import { ConfigurationCheck } from "./configuration-check"

type Stage = "opening" | "body" | "desk" | "passport"
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
type RecommendationPayload = {
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
  const profile = buildFitProfile({ heightCm: height, deskHeightCm: desk })
  const personScale = Math.max(0.88, Math.min(1.12, height / 172))
  const deskY = desk ? 38 + (82 - desk) * 1.3 : 44
  const tone = (layer: Layer) => (active === layer ? "#244f73" : "#a29d92")

  return (
    <div className="relative min-w-0 overflow-hidden border border-[#b8b1a4] bg-[#f4f0e8]">
      <div className="flex items-center justify-between border-b border-[#d3ccc0] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6f6a61]">
        <span>Body · chair · desk</span>
        <span>Side elevation · 1:1 proportions</span>
      </div>
      <svg
        viewBox="0 0 520 300"
        className={compact ? "block h-[250px] w-full max-w-full" : "block h-[310px] w-full max-w-full"}
        role="img"
        aria-label="Interactive side elevation showing suggested chair and desk measurements"
      >
        <defs>
          <pattern id="fit-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ddd6ca" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="520" height="300" fill="url(#fit-grid)" />
        <line x1="70" y1="252" x2="462" y2="252" stroke="#777168" strokeWidth="1.5" />
        <g transform={`translate(0 ${8 - (personScale - 1) * 24}) scale(1 ${personScale})`}>
          <circle cx="185" cy="82" r="22" fill="#f4f0e8" stroke="#292723" strokeWidth="2.5" />
          <path d="M185 105 L185 166 L229 166" fill="none" stroke="#292723" strokeWidth="4" />
          <path d="M187 122 L216 147 L253 147" fill="none" stroke="#292723" strokeWidth="3" />
          <path d="M229 166 L229 215 L246 252" fill="none" stroke="#292723" strokeWidth="4" />
          <line x1="229" y1="252" x2="264" y2="252" stroke="#292723" strokeWidth="5" />
        </g>
        <path d="M160 161 L244 161 L244 176 L166 176 L166 236" fill="none" stroke="#292723" strokeWidth="3" />
        <line x1="166" y1="236" x2="142" y2="252" stroke="#292723" strokeWidth="3" />
        <line x1="166" y1="236" x2="191" y2="252" stroke="#292723" strokeWidth="3" />
        <line x1="166" y1="236" x2="166" y2="252" stroke="#292723" strokeWidth="3" />
        <line x1="314" y1={deskY} x2="449" y2={deskY} stroke="#292723" strokeWidth="4" />
        <line x1="432" y1={deskY} x2="432" y2="252" stroke="#292723" strokeWidth="3" />

        <g onMouseEnter={() => onActive("seat")} onFocus={() => onActive("seat")} tabIndex={0}>
          <line x1="128" y1="176" x2="128" y2="252" stroke={tone("seat")} strokeWidth="3" />
          <path d="M121 180 L128 170 L135 180 M121 248 L128 258 L135 248" fill="none" stroke={tone("seat")} strokeWidth="2" />
          <text x="78" y="216" fill={tone("seat")} fontSize="12" fontFamily="monospace">{cmRange(profile.suggestedSeatHeightCm)}</text>
        </g>
        <g onMouseEnter={() => onActive("depth")} onFocus={() => onActive("depth")} tabIndex={0}>
          <line x1="166" y1="194" x2="244" y2="194" stroke={tone("depth")} strokeWidth="3" />
          <path d="M170 187 L160 194 L170 201 M240 187 L250 194 L240 201" fill="none" stroke={tone("depth")} strokeWidth="2" />
          <text x="176" y="215" fill={tone("depth")} fontSize="12" fontFamily="monospace">{cmRange(profile.suggestedSeatDepthCm)}</text>
        </g>
        <g onMouseEnter={() => onActive("desk")} onFocus={() => onActive("desk")} tabIndex={0}>
          <line x1="286" y1={deskY} x2="286" y2="176" stroke={tone("desk")} strokeWidth="3" strokeDasharray="5 4" />
          <text x="296" y={(deskY + 176) / 2} fill={tone("desk")} fontSize="12" fontFamily="monospace">{desk ? `${desk} cm desk` : "Desk not entered"}</text>
        </g>
      </svg>
      <div className="grid border-t border-[#d3ccc0] sm:grid-cols-3">
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

export function ChairFitCalculator() {
  const [stage, setStage] = useState<Stage>("opening")
  const [height, setHeight] = useState(172)
  const [weight, setWeight] = useState<number | undefined>()
  const [desk, setDesk] = useState(72)
  const [underDesk, setUnderDesk] = useState(true)
  const [activeLayer, setActiveLayer] = useState<Layer>("seat")
  const [recommendations, setRecommendations] = useState<RecommendationPayload | null>(null)
  const [recommendationError, setRecommendationError] = useState(false)
  const [recommendationAttempt, setRecommendationAttempt] = useState(0)
  const [activeChair, setActiveChair] = useState(0)
  const [passportSaved, setPassportSaved] = useState(false)
  const resultCache = useRef(new Map<string, { at: number; payload: RecommendationPayload }>())

  const profile = useMemo(
    () => buildFitProfile({ heightCm: height, weightKg: weight, deskHeightCm: desk, armrestsUnderDesk: underDesk }),
    [height, weight, desk, underDesk],
  )
  const shouldPrefetchRecommendations = stage === "desk" || stage === "passport"

  const savePassport = () => {
    const stored = {
      version: 1,
      savedAt: new Date().toISOString(),
      inputs: { heightCm: height, weightKg: weight, deskHeightCm: desk, armrestsUnderDesk: underDesk },
      profile,
    }
    window.localStorage.setItem("chairpedia-fit-passport", JSON.stringify(stored))
    setPassportSaved(true)
  }

  useEffect(() => {
    if (!shouldPrefetchRecommendations) return
    const body = JSON.stringify({ useCase: "office", heightCm: height, weightKg: weight, deskHeightCm: desk, armrestsUnderDesk: underDesk })
    const cached = resultCache.current.get(body)
    if (cached && Date.now() - cached.at < 60_000) {
      setRecommendations(cached.payload)
      setRecommendationError(false)
      setActiveChair(0)
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
  }, [shouldPrefetchRecommendations, height, weight, desk, underDesk, recommendationAttempt])

  if (stage === "opening") {
    return (
      <>
        <section className="border-b border-[#aaa397] bg-[#f4f0e8]">
          <div className="mx-auto grid min-h-[620px] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
            <div>
              <p className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244f73]">Chair fit calculator · Method 1.0</p>
              <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-[#1f1d19] sm:text-6xl">
                Find a chair that fits your body and your desk.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#575249]">
                Get measurement-backed ranges, see where evidence is incomplete, and find verified places to try your shortlist.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setStage("body")} className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#244f73] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#193a55]">
                  Calculate my fit <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/compare" className="inline-flex min-h-12 items-center justify-center border border-[#8e887d] px-6 text-sm font-semibold text-[#292723] transition-colors hover:bg-white">
                  Check chairs I already know
                </Link>
              </div>
              <p className="mt-4 text-sm text-[#6b655c]">
                Choosing by budget, material, or work style? <Link href="/chair" className="font-semibold text-[#244f73] underline underline-offset-4">Ask chA.I.r</Link> for preference-based discovery.
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
        <AuthorityPrimer />
      </>
    )
  }

  if (stage === "passport") {
    return (
      <section className="fit-passport-page mx-auto max-w-5xl px-5 py-12 sm:py-20">
        <button type="button" onClick={() => setStage("desk")} className="mb-8 inline-flex items-center gap-2 text-sm text-[#575249] hover:text-[#1f1d19]"><ArrowLeft className="h-4 w-4" /> Edit inputs</button>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244f73]">Your fit passport · Method 1.0</p>
        <h1 className="mt-4 font-serif text-4xl font-medium text-[#1f1d19] sm:text-5xl">Your suggested starting ranges.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[#575249]">These ranges narrow the field. Published chair dimensions can rule a chair out, but comfort still needs to be tried in person.</p>
        <div className="mt-10 grid border border-[#aaa397] md:grid-cols-3">
          {[
            ["Seat height", cmRange(profile.suggestedSeatHeightCm), "Estimated from entered height"],
            ["Seat depth", cmRange(profile.suggestedSeatDepthCm), "Estimated thigh-support range"],
            ["Desk clearance", underDesk ? `${desk} cm desk` : "Not required", underDesk ? "Armrests must tuck below" : "Armrests may remain outside"],
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
        <RecommendationResults
          payload={recommendations}
          failed={recommendationError}
          onRetry={() => setRecommendationAttempt(attempt => attempt + 1)}
          activeChair={activeChair}
          onActiveChair={setActiveChair}
          userProfile={profile}
          inputs={{ heightCm: height, weightKg: weight, deskHeightCm: desk, armrestsUnderDesk: underDesk }}
        />
        <div className="mt-8 flex flex-col gap-3 border-t border-[#aaa397] pt-6 sm:flex-row">
          <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#244f73] px-6 text-sm font-semibold text-white hover:bg-[#193a55]">Browse the full chair catalog <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/stores" className="inline-flex min-h-12 items-center justify-center border border-[#8e887d] px-6 text-sm font-semibold text-[#292723] hover:bg-white">Browse verified showrooms</Link>
        </div>
      </section>
    )
  }

  const isBody = stage === "body"
  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between border-b border-[#aaa397] pb-4">
        <button type="button" onClick={() => setStage(isBody ? "opening" : "body")} className="inline-flex items-center gap-2 text-sm text-[#575249] hover:text-[#1f1d19]"><ArrowLeft className="h-4 w-4" /> Back</button>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#777168]">{isBody ? "01 · Body" : "02 · Desk"} / 02</p>
      </div>
      <div className="grid min-w-0 gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244f73]">{isBody ? "Body measurements" : "Work surface"}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[#1f1d19]">{isBody ? "Start with your height." : "Now check the desk."}</h1>
          <p className="mt-4 leading-7 text-[#575249]">{isBody ? "Height estimates broad seat ranges. Weight is optional and is used only for capacity margin." : "Desk height checks clearance. The range graphic changes immediately; no average values are submitted silently."}</p>
          <div className="mt-10 space-y-8">
            {isBody ? (
              <>
                <label className="block"><span className="flex justify-between text-sm font-semibold"><span>Height</span><span>{height} cm</span></span><input aria-label="Height in centimetres" type="range" min="145" max="205" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-4 w-full accent-[#244f73]" /></label>
                <label className="block"><span className="flex justify-between text-sm font-semibold"><span>Weight <span className="font-normal text-[#777168]">optional</span></span><span>{weight ? `${weight} kg` : "Not entered"}</span></span><input aria-label="Weight in kilograms" type="range" min="40" max="160" value={weight ?? 70} onChange={(e) => setWeight(Number(e.target.value))} className="mt-4 w-full accent-[#244f73]" /></label>
              </>
            ) : (
              <>
                <label className="block"><span className="flex justify-between text-sm font-semibold"><span>Desk height</span><span>{desk} cm</span></span><input aria-label="Desk height in centimetres" type="range" min="58" max="90" value={desk} onChange={(e) => setDesk(Number(e.target.value))} className="mt-4 w-full accent-[#244f73]" /></label>
                <label className="flex cursor-pointer items-start gap-3 border-y border-[#c8c1b5] py-4 text-sm leading-6"><input type="checkbox" checked={underDesk} onChange={(e) => setUnderDesk(e.target.checked)} className="mt-1 h-4 w-4 accent-[#244f73]" /><span><strong className="block text-[#292723]">Armrests must tuck below the desk</strong><span className="text-[#777168]">This adds desk clearance as a fit constraint.</span></span></label>
              </>
            )}
          </div>
          <button type="button" onClick={() => setStage(isBody ? "desk" : "passport")} className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#244f73] px-6 text-sm font-semibold text-white hover:bg-[#193a55] sm:w-auto">{isBody ? "Continue to desk" : "Build my fit passport"}<ArrowRight className="h-4 w-4" /></button>
        </div>
        <MeasurementPlate height={height} desk={stage === "desk" ? desk : undefined} active={isBody ? activeLayer : "desk"} onActive={setActiveLayer} compact />
      </div>
    </section>
  )
}

function RecommendationResults({
  payload,
  failed,
  onRetry,
  activeChair,
  onActiveChair,
  userProfile,
  inputs,
}: {
  payload: RecommendationPayload | null
  failed: boolean
  onRetry: () => void
  activeChair: number
  onActiveChair: (index: number) => void
  userProfile: FitProfile
  inputs: FitInputs
}) {
  if (failed) {
    return (
      <div className="mt-14 border border-[#aaa397] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8a5a20]">Catalog temporarily unavailable</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#575249]">Your fit passport remains valid. Product matching was not guessed; browse the catalog and use these ranges until the catalog connection is available.</p>
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
  const displayResults = [...standouts, ...alternatives]
  const chair = displayResults[Math.min(activeChair, displayResults.length - 1)]
  const status = chair.fitStatus === "good" ? "Good range overlap" : chair.fitStatus === "conditional" ? "Check before choosing" : "Fit data incomplete"
  const statusTone = chair.fitStatus === "good" ? "text-[#30633f]" : chair.fitStatus === "conditional" ? "text-[#8a5a20]" : "text-[#68645d]"
  const showroom = payload.showrooms?.find((item) => item.productSlug === chair.slug)
  const sourceDate = chair.sourceUpdatedAt
    ? new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(chair.sourceUpdatedAt))
    : "Date not recorded"

  return (
    <section className="mt-16 border-t border-[#817b71] pt-10" aria-labelledby="catalog-matches">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#244f73]">Catalog application</p>
          <h2 id="catalog-matches" className="mt-3 font-serif text-3xl text-[#1f1d19]">{standouts.length} standout {standouts.length === 1 ? "match" : "matches"}</h2>
        </div>
        <p className="max-w-md text-xs leading-5 text-[#777168]">Candidates are drawn from the live Chairpedia catalog. Missing measurements reduce confidence and remain visible.</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
        <div className="space-y-2" role="list" aria-label="Chair candidates">
          {standouts.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              onClick={() => onActiveChair(index)}
              onMouseEnter={() => onActiveChair(index)}
              onFocus={() => onActiveChair(index)}
              className={`grid w-full min-w-0 grid-cols-[56px_minmax(0,1fr)] items-center gap-3 border p-3 text-left transition-colors sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-4 ${index === activeChair ? "border-[#244f73] bg-[#eef2f4]" : "border-[#c8c1b5] bg-[#f8f5ef] hover:bg-white"}`}
            >
              <div className="h-16 overflow-hidden bg-white"><ChairProductImage src={item.image} alt={`${item.brand ?? ""} ${item.name}`.trim()} category="office" className="object-contain p-1" /></div>
              <div className="min-w-0"><p className="text-xs text-[#777168]">{item.brand ?? "Brand not listed"}</p><p className="mt-1 break-words font-semibold text-[#292723]">{item.name}</p><p className="mt-1 text-[11px] text-[#244f73]">{item.awards?.slice(0, 2).map((award) => award.title).join(" · ")}</p></div>
              <span className={`col-start-2 text-xs font-semibold sm:col-start-auto ${item.fitStatus === "good" ? "text-[#30633f]" : item.fitStatus === "conditional" ? "text-[#8a5a20]" : "text-[#68645d]"}`}>{item.fit.score}/100</span>
            </button>
          ))}
        </div>

        <article className="border border-[#aaa397] bg-[#f8f5ef]">
          <div className="grid min-w-0 gap-4 border-b border-[#c8c1b5] p-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0"><p className="text-xs text-[#777168]">{chair.brand ?? "Brand not listed"}</p><h3 className="mt-1 break-words font-serif text-2xl text-[#1f1d19]">{chair.name}</h3><div className="mt-3 flex flex-wrap gap-2">{chair.awards?.slice(0, 2).map((award, index) => <span key={award.id} className={`border border-[#244f73] px-2 py-1 text-[10px] font-semibold uppercase tracking-[.08em] ${index === 0 ? "bg-[#244f73] text-white" : "text-[#244f73]"}`}>{award.title}</span>)}</div>{(chair.awards?.length ?? 0) > 2 && <p className="mt-2 text-xs text-[#575249]"><strong>Also excels at:</strong> {chair.awards?.slice(2).map((award) => award.title).join(", ")}</p>}</div>
            <div className="grid justify-items-start gap-1 sm:justify-items-end"><p className="font-serif text-4xl font-semibold text-[#1f1d19]">{chair.fit.score}<span className="text-base text-[#777168]">/100</span></p><p className="text-[9px] uppercase tracking-[.1em] text-[#777168]">Fit Score · index, not a probability</p><div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${statusTone}`}>{chair.fitStatus === "good" ? <Check className="h-4 w-4" /> : chair.fitStatus === "conditional" ? <AlertTriangle className="h-4 w-4" /> : <CircleHelp className="h-4 w-4" />}{status}</div></div>
          </div>
          <div className="p-5">
            <EvidenceRail label="Seat height" user={userProfile.suggestedSeatHeightCm} chair={chair.fit.measurements.seatHeightCm} />
            <EvidenceRail label="Seat depth" user={userProfile.suggestedSeatDepthCm} chair={chair.fit.measurements.seatDepthCm} />
            <ConfigurationCheck key={`${chair.slug}:${JSON.stringify(inputs)}`} slug={chair.slug} inputs={inputs} />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <EvidenceList title="Supports" items={chair.fit.evidence} empty="No confirmed positive overlap" tone="good" />
              <EvidenceList title="Check" items={chair.fit.conflicts} empty="No hard conflict found" tone="warn" />
              <EvidenceList title="Unknown" items={chair.fit.unknowns} empty="No key field missing" tone="neutral" />
            </div>
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
            <div className="mt-6 flex flex-col gap-3 border-t border-[#c8c1b5] pt-5 sm:flex-row">
              <Link href={`/products/${chair.slug}`} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#244f73] px-5 text-sm font-semibold text-white hover:bg-[#193a55]">Open chair dossier <ArrowRight className="h-4 w-4" /></Link>
              <Link href={showroom?.finderPath ?? `/stores?model=${encodeURIComponent(chair.slug)}`} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#8e887d] px-5 text-sm font-semibold text-[#292723] hover:bg-white"><MapPin className="h-4 w-4" />{showroom?.exactTrialCount ? `${showroom.exactTrialCount} confirmed trial location${showroom.exactTrialCount === 1 ? "" : "s"}` : "Find places to try it"}</Link>
            </div>
            {showroom && (showroom.exactTrialCount > 0 || showroom.brandStoreCount > 0) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#575249]">
                <span><strong className="text-[#292723]">{showroom.exactTrialCount}</strong> exact-model trial locations</span>
                <span><strong className="text-[#292723]">{showroom.brandStoreCount}</strong> additional brand-carrying stores</span>
              </div>
            )}
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-[#777168]">Confidence: {chair.fitConfidence} · Product record checked {sourceDate} · Verify configuration in the dossier</p>
          </div>
        </article>
      </div>

      {alternatives.length > 0 && (
        <div className="mt-10 border-t border-[#aaa397] pt-8">
          <h3 className="font-serif text-2xl text-[#1f1d19]">More compatible options</h3>
          <div className="mt-4 divide-y divide-[#c8c1b5] border-y border-[#c8c1b5]">
            {alternatives.map((item, index) => {
              const displayIndex = standouts.length + index
              return (
                <button key={item.id} type="button" onClick={() => onActiveChair(displayIndex)} className="grid w-full min-w-0 grid-cols-[56px_minmax(0,1fr)_auto] gap-3 py-4 text-left sm:grid-cols-[64px_minmax(0,1fr)_auto_auto] sm:items-center">
                  <div className="h-14 overflow-hidden bg-white"><ChairProductImage src={item.image} alt={`${item.brand ?? ""} ${item.name}`.trim()} category="office" className="object-contain p-1" /></div>
                  <div className="min-w-0"><p className="text-xs text-[#777168]">{item.brand ?? "Brand not listed"}</p><p className="break-words font-semibold text-[#292723]">{item.name}</p>{item.alternativeReason && <p className="mt-1 text-xs leading-5 text-[#575249]">{item.alternativeReason}</p>}</div>
                  <span className="text-sm font-semibold text-[#292723]">{item.fit.score}/100</span>
                  <span className={`col-span-2 justify-self-start border px-2 py-1 text-[10px] font-semibold uppercase tracking-[.08em] sm:col-span-1 ${item.strongAlternative ? "border-[#244f73] bg-[#244f73] text-white" : "border-[#8e887d] text-[#575249]"}`}>{item.strongAlternative ? "Strong alternative" : "Compatible option"}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
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
  return <div><h4 className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${color}`}>{title}</h4><ul className="mt-2 space-y-2 text-xs leading-5 text-[#575249]">{(items.length ? items : [empty]).map((item) => <li key={item}>{item}</li>)}</ul></div>
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
