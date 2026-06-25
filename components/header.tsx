"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { CHAIR_CATEGORIES } from "@/lib/chair-categories"

const mainNav = [
  { name: "chA.I.r", href: "/chair" },
  { name: "Chairpedia", href: "/chairpedia" },
  { name: "Brands", href: "/brands" },
  { name: "Reviews", href: "/reviews" },
  { name: "News", href: "/news" },
  { name: "Videos", href: "/videos" },
  { name: "Gallery", href: "/gallery" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [totalChairs, setTotalChairs] = useState<number | null>(null)

  // Per-category chair counts for the "Chairs" menu (cached API, loads once).
  useEffect(() => {
    let active = true
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        setCounts(d?.counts ?? {})
        setTotalChairs(typeof d?.total === "number" ? d.total : null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const withCount = (id: string, label: string) =>
    counts?.[id] != null ? `${label} (${counts[id]})` : label
  // Hide categories with zero chairs once counts have loaded.
  const visibleCategories = CHAIR_CATEGORIES.filter(
    (cat) => counts == null || (counts[cat.id] ?? 0) > 0
  )

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 h-14">
        <Link
          href="/"
          className="font-serif text-lg font-medium tracking-tight text-foreground"
        >
          Furniblog
        </Link>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-mr-2 p-3 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {/* Shop by Category */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen((o) => !o)}
              onBlur={() => setTimeout(() => setCategoryOpen(false), 150)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-2 text-sm transition-colors rounded-md hover:bg-muted",
                pathname.startsWith("/products")
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              Chairs
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  categoryOpen && "rotate-180"
                )}
              />
            </button>
            {categoryOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 py-2 bg-card border border-border rounded-lg shadow-lg z-50">
                <Link
                  href="/products"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setCategoryOpen(false)}
                >
                  {totalChairs != null ? `All Chairs (${totalChairs})` : "All Chairs"}
                </Link>
                {visibleCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setCategoryOpen(false)}
                  >
                    <span>{cat.navLabel}</span>
                    {counts?.[cat.id] != null && (
                      <span className="text-xs text-muted-foreground/70">
                        {counts[cat.id]}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {mainNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm transition-colors rounded-md hover:bg-muted",
                isActive(item.href)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}

          <Link
            href="/products"
            className="p-2 ml-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            aria-label="Search chairs"
          >
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-foreground/20"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm border-l border-border">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="font-serif text-lg font-medium tracking-tight">
                  Furniblog
                </span>
              </Link>
              <button
                type="button"
                className="-mr-2 p-3 text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 space-y-1">
              <p className="px-1 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Chairs
              </p>
              <Link
                href="/products"
                className="block py-2.5 text-base text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {totalChairs != null ? `All Chairs (${totalChairs})` : "All Chairs"}
              </Link>
              {visibleCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="block py-2.5 text-base text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {withCount(cat.id, cat.navLabel)}
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-border space-y-1">
                {mainNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block py-3 text-base transition-colors",
                      isActive(item.href)
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
