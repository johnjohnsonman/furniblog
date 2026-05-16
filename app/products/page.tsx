"use client"

import { Suspense, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Filter, X, ChevronDown, LayoutGrid, List, TableIcon, Search, Star, ExternalLink, MapPin } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products, categories, countries, priceRanges, brands, chairTypes, ratingRanges, designers, getAverageScore } from "@/lib/data"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list" | "table"

function ProductsPageFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading products...</p>
      </main>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageContent />
    </Suspense>
  )
}

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "All"
  const initialSearch = searchParams.get("search") || ""
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedCountry, setSelectedCountry] = useState("All")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [selectedChairType, setSelectedChairType] = useState("All")
  const [selectedRating, setSelectedRating] = useState("all")
  const [selectedDesigner, setSelectedDesigner] = useState("All")
  const [sortBy, setSortBy] = useState("rating")
  const [showFilters, setShowFilters] = useState(false)
  const [compareList, setCompareList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const filteredProducts = useMemo(() => {
    let filtered = products

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.designer?.toLowerCase().includes(query) ||
          p.country.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (selectedCountry !== "All") {
      filtered = filtered.filter((p) => p.country === selectedCountry)
    }

    if (selectedPrice !== "all") {
      filtered = filtered.filter((p) => p.priceRange === selectedPrice)
    }

    if (selectedBrand !== "All") {
      filtered = filtered.filter((p) => p.brandId === selectedBrand)
    }

    if (selectedChairType !== "All") {
      filtered = filtered.filter((p) => p.chairType === selectedChairType)
    }

    if (selectedRating !== "all") {
      const minRating = parseFloat(selectedRating)
      filtered = filtered.filter((p) => p.rating >= minRating)
    }

    if (selectedDesigner !== "All") {
      filtered = filtered.filter((p) => p.designerId === selectedDesigner)
    }

    switch (sortBy) {
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating)
        break
      case "price-low":
        const priceOrder = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
        filtered = [...filtered].sort(
          (a, b) => priceOrder[a.priceRange] - priceOrder[b.priceRange]
        )
        break
      case "price-high":
        const priceOrderHigh = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
        filtered = [...filtered].sort(
          (a, b) => priceOrderHigh[b.priceRange] - priceOrderHigh[a.priceRange]
        )
        break
      case "reviews":
        filtered = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [selectedCategory, selectedCountry, selectedPrice, selectedBrand, selectedChairType, selectedRating, selectedDesigner, sortBy, searchQuery])

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    )
  }

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedCountry !== "All",
    selectedPrice !== "all",
    selectedBrand !== "All",
    selectedChairType !== "All",
    selectedRating !== "all",
    selectedDesigner !== "All",
  ].filter(Boolean).length

  const clearFilters = () => {
    setSelectedCategory("All")
    setSelectedCountry("All")
    setSelectedPrice("all")
    setSelectedBrand("All")
    setSelectedChairType("All")
    setSelectedRating("all")
    setSelectedDesigner("All")
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header with Search */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-serif text-3xl font-medium text-foreground">
                  Products
                </h1>
                <p className="mt-1 text-muted-foreground">
                  {filteredProducts.length} products
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, designers..."
                  className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  showFilters || activeFilterCount > 0
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/30"
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "bg-foreground text-background" : "hover:bg-muted"
                  )}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list" ? "bg-foreground text-background" : "hover:bg-muted"
                  )}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "table" ? "bg-foreground text-background" : "hover:bg-muted"
                  )}
                  title="Table view"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-5 bg-card rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                <FilterSelect
                  label="Category"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories.map(c => ({ label: c, value: c }))}
                />
                <FilterSelect
                  label="Brand"
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  options={[{ label: "All Brands", value: "All" }, ...brands.map(b => ({ label: b.name, value: b.id }))]}
                />
                <FilterSelect
                  label="Country"
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  options={countries.map(c => ({ label: c, value: c }))}
                />
                <FilterSelect
                  label="Chair Type"
                  value={selectedChairType}
                  onChange={setSelectedChairType}
                  options={chairTypes.map(c => ({ label: c, value: c }))}
                />
                <FilterSelect
                  label="Price"
                  value={selectedPrice}
                  onChange={setSelectedPrice}
                  options={priceRanges}
                />
                <FilterSelect
                  label="Rating"
                  value={selectedRating}
                  onChange={setSelectedRating}
                  options={ratingRanges}
                />
                <FilterSelect
                  label="Designer"
                  value={selectedDesigner}
                  onChange={setSelectedDesigner}
                  options={[{ label: "All Designers", value: "All" }, ...designers.map(d => ({ label: d.name, value: d.id }))]}
                />
              </div>
            </div>
          )}

          {/* Compare Bar */}
          {compareList.length > 0 && (
            <div className="mb-6 p-4 bg-foreground text-background rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {compareList.length} selected
                </span>
                <button
                  onClick={() => setCompareList([])}
                  className="text-background/70 hover:text-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Link
                href={`/compare?products=${compareList.join(",")}`}
                className="px-4 py-2 bg-background text-foreground rounded-lg text-sm font-medium hover:bg-background/90 transition-colors"
              >
                Compare Now
              </Link>
            </div>
          )}

          {/* Product Views */}
          {filteredProducts.length > 0 ? (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const score = getAverageScore(product)
                    return (
                      <div key={product.id} className="bg-card rounded-lg border border-border overflow-hidden hover:border-foreground/20 transition-all">
                        <Link href={`/products/${product.id}`}>
                          <div className="aspect-square relative bg-muted">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                            {product.availableInKorea && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-foreground text-background text-xs rounded">
                                KR
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                          <Link href={`/products/${product.id}`}>
                            <h3 className="font-medium text-foreground text-sm mt-0.5 hover:text-muted-foreground transition-colors truncate">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-foreground text-foreground" />
                                <span className="text-sm font-medium">{product.rating}</span>
                              </div>
                              {score && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{score}</span>}
                            </div>
                            <span className="font-medium text-sm">{product.price}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">{product.bestFor || product.country}</span>
                            <button
                              onClick={() => toggleCompare(product.id)}
                              className={cn(
                                "text-xs px-2 py-1 rounded transition-colors",
                                compareList.includes(product.id)
                                  ? "bg-foreground text-background"
                                  : "bg-muted hover:bg-muted/80"
                              )}
                            >
                              {compareList.includes(product.id) ? "Added" : "+ Compare"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-card hover:bg-muted/30 transition-colors">
                      <Link href={`/products/${product.id}`} className="shrink-0">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${product.id}`}>
                            <h3 className="font-medium text-foreground hover:text-muted-foreground transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          {product.availableInKorea && (
                            <span className="px-1.5 py-0.5 bg-muted text-xs rounded">KR</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} · {product.category} · {product.country}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center hidden sm:block">
                          <p className="font-semibold">{product.rating}</p>
                          <p className="text-xs text-muted-foreground">{product.reviewCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{product.price}</p>
                        </div>
                        <button
                          onClick={() => toggleCompare(product.id)}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded transition-colors",
                            compareList.includes(product.id)
                              ? "bg-foreground text-background"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          {compareList.includes(product.id) ? "Added" : "Compare"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table View */}
              {viewMode === "table" && (
                <div className="border border-border rounded-lg overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="bg-card hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <Link href={`/products/${product.id}`} className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded overflow-hidden bg-muted shrink-0">
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                              </div>
                              <span className="font-medium text-foreground hover:text-muted-foreground transition-colors">
                                {product.name}
                              </span>
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{product.brand}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{product.chairType || product.category}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{product.country}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold">{product.rating}</span>
                            <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{product.price}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => toggleCompare(product.id)}
                              className={cn(
                                "text-xs px-2 py-1 rounded transition-colors",
                                compareList.includes(product.id)
                                  ? "bg-foreground text-background"
                                  : "bg-muted hover:bg-muted/80"
                              )}
                            >
                              {compareList.includes(product.id) ? "Added" : "Compare"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found matching your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function FilterSelect({ 
  label, 
  value, 
  onChange, 
  options 
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
