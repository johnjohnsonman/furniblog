"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronsUpDown } from "lucide-react"
import type { BrandReviewCount } from "@/lib/data/reviews"
import type { ReviewFilters, SittingHoursFilter } from "@/lib/reviews/review-filters"
import {
  HEIGHT_MAX,
  HEIGHT_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from "@/lib/reviews/review-filters"
import { FEED_CATEGORY_PILLS } from "@/lib/reviews/feed-category-pills"
import {
  ALL_BACK_ISSUES,
  ALL_OCCUPATIONS,
  BACK_ISSUE_LABELS,
  OCCUPATION_LABELS,
  SOURCE_FILTER_OPTIONS,
  USAGE_PURPOSE_FILTER_LABELS,
} from "@/lib/reviews/review-labels"
import type { BackIssueId, ReviewOccupation, ReviewSource } from "@/types/review"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PRIORITY_BRAND_IDS = [
  "herman-miller",
  "steelcase",
  "okamura",
  "humanscale",
  "hag-flokk",
  "kokuyo",
  "itoki",
  "haworth",
  "knoll",
]

const BODY_TYPE_PILLS: {
  id: ReviewFilters["bodyType"]
  label: string
}[] = [
  { id: "all", label: "All" },
  { id: "slim", label: "Slim" },
  { id: "average", label: "Average" },
  { id: "athletic", label: "Athletic" },
  { id: "plus_size", label: "Plus Size" },
]

const SITTING_HOURS_PILLS: { id: SittingHoursFilter; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "under_4", label: "Under 4h" },
  { id: "4_6", label: "4–6h" },
  { id: "6_8", label: "6–8h" },
  { id: "8_plus", label: "8h+" },
]

const USAGE_PURPOSE_PILLS = (
  Object.entries(USAGE_PURPOSE_FILTER_LABELS) as [
    ReviewFilters["usagePurpose"],
    string,
  ][]
).map(([id, label]) => ({ id, label }))

interface ReviewsFeedFiltersProps {
  filters: ReviewFilters
  onChange: (filters: ReviewFilters) => void
  matchCount: number
  brands: BrandReviewCount[]
  onClear: () => void
  onSaveProfile: () => void
}

function PillButton({
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
        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border shrink-0",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-foreground border-border hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  )
}

export function ReviewsFeedFilters({
  filters,
  onChange,
  matchCount,
  brands,
  onClear,
  onSaveProfile,
}: ReviewsFeedFiltersProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  const sortedBrands = useMemo(() => {
    const byId = new Map(brands.map((b) => [b.brandId, b]))
    const ordered: BrandReviewCount[] = []
    for (const id of PRIORITY_BRAND_IDS) {
      const b = byId.get(id)
      if (b) ordered.push(b)
      byId.delete(id)
    }
    const rest = [...byId.values()].sort((a, b) => b.count - a.count)
    return [...ordered, ...rest]
  }, [brands])

  const heightActive =
    filters.heightRange[0] > HEIGHT_MIN || filters.heightRange[1] < HEIGHT_MAX
  const weightActive =
    filters.weightRange[0] > WEIGHT_MIN || filters.weightRange[1] < WEIGHT_MAX

  const brandLabel =
    filters.brandIds.length === 0
      ? "All Brands"
      : filters.brandIds.length === 1
        ? sortedBrands.find((b) => b.brandId === filters.brandIds[0])
            ?.brandName ?? "1 brand"
        : `${filters.brandIds.length} brands`

  function patch(partial: Partial<ReviewFilters>) {
    onChange({ ...filters, ...partial })
  }

  function toggleBrand(brandId: string) {
    const next = filters.brandIds.includes(brandId)
      ? filters.brandIds.filter((id) => id !== brandId)
      : [...filters.brandIds, brandId]
    patch({ brandIds: next })
  }

  function toggleOccupation(occ: ReviewOccupation) {
    const next = filters.occupations.includes(occ)
      ? filters.occupations.filter((o) => o !== occ)
      : [...filters.occupations, occ]
    patch({ occupations: next })
  }

  function toggleSource(source: ReviewSource) {
    const next = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source]
    patch({ sources: next })
  }

  function toggleBackIssue(issue: BackIssueId) {
    const next = filters.backIssues.includes(issue)
      ? filters.backIssues.filter((i) => i !== issue)
      : [...filters.backIssues, issue]
    patch({ backIssues: next })
  }

  return (
    <div className="space-y-4 p-4 bg-card border border-border rounded-xl">
      {/* Main filter bar */}
      <div className="space-y-3">
        <SectionLabel>Chair Category</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {FEED_CATEGORY_PILLS.map((cat) => (
            <PillButton
              key={cat.id}
              active={filters.category === cat.id}
              onClick={() => patch({ category: cat.id })}
            >
              {cat.label}
            </PillButton>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <SectionLabel>Brand</SectionLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  {brandLabel}
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="start">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    className="text-sm font-medium w-full text-left px-2 py-1.5 rounded hover:bg-muted"
                    onClick={() => patch({ brandIds: [] })}
                  >
                    All Brands
                  </button>
                  {sortedBrands.map(({ brandId, brandName, count }) => (
                    <label
                      key={brandId}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={filters.brandIds.includes(brandId)}
                        onCheckedChange={() => toggleBrand(brandId)}
                      />
                      <span className="flex-1">{brandName}</span>
                      <span className="text-muted-foreground tabular-nums text-xs">
                        {count}
                      </span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <SectionLabel>Sort by</SectionLabel>
            <Select
              value={filters.sort}
              onValueChange={(v) =>
                patch({ sort: v as ReviewFilters["sort"] })
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
                <SelectItem value="match">Best Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Profile panel toggle */}
      <button
        type="button"
        onClick={() => setProfileOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 pt-3 border-t border-border text-left"
      >
        <div>
          <p className="font-medium text-foreground">
            Find reviews from people like you
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Filter by reviewer body type and work habits
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            profileOpen && "rotate-180"
          )}
        />
      </button>

      {profileOpen && (
        <div className="space-y-6 pt-2">
          {/* Body Type */}
          <div className="space-y-4">
            <SectionLabel>Body Type</SectionLabel>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Height Range</Label>
              <Slider
                min={HEIGHT_MIN}
                max={HEIGHT_MAX}
                step={1}
                value={filters.heightRange}
                onValueChange={(v) =>
                  patch({ heightRange: [v[0], v[1]] as [number, number] })
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{HEIGHT_MIN}cm</span>
                <span>{HEIGHT_MAX}cm</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {heightActive ? (
                  <>
                    Showing reviews from{" "}
                    <span className="font-medium text-foreground">
                      {filters.heightRange[0]}–{filters.heightRange[1]}cm
                    </span>{" "}
                    users
                  </>
                ) : (
                  "All heights included"
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Weight Range</Label>
              <Slider
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step={1}
                value={filters.weightRange}
                onValueChange={(v) =>
                  patch({ weightRange: [v[0], v[1]] as [number, number] })
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{WEIGHT_MIN}kg</span>
                <span>{WEIGHT_MAX}kg</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {weightActive ? (
                  <>
                    Showing reviews from{" "}
                    <span className="font-medium text-foreground">
                      {filters.weightRange[0]}–{filters.weightRange[1]}kg
                    </span>{" "}
                    users
                  </>
                ) : (
                  "All weights included"
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Body Type</Label>
              <div className="flex flex-wrap gap-2">
                {BODY_TYPE_PILLS.map((pill) => (
                  <PillButton
                    key={pill.id}
                    active={filters.bodyType === pill.id}
                    onClick={() => patch({ bodyType: pill.id })}
                  >
                    {pill.label}
                  </PillButton>
                ))}
              </div>
            </div>
          </div>

          {/* Work Habits */}
          <div className="space-y-4">
            <SectionLabel>Work Habits</SectionLabel>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Daily Sitting Hours</Label>
              <div className="flex flex-wrap gap-2">
                {SITTING_HOURS_PILLS.map((pill) => (
                  <PillButton
                    key={pill.id}
                    active={filters.sittingHours === pill.id}
                    onClick={() => patch({ sittingHours: pill.id })}
                  >
                    {pill.label}
                  </PillButton>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Occupation</Label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  active={filters.occupations.length === 0}
                  onClick={() => patch({ occupations: [] })}
                >
                  Any
                </PillButton>
                {ALL_OCCUPATIONS.map((occ) => (
                  <PillButton
                    key={occ}
                    active={filters.occupations.includes(occ)}
                    onClick={() => toggleOccupation(occ)}
                  >
                    {OCCUPATION_LABELS[occ]}
                  </PillButton>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Usage Purpose</Label>
              <div className="flex flex-wrap gap-2">
                {USAGE_PURPOSE_PILLS.map((pill) => (
                  <PillButton
                    key={pill.id}
                    active={filters.usagePurpose === pill.id}
                    onClick={() => patch({ usagePurpose: pill.id })}
                  >
                    {pill.label}
                  </PillButton>
                ))}
              </div>
            </div>
          </div>

          {/* Back & Health */}
          <div className="space-y-3">
            <SectionLabel>Back &amp; Health</SectionLabel>
            <p className="text-sm font-medium">Back Issues</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_BACK_ISSUES.map((issue) => (
                <label
                  key={issue}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={filters.backIssues.includes(issue)}
                    onCheckedChange={() => toggleBackIssue(issue)}
                  />
                  {BACK_ISSUE_LABELS[issue]}
                </label>
              ))}
            </div>
          </div>

          {/* Source */}
          <div className="space-y-3">
            <SectionLabel>Source</SectionLabel>
            <p className="text-sm text-muted-foreground">Review Source</p>
            <div className="flex flex-wrap gap-2">
              {SOURCE_FILTER_OPTIONS.map((opt) => {
                const isAll = opt.id === "all"
                const active = isAll
                  ? filters.sources.length === 0
                  : filters.sources.includes(opt.id as ReviewSource)
                return (
                  <PillButton
                    key={opt.id}
                    active={active}
                    onClick={() => {
                      if (isAll) {
                        patch({ sources: [] })
                      } else {
                        toggleSource(opt.id as ReviewSource)
                      }
                    }}
                  >
                    {opt.label}
                  </PillButton>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-border">
        <p className="text-sm font-medium tabular-nums">
          {matchCount} review{matchCount === 1 ? "" : "s"} match your profile
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all filters
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveProfile}>
            Save my profile
          </Button>
        </div>
      </div>
    </div>
  )
}
