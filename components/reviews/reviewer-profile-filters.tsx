"use client"

import type { ReviewFilters, SittingHoursFilter } from "@/lib/reviews/review-filters"
import {
  HEIGHT_MAX,
  HEIGHT_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
  hasActiveProfileFilters,
} from "@/lib/reviews/review-filters"
import { PRODUCT_BACK_ISSUE_OPTIONS, BACK_ISSUE_LABELS } from "@/lib/reviews/review-labels"
import type { BackIssueId } from "@/types/review"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const BODY_TYPE_PILLS: { id: ReviewFilters["bodyType"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "slim", label: "Slim" },
  { id: "average", label: "Average" },
  { id: "athletic", label: "Athletic" },
  { id: "plus_size", label: "Plus" },
]

const SITTING_HOURS_PILLS: { id: SittingHoursFilter; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "under_4", label: "Under 4h" },
  { id: "4_6", label: "4–6h" },
  { id: "6_8", label: "6–8h" },
  { id: "8_plus", label: "8h+" },
]

function Pill({
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
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background border-border hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

interface ReviewerProfileFiltersProps {
  filters: ReviewFilters
  onChange: (filters: ReviewFilters) => void
  matchCount: number
  totalCount: number
}

export function ReviewerProfileFilters({
  filters,
  onChange,
  matchCount,
  totalCount,
}: ReviewerProfileFiltersProps) {
  const profileActive = hasActiveProfileFilters(filters)

  function toggleBackIssue(id: BackIssueId) {
    const next = filters.backIssues.includes(id)
      ? filters.backIssues.filter((x) => x !== id)
      : [...filters.backIssues, id]
    onChange({ ...filters, backIssues: next })
  }

  return (
    <section className="p-5 bg-muted/30 rounded-xl border border-border space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-medium text-foreground">Filter by Reviewer Profile</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Match reviews to your height, weight, and health needs.
          </p>
        </div>
        {profileActive && (
          <p className="text-sm font-medium text-foreground">
            {matchCount} review{matchCount === 1 ? "" : "s"} match your profile
            <span className="text-muted-foreground font-normal">
              {" "}
              / {totalCount}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">
          Height range: {filters.heightRange[0]}–{filters.heightRange[1]} cm
        </Label>
        <Slider
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          step={1}
          value={filters.heightRange}
          onValueChange={(v) =>
            onChange({
              ...filters,
              heightRange: [v[0] ?? HEIGHT_MIN, v[1] ?? HEIGHT_MAX],
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">
          Weight range: {filters.weightRange[0]}–{filters.weightRange[1]} kg
        </Label>
        <Slider
          min={WEIGHT_MIN}
          max={WEIGHT_MAX}
          step={1}
          value={filters.weightRange}
          onValueChange={(v) =>
            onChange({
              ...filters,
              weightRange: [v[0] ?? WEIGHT_MIN, v[1] ?? WEIGHT_MAX],
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Body type</Label>
        <div className="flex flex-wrap gap-2">
          {BODY_TYPE_PILLS.map((pill) => (
            <Pill
              key={pill.id}
              active={filters.bodyType === pill.id}
              onClick={() => onChange({ ...filters, bodyType: pill.id })}
            >
              {pill.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Daily sitting hours</Label>
        <div className="flex flex-wrap gap-2">
          {SITTING_HOURS_PILLS.map((pill) => (
            <Pill
              key={pill.id}
              active={filters.sittingHours === pill.id}
              onClick={() => onChange({ ...filters, sittingHours: pill.id })}
            >
              {pill.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Back issues</Label>
        <div className="flex flex-wrap gap-4">
          {PRODUCT_BACK_ISSUE_OPTIONS.map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={filters.backIssues.includes(id)}
                onCheckedChange={() => toggleBackIssue(id)}
              />
              {BACK_ISSUE_LABELS[id]}
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
