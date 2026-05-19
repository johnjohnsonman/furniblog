"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Search } from "lucide-react"
import type { Brand } from "@/types/brand"
import {
  COUNTRY_MAP,
  getBrandLogoInitials,
  getCountryDisplayLabel,
  getCountryFilterPills,
} from "@/lib/brand-assets"
import { cn } from "@/lib/utils"

type BrandsPageClientProps = {
  brands: Brand[]
  initialSearch?: string
  initialCountry?: string
}

function buildBrandsQuery(search: string, country: string): string {
  const params = new URLSearchParams()
  if (search.trim()) params.set("search", search.trim())
  if (country !== "all") params.set("country", country)
  const qs = params.toString()
  return qs ? `/brands?${qs}` : "/brands"
}

function matchesCountry(brand: Brand, countryFilter: string): boolean {
  if (countryFilter === "all") return true
  return (brand.country?.trim().toUpperCase() ?? "") === countryFilter.toUpperCase()
}

export function BrandsPageClient({
  brands,
  initialSearch = "",
  initialCountry = "all",
}: BrandsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(
    () => searchParams.get("search") ?? initialSearch
  )
  const [countryFilter, setCountryFilter] = useState(
    () => searchParams.get("country") ?? initialCountry
  )

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const countryFilters = useMemo(() => getCountryFilterPills(brands), [brands])

  const updateUrl = useCallback(
    (next: { search?: string; country?: string }) => {
      const nextSearch = next.search ?? search
      const nextCountry = next.country ?? countryFilter
      router.replace(buildBrandsQuery(nextSearch, nextCountry), { scroll: false })
    },
    [router, search, countryFilter]
  )

  useEffect(() => {
    const fromUrl = searchParams.get("search") ?? ""
    const fromUrlCountry = searchParams.get("country") ?? "all"
    setSearch(fromUrl)
    setCountryFilter(fromUrlCountry)
  }, [searchParams])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateUrl({ search: value })
    }, 300)
  }

  const handleCountryChange = (value: string) => {
    setCountryFilter(value)
    updateUrl({ country: value })
  }

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase()

    return brands.filter((brand) => {
      const countryMeta = brand.country
        ? COUNTRY_MAP[brand.country.trim().toUpperCase()]
        : undefined

      const matchesSearch =
        !query ||
        brand.name.toLowerCase().includes(query) ||
        brand.country?.toLowerCase().includes(query) ||
        countryMeta?.name.toLowerCase().includes(query) ||
        brand.description?.toLowerCase().includes(query) ||
        brand.descriptionLong?.toLowerCase().includes(query)

      const matchesCountryFilter = matchesCountry(brand, countryFilter)

      return matchesSearch && matchesCountryFilter
    })
  }, [brands, search, countryFilter])

  const subtitle = search.trim()
    ? `${filteredBrands.length} brand${filteredBrands.length === 1 ? "" : "s"} matching '${search.trim()}'`
    : `${brands.length} premium chair manufacturers`

  const emptyLabel = useMemo(() => {
    if (search.trim()) return search.trim()
    const pill = countryFilters.find((p) => p.value === countryFilter)
    return pill && pill.value !== "all" ? pill.label : "your filters"
  }, [search, countryFilter, countryFilters])

  const clearFilters = () => {
    setSearch("")
    setCountryFilter("all")
    router.replace("/brands", { scroll: false })
  }

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 lg:px-8">
          <div>
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Brands
            </h1>
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          </div>

          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search brands..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              aria-label="Search brands"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {countryFilters.map((pill) => {
              const active = countryFilter === pill.value
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => handleCountryChange(pill.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-foreground hover:border-foreground/30"
                  )}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-foreground/20"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${brand.colorPrimary ?? "#1A1A1A"}, ${brand.colorSecondary ?? "#4A4A4A"})`,
                  }}
                >
                  {getBrandLogoInitials(brand.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium text-foreground">{brand.name}</h2>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {brand.description || `${brand.name} ergonomic chairs`}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{getCountryDisplayLabel(brand.country)}</span>
                    {brand.founded > 0 && (
                      <>
                        <span>•</span>
                        <span>Est. {brand.founded}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      {brand.productCount}{" "}
                      {brand.productCount === 1 ? "chair" : "chairs"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card py-16 text-center">
            <p className="text-muted-foreground">
              No brands found for &apos;{emptyLabel}&apos;
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  )
}
