"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion"
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"
import { BodyMap } from "./BodyMap"
import type {
  Budget,
  QuizAnswers,
  Recommendation,
  Style,
  UseCase,
} from "@/lib/recommend/engine"

const ACCENT = "#f0a830"

// ---- option data (values must match the engine) ----
const USE: { v: UseCase; t: string; d: string }[] = [
  { v: "office", t: "Office work", d: "Focus, all-day at a desk" },
  { v: "gaming", t: "Gaming", d: "Long sessions, deep recline" },
  { v: "executive", t: "Executive", d: "Presence and premium feel" },
  { v: "study", t: "Study", d: "Reading and good posture" },
  { v: "standing", t: "Standing desk", d: "Active, perch-style sitting" },
  { v: "lounge", t: "Lounge", d: "Relax and recline" },
]
const BUDGET: { v: Budget; t: string; d: string }[] = [
  { v: "$", t: "$", d: "Budget · under ~$300" },
  { v: "$$", t: "$$", d: "Mid · ~$300–700" },
  { v: "$$$", t: "$$$", d: "Premium · ~$700–1500" },
  { v: "$$$$", t: "$$$$", d: "Flagship · $1500+" },
]
const HOURS: { v: NonNullable<QuizAnswers["sitHours"]>; t: string; d: string }[] = [
  { v: "under2", t: "Under 2 hours", d: "Light use" },
  { v: "2to6", t: "2–6 hours", d: "A solid workday" },
  { v: "over6", t: "6+ hours", d: "Practically all day" },
]
const STYLE: { v: Style; t: string; d: string }[] = [
  { v: "minimal", t: "Minimal", d: "Clean, modern, understated" },
  { v: "ergonomic", t: "Ergonomic", d: "Adjustable, supportive" },
  { v: "classic", t: "Classic", d: "Executive, timeless" },
  { v: "sporty", t: "Sporty", d: "Racing-inspired, bold" },
  { v: "premium", t: "Premium", d: "Flagship materials" },
]
const FEATURES: { v: string; t: string }[] = [
  { v: "headrest", t: "Headrest" },
  { v: "armrest", t: "Adjustable arms" },
  { v: "recline", t: "Deep recline" },
  { v: "lumbar", t: "Lumbar support" },
]

type StepKey =
  | "intro"
  | "use"
  | "budget"
  | "hours"
  | "pain"
  | "style"
  | "features"
  | "analyzing"
  | "results"

const FLOW: StepKey[] = [
  "intro",
  "use",
  "budget",
  "hours",
  "pain",
  "style",
  "features",
  "analyzing",
  "results",
]
const QUESTION_STEPS = FLOW.slice(1, 7) // use..features for the progress dots

const TAG_LABEL: Record<string, string> = {
  "best-match": "✓ Best match",
  "reviewer-favorite": "★ Reviewer favorite",
  "best-value": "💰 Best value",
  "new-noteworthy": "✨ New & noteworthy",
}

const stepTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }

export function Quiz() {
  const [step, setStep] = useState<StepKey>("intro")
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [seed] = useState(() => Math.floor(Math.random() * 1e9))
  const [results, setResults] = useState<Recommendation[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const idx = FLOW.indexOf(step)
  const qIndex = QUESTION_STEPS.indexOf(step as StepKey)

  const go = useCallback((s: StepKey) => setStep(s), [])
  const next = useCallback(() => go(FLOW[Math.min(idx + 1, FLOW.length - 1)]), [idx, go])
  const back = useCallback(() => go(FLOW[Math.max(idx - 1, 0)]), [idx, go])

  // pick a single-select answer, then advance cinematically
  function choose<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }))
    window.setTimeout(next, 320)
  }
  function toggleArray(key: "pain" | "features", value: string) {
    setAnswers((a) => {
      const cur = (a[key] as string[] | undefined) ?? []
      const nextArr = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value]
      return { ...a, [key]: nextArr }
    })
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0b0a08] text-[#f4efe6]">
      {/* ambient cinematic glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[60vh] w-[120vw] -translate-x-1/2 rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: ACCENT }}
      />

      {/* top chrome: back + progress */}
      <div className="relative z-10 flex items-center gap-4 px-6 py-5 sm:px-10">
        {idx > 0 && step !== "analyzing" && step !== "results" ? (
          <button
            onClick={back}
            className="flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <span className="text-sm font-medium tracking-wide text-white/40">
            The Sit Test
          </span>
        )}
        {qIndex >= 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            {QUESTION_STEPS.map((s, i) => (
              <motion.span
                key={s}
                className="h-1.5 rounded-full"
                animate={{
                  width: i === qIndex ? 26 : 7,
                  backgroundColor:
                    i <= qIndex ? ACCENT : "rgba(255,255,255,0.18)",
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.main
          key={step}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={stepTransition}
          className="relative z-10 mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-5xl flex-col items-center justify-center px-6 pb-16"
        >
          {step === "intro" && <Intro onStart={next} />}

          {step === "use" && (
            <Question title="Where will you spend your hours?" hint="Pick the closest fit.">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {USE.map((o) => (
                  <TiltCard
                    key={o.v}
                    active={answers.useCase === o.v}
                    onClick={() => choose("useCase", o.v)}
                    title={o.t}
                    desc={o.d}
                  />
                ))}
              </div>
            </Question>
          )}

          {step === "budget" && (
            <Question title="What's your budget?" hint="We'll keep value picks in the mix.">
              <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
                {BUDGET.map((o) => (
                  <Segment
                    key={o.v}
                    active={answers.budget === o.v}
                    onClick={() => choose("budget", o.v)}
                    big={o.t}
                    desc={o.d}
                  />
                ))}
              </div>
            </Question>
          )}

          {step === "hours" && (
            <Question title="How long do you sit each day?">
              <div className="grid w-full max-w-2xl gap-3">
                {HOURS.map((o) => (
                  <Row
                    key={o.v}
                    active={answers.sitHours === o.v}
                    onClick={() => choose("sitHours", o.v)}
                    title={o.t}
                    desc={o.d}
                  />
                ))}
              </div>
            </Question>
          )}

          {step === "pain" && (
            <Question
              title="Where does it hurt?"
              hint="Tap any spots — or skip if you're pain-free."
            >
              <BodyMap
                selected={answers.pain ?? []}
                onToggle={(id) => toggleArray("pain", id)}
              />
              <ContinueBar
                onContinue={() => {
                  if (!answers.pain) setAnswers((a) => ({ ...a, pain: ["None"] }))
                  next()
                }}
                label={answers.pain?.length ? "Continue" : "No pain — continue"}
              />
            </Question>
          )}

          {step === "style" && (
            <Question title="What's your taste?">
              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {STYLE.map((o) => (
                  <TiltCard
                    key={o.v}
                    active={answers.style === o.v}
                    onClick={() => choose("style", o.v)}
                    title={o.t}
                    desc={o.d}
                    compact
                  />
                ))}
              </div>
            </Question>
          )}

          {step === "features" && (
            <Question title="Any must-haves?" hint="Optional — pick what matters.">
              <div className="flex flex-wrap justify-center gap-3">
                {FEATURES.map((o) => (
                  <Chip
                    key={o.v}
                    active={(answers.features ?? []).includes(o.v)}
                    onClick={() => toggleArray("features", o.v)}
                    label={o.t}
                  />
                ))}
              </div>
              <ContinueBar onContinue={next} label="See my matches" />
            </Question>
          )}

          {step === "analyzing" && (
            <Analyzing
              answers={{ ...answers, seed }}
              onDone={(r) => {
                setResults(r)
                go("results")
              }}
              onError={(e) => {
                setError(e)
                go("results")
              }}
            />
          )}

          {step === "results" && (
            <Results
              results={results}
              error={error}
              onRestart={() => {
                setAnswers({})
                setResults(null)
                setError(null)
                go("intro")
              }}
            />
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

/* ---------------- pieces ---------------- */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 100 100"
        className="mb-8"
        initial="hidden"
        animate="visible"
      >
        {[
          "M28 70 L28 44 Q28 38 34 38 L60 38",
          "M30 70 L66 70 L72 46",
          "M34 38 L40 24 L66 24 L72 46",
          "M30 70 L26 86 M66 70 L70 86",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 1.1, delay: 0.15 * i, ease: "easeInOut" },
              },
            }}
          />
        ))}
      </motion.svg>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...stepTransition }}
        className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-6xl"
      >
        Let&rsquo;s find the one
        <br />
        you&rsquo;ll live in.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-5 max-w-md text-base text-white/55"
      >
        Six quick questions, then five chairs matched to you — cross-referenced
        against <span className="text-white/80">1,600+ real reviews</span>.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
        className="mt-10"
      >
        <Magnetic>
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-2 rounded-full bg-[#f0a830] px-8 py-4 text-base font-medium text-[#1a1206] transition-transform hover:scale-[1.02]"
          >
            Begin
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </Magnetic>
      </motion.div>
    </div>
  )
}

function Question({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stepTransition}
        className="font-serif text-3xl font-medium tracking-tight sm:text-5xl"
      >
        {title}
      </motion.h2>
      {hint && <p className="mt-3 text-sm text-white/45">{hint}</p>}
      <div className="mt-9 flex w-full flex-col items-center">{children}</div>
    </div>
  )
}

function TiltCard({
  active,
  onClick,
  title,
  desc,
  compact,
}: {
  active: boolean
  onClick: () => void
  title: string
  desc: string
  compact?: boolean
}) {
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })
  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 10)
    rx.set(-py * 10)
  }
  return (
    <motion.button
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 700 }}
      whileTap={{ scale: 0.97 }}
      className={`flex flex-col items-start rounded-2xl border p-5 text-left transition-colors ${
        compact ? "min-h-[96px]" : "min-h-[120px]"
      } ${
        active
          ? "border-[#f0a830] bg-[#f0a830]/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      <span className="font-serif text-xl font-medium">{title}</span>
      <span className="mt-1.5 text-sm text-white/50">{desc}</span>
    </motion.button>
  )
}

function Segment({
  active,
  onClick,
  big,
  desc,
}: {
  active: boolean
  onClick: () => void
  big: string
  desc: string
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border px-5 py-6 transition-colors ${
        active
          ? "border-[#f0a830] bg-[#f0a830]/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      <span className="font-serif text-2xl font-medium text-[#f0a830]">{big}</span>
      <span className="text-center text-xs text-white/50">{desc}</span>
    </motion.button>
  )
}

function Row({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  title: string
  desc: string
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center justify-between rounded-2xl border px-6 py-5 text-left transition-colors ${
        active
          ? "border-[#f0a830] bg-[#f0a830]/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      <span className="font-serif text-xl font-medium">{title}</span>
      <span className="text-sm text-white/45">{desc}</span>
    </motion.button>
  )
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={active ? { scale: 1.04 } : { scale: 1 }}
      className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-[#f0a830] bg-[#f0a830] text-[#1a1206]"
          : "border-white/15 bg-white/[0.03] text-white/80 hover:border-white/35"
      }`}
    >
      {label}
    </motion.button>
  )
}

function ContinueBar({
  onContinue,
  label,
}: {
  onContinue: () => void
  label: string
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onClick={onContinue}
      className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#f0a830] hover:text-[#1a1206]"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </motion.button>
  )
}

function Magnetic({ children }: { children: React.ReactNode }) {
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  return (
    <motion.div
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className="inline-block"
    >
      {children}
    </motion.div>
  )
}

function Analyzing({
  answers,
  onDone,
  onError,
}: {
  answers: QuizAnswers
  onDone: (r: Recommendation[]) => void
  onError: (e: string) => void
}) {
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const minDelay = new Promise((res) => setTimeout(res, 2200))
    const fetchRes = fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        return d.results as Recommendation[]
      })
    Promise.all([fetchRes, minDelay])
      .then(([r]) => onDone(r))
      .catch((e) => onError(e instanceof Error ? e.message : "Something went wrong"))
  }, [answers, onDone, onError])

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-28 w-28">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: ACCENT }}
            initial={{ scale: 0.4, opacity: 0.8 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
          />
        ))}
        <motion.div
          className="absolute inset-0 m-auto h-3 w-3 rounded-full"
          style={{ background: ACCENT }}
          animate={{ scale: [1, 1.6, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-10 font-serif text-2xl font-medium sm:text-3xl"
      >
        Cross-referencing your answers
      </motion.p>
      <p className="mt-2 text-sm text-white/50">
        against 1,600+ real reviews&hellip;
      </p>
    </div>
  )
}

function MatchRing({ value }: { value: number }) {
  const r = 32
  const c = 2 * Math.PI * r
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#2a251c" strokeWidth="6" />
      <motion.circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={ACCENT}
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
      />
      <text
        x="40"
        y="45"
        textAnchor="middle"
        fontSize="17"
        fontWeight="600"
        fill="#f4efe6"
      >
        {value}%
      </text>
    </svg>
  )
}

function Results({
  results,
  error,
  onRestart,
}: {
  results: Recommendation[] | null
  error: string | null
  onRestart: () => void
}) {
  if (error || !results) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="font-serif text-2xl">We couldn&rsquo;t build your matches.</p>
        <p className="mt-2 text-sm text-white/50">{error ?? "Please try again."}</p>
        <button
          onClick={onRestart}
          className="mt-8 rounded-full bg-[#f0a830] px-7 py-3 text-sm font-medium text-[#1a1206]"
        >
          Start over
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-[#f0a830]">
          Your matches
        </p>
        <h2 className="mt-2 font-serif text-3xl font-medium sm:text-5xl">
          The five chairs for you
        </h2>
      </motion.div>

      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {results.map((r, i) => (
          <motion.div
            key={r.slug}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12, ...stepTransition }}
          >
            <Link
              href={`/products/${r.slug}`}
              className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-[#f0a830]/50"
            >
              <MatchRing value={r.match} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-xl font-medium">{r.name}</span>
                  {r.tag && (
                    <span className="rounded-full bg-[#f0a830]/15 px-2.5 py-0.5 text-xs font-medium text-[#f0a830]">
                      {TAG_LABEL[r.tag] ?? r.tag}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-white/45">
                  {[r.brand, r.priceRange].filter(Boolean).join(" · ")}
                </p>
                {r.why.length > 0 && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">
                    {r.why.join(" · ")}
                  </p>
                )}
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-white/30" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
        >
          <RotateCcw className="h-4 w-4" /> Start over
        </button>
        <Link
          href="/products"
          className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/20"
        >
          Browse all chairs
        </Link>
      </div>
    </div>
  )
}
