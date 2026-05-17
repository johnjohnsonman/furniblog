"use client"

import { useEffect, useRef } from "react"
import { ExternalLink, Pencil, Trash2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { AdminReview } from "./admin-review-types"
import {
  SOURCE_LABELS,
  formatReviewDate,
  formatSourceUrl,
  renderStars,
} from "./admin-review-types"

interface AdminReviewCardProps {
  review: AdminReview
  selected: boolean
  focused: boolean
  onSelect: (id: string, checked: boolean) => void
  onFocus: (id: string) => void
  onEdit: (review: AdminReview) => void
  onVerify: (review: AdminReview) => void
  onDelete: (review: AdminReview) => void
}

export function AdminReviewCard({
  review,
  selected,
  focused,
  onSelect,
  onFocus,
  onEdit,
  onVerify,
  onDelete,
}: AdminReviewCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (focused && cardRef.current) {
      cardRef.current.focus()
    }
  }, [focused])

  const sourceLabel = SOURCE_LABELS[review.source] ?? review.source
  const stars = renderStars(review.score)
  const urlLabel = formatSourceUrl(review.sourceUrl)

  return (
    <article
      ref={cardRef}
      tabIndex={0}
      onFocus={() => onFocus(review.id)}
      onClick={() => onFocus(review.id)}
      className={cn(
        "flex gap-4 rounded-lg border bg-card p-4 transition-colors outline-none",
        focused ? "border-foreground ring-1 ring-foreground/20" : "border-border",
        selected && "bg-muted/30"
      )}
    >
      <div className="pt-1">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(review.id, v === true)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select review for ${review.productName}`}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {sourceLabel}
              </Badge>
              <span className="font-medium text-foreground">
                {review.productName}
              </span>
              <Badge
                variant={review.verified ? "default" : "outline"}
                className={cn(
                  review.verified
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                    : "text-muted-foreground"
                )}
              >
                {review.verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatReviewDate(review.createdAt)}
              {urlLabel ? ` · ${urlLabel}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-sm">
            <span className="text-[#F5A623] tracking-tight">{stars}</span>
            <span className="font-medium">{review.score}/5</span>
          </div>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
          &ldquo;{review.summary}&rdquo;
        </p>

        {(review.pros.length > 0 || review.cons.length > 0) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {review.pros.map((pro) => (
              <span
                key={`pro-${pro}`}
                className="rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-1"
              >
                ??{pro}
              </span>
            ))}
            {review.cons.map((con) => (
              <span
                key={`con-${con}`}
                className="rounded-full bg-red-50 text-red-800 px-2.5 py-1"
              >
                ??{con}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
          {review.sourceUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={review.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View Source
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(review)
            }}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onVerify(review)
            }}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            {review.verified ? "Unverify" : "Verify"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(review)
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  )
}


