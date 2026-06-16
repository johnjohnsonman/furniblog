"use client"

import { useMemo, useState } from "react"
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
      job: [...jobs].sort().map((j) => ({ value: j, label: j })),
      pain: [...pains].sort().map((p) => ({ value: p, label: p })),
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

  return (
    <div>
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

      <p className="mb-3 text-sm text-muted-foreground">
        {activeCount > 0
          ? `${filtered.length} reviewer${filtered.length === 1 ? "" : "s"} like you`
          : `${items.length} experience review${items.length === 1 ? "" : "s"}`}
      </p>

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
        <ExperienceReviewsList items={filtered} />
      )}
    </div>
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
