"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  ExperienceReviewsList,
  type ExperienceReviewCard,
} from "@/components/reviews/experience-reviews-list"

type FacetKey = "age" | "job" | "sit" | "pain"
type Option = { value: string; label: string }

const AGE_ORDER = ["under20", "20s", "30s", "40s", "50plus"] as const
const AGE_LABELS: Record<string, string> = {
  under20: "Under 20",
  "20s": "20s",
  "30s": "30s",
  "40s": "40s",
  "50plus": "50+",
}

const SIT_ORDER = ["under2", "2to6", "over6"] as const
const SIT_LABELS: Record<string, string> = {
  under2: "Under 2 hrs",
  "2to6": "2–6 hrs",
  over6: "6+ hrs",
}

const EMPTY: Record<FacetKey, string[]> = { age: [], job: [], sit: [], pain: [] }

// Keep catch-all buckets at the end of a facet row.
const SINK = new Set(["Other", "None"])
function facetSort(a: string, b: string) {
  return (SINK.has(a) ? 1 : 0) - (SINK.has(b) ? 1 : 0) || a.localeCompare(b)
}

/**
 * "Find reviews from people like you" — tap age / job / sitting-time / pain
 * chips to filter the experience reviews to reviewers who match. Chips within a
 * facet are OR; facets are AND. Reuses the existing review card list.
 */
export function ExperienceReviewsBrowser({
  items,
}: {
  items: ExperienceReviewCard[]
}) {
  const [selected, setSelected] = useState<Record<FacetKey, string[]>>(EMPTY)

  // Build chip options from the data so we only show values that exist.
  const facets = useMemo(() => {
    const ages = new Set<string>()
    const jobs = new Set<string>()
    const sits = new Set<string>()
    const pains = new Set<string>()
    for (const it of items) {
      if (it.ageBand) ages.add(it.ageBand)
      if (it.job) jobs.add(it.job)
      if (it.sitHours) sits.add(it.sitHours)
      for (const p of it.pain ?? []) pains.add(p)
    }
    return {
      age: AGE_ORDER.filter((a) => ages.has(a)).map((a) => ({
        value: a,
        label: AGE_LABELS[a],
      })),
      sit: SIT_ORDER.filter((s) => sits.has(s)).map((s) => ({
        value: s,
        label: SIT_LABELS[s],
      })),
      job: [...jobs].sort(facetSort).map((j) => ({ value: j, label: j })),
      pain: [...pains].sort(facetSort).map((p) => ({ value: p, label: p })),
    }
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (selected.age.length && (!it.ageBand || !selected.age.includes(it.ageBand)))
        return false
      if (selected.sit.length && (!it.sitHours || !selected.sit.includes(it.sitHours)))
        return false
      if (selected.job.length && (!it.job || !selected.job.includes(it.job)))
        return false
      if (
        selected.pain.length &&
        !(it.pain ?? []).some((p) => selected.pain.includes(p))
      )
        return false
      return true
    })
  }, [items, selected])

  const activeCount =
    selected.age.length +
    selected.job.length +
    selected.sit.length +
    selected.pain.length

  function toggle(facet: FacetKey, value: string) {
    setSelected((prev) => {
      const cur = prev[facet]
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value]
      return { ...prev, [facet]: next }
    })
  }

  // Sort: newest first (default) or the server's random order (fresh per visit).
  const [sort, setSort] = useState<"newest" | "random">("newest")
  const sorted = useMemo(() => {
    if (sort === "random") return filtered
    return [...filtered].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    )
  }, [filtered, sort])

  // Pagination over the sorted list.
  const PAGE_SIZE = 20
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  // Back to page 1 whenever the filter or sort changes.
  useEffect(() => {
    setPage(1)
  }, [selected, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages))
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div ref={topRef}>
      <div className="mb-5 rounded-xl border border-[#EFEFEF] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Find reviews from people like you
          </p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => setSelected(EMPTY)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear ({activeCount})
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          <FacetRow
            label="Age"
            options={facets.age}
            selected={selected.age}
            onToggle={(v) => toggle("age", v)}
          />
          <FacetRow
            label="Job"
            options={facets.job}
            selected={selected.job}
            onToggle={(v) => toggle("job", v)}
          />
          <FacetRow
            label="Sitting"
            options={facets.sit}
            selected={selected.sit}
            onToggle={(v) => toggle("sit", v)}
          />
          <FacetRow
            label="Pain area"
            options={facets.pain}
            selected={selected.pain}
            onToggle={(v) => toggle("pain", v)}
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {activeCount > 0
            ? `${filtered.length} reviewer${filtered.length === 1 ? "" : "s"} like you`
            : `${items.length} experience review${items.length === 1 ? "" : "s"}`}
          {totalPages > 1 ? ` · page ${currentPage} of ${totalPages}` : ""}
        </p>
        <div className="flex shrink-0 items-center gap-1 text-xs">
          {(["newest", "random"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={`rounded-full px-3 py-1 capitalize transition-colors ${
                sort === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "newest" ? "Newest" : "Random"}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && filtered.length === 0 ? (
        <div className="rounded-xl border border-[#EFEFEF] bg-white px-6 py-14 text-center">
          <p className="font-medium text-foreground">No reviews match yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your combination is rare — try removing a filter (or be the one to
            write it!).
          </p>
          <button
            type="button"
            onClick={() => setSelected(EMPTY)}
            className="mt-4 text-sm font-medium underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ExperienceReviewsList items={pageItems} />
          {totalPages > 1 && (
            <Pager current={currentPage} total={totalPages} onGo={goToPage} />
          )}
        </>
      )}
    </div>
  )
}

function Pager({
  current,
  total,
  onGo,
}: {
  current: number
  total: number
  onGo: (p: number) => void
}) {
  // 1 … (current-1) current (current+1) … total
  const wanted = new Set([1, total, current - 1, current, current + 1])
  const valid = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const cells: Array<number | "gap"> = []
  let prev = 0
  for (const p of valid) {
    if (p - prev > 1) cells.push("gap")
    cells.push(p)
    prev = p
  }

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <PagerButton disabled={current <= 1} onClick={() => onGo(current - 1)}>
        ← Prev
      </PagerButton>
      {cells.map((c, i) =>
        c === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={c}
            type="button"
            onClick={() => onGo(c)}
            aria-current={c === current ? "page" : undefined}
            className={cn(
              "min-w-9 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              c === current
                ? "border-foreground bg-foreground text-background"
                : "border-[#EFEFEF] bg-white text-foreground hover:border-neutral-300"
            )}
          >
            {c}
          </button>
        )
      )}
      <PagerButton disabled={current >= total} onClick={() => onGo(current + 1)}>
        Next →
      </PagerButton>
    </nav>
  )
}

function PagerButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-[#EFEFEF] bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function FacetRow({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: Option[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap items-start gap-2">
      <span className="mt-1 w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-[#EFEFEF] bg-white text-foreground hover:border-neutral-300"
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
