"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { AdminReviewCard } from "@/components/admin/AdminReviewCard"
import { AdminReviewEditDialog } from "@/components/admin/AdminReviewEditDialog"
import type {
  AdminReview,
  AdminReviewStats,
  ProductOption,
} from "@/components/admin/admin-review-types"
import {
  SOURCE_OPTIONS,
  getSourceBadgeClass,
} from "@/components/admin/admin-review-types"
import type { ReviewSource } from "@/types/review"
import { cn } from "@/lib/utils"

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminReviewsPage() {
  const { toast } = useToast()

  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [stats, setStats] = useState<AdminReviewStats>({
    total: 0,
    verified: 0,
    unverified: 0,
    todayAdded: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  })
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [productId, setProductId] = useState("all")
  const [source, setSource] = useState("all")
  const [verified, setVerified] = useState("all")
  const [sort, setSort] = useState("created")

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const [editReview, setEditReview] = useState<AdminReview | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products")
    const data = await res.json()
    setProducts(
      (data.products ?? []).map((p: { id: string; slug: string; name: string }) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
      }))
    )
  }, [])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: "30",
      source,
      productId,
      verified,
      sort,
    })
    if (search) params.set("search", search)

    const res = await fetch(`/api/admin/reviews?${params}`)
    const data = await res.json()

    if (!res.ok) {
      toast({
        title: "Failed to load reviews",
        description: data.error ?? "Unknown error",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    setReviews(data.reviews ?? [])
    if (data.stats) setStats(data.stats)
    if (data.pagination) setPagination(data.pagination)
    setLoading(false)
  }, [pagination.page, source, productId, verified, sort, search, toast])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPagination((p) => ({ ...p, page: 1 }))
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const focusedReview = reviews.find((r) => r.id === focusedId) ?? null

  const toggleVerify = useCallback(
    async (review: AdminReview) => {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !review.verified }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: "Verify failed",
          description: data.error,
          variant: "destructive",
        })
        return
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === data.review.id ? data.review : r))
      )
      toast({
        title: data.review.verified ? "Review verified" : "Review unverified",
      })
    },
    [toast]
  )

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        editOpen ||
        deleteTarget ||
        bulkDeleteOpen
      ) {
        return
      }

      if (!focusedReview) return

      if (e.key === "Delete") {
        e.preventDefault()
        setDeleteTarget(focusedReview)
      }
      if (e.key === "v" || e.key === "V") {
        e.preventDefault()
        void toggleVerify(focusedReview)
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault()
        setEditReview(focusedReview)
        setEditOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [focusedReview, editOpen, deleteTarget, bulkDeleteOpen, toggleVerify])

  function updateReviewInList(updated: AdminReview) {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  function removeReviewsFromList(ids: string[]) {
    const idSet = new Set(ids)
    setReviews((prev) => prev.filter((r) => !idSet.has(r.id)))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
    if (focusedId && idSet.has(focusedId)) setFocusedId(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, {
      method: "DELETE",
    })
    const data = await res.json()
    if (!res.ok) {
      toast({
        title: "Delete failed",
        description: data.error,
        variant: "destructive",
      })
      return
    }
    removeReviewsFromList([deleteTarget.id])
    setDeleteTarget(null)
    toast({ title: "Review deleted" })
  }

  async function confirmBulkDelete() {
    const ids = [...selectedIds]
    const res = await fetch("/api/admin/reviews/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({
        title: "Bulk delete failed",
        description: data.error,
        variant: "destructive",
      })
      return
    }
    removeReviewsFromList(ids)
    setBulkDeleteOpen(false)
    toast({ title: `${ids.length} reviews deleted` })
    void loadReviews()
  }

  const allSelected =
    reviews.length > 0 && reviews.every((r) => selectedIds.has(r.id))

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(reviews.map((r) => r.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-medium">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all chair reviews. Shortcuts on focused card: E edit, V
            verify, Delete remove.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/reviews/new">Add Review</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Reviews", value: stats.total },
          { label: "Verified", value: stats.verified },
          { label: "Unverified", value: stats.unverified },
          { label: "Today Added", value: stats.todayAdded },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {card.label}
            </p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search summary text…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {SOURCE_OPTIONS.map((opt) => {
            const active = source === opt.value
            const isAll = opt.value === "all"
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSource(opt.value)
                  setPagination((p) => ({ ...p, page: 1 }))
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  isAll
                    ? active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted text-foreground border-border hover:bg-muted/80"
                    : cn(
                        getSourceBadgeClass(opt.value as ReviewSource),
                        active && "ring-2 ring-offset-1 ring-foreground/25"
                      )
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Select
            value={productId}
            onValueChange={(v) => {
              setProductId(v)
              setPagination((p) => ({ ...p, page: 1 }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={verified}
            onValueChange={(v) => {
              setVerified(v)
              setPagination((p) => ({ ...p, page: 1 }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v)
              setPagination((p) => ({ ...p, page: 1 }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Newest first</SelectItem>
              <SelectItem value="score">Highest rated</SelectItem>
              <SelectItem value="product">Product name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(v) => toggleSelectAll(v === true)}
            aria-label="Select all on page"
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.size} review{selectedIds.size === 1 ? "" : "s"}{" "}
              selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground py-12 text-center">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <AdminReviewCard
              key={review.id}
              review={review}
              selected={selectedIds.has(review.id)}
              focused={focusedId === review.id}
              onSelect={toggleSelect}
              onFocus={setFocusedId}
              onEdit={(r) => {
                setEditReview(r)
                setEditOpen(true)
              }}
              onVerify={(r) => void toggleVerify(r)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((p) => ({ ...p, page: p.page - 1 }))
            }
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((p) => ({ ...p, page: p.page + 1 }))
            }
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <AdminReviewEditDialog
        review={editReview}
        products={products}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated) => {
          updateReviewInList(updated)
          toast({ title: "Review updated" })
        }}
        onError={(msg) =>
          toast({ title: "Save failed", description: msg, variant: "destructive" })
        }
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this review? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} reviews?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selectedIds.size} reviews? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmBulkDelete()}
            >
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
