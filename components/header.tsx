"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Products", href: "/products" },
  { name: "Brands", href: "/brands" },
  { name: "Designers", href: "/designers" },
  { name: "Compare", href: "/compare" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 h-14">
        <Link href="/" className="font-serif text-lg font-medium tracking-tight text-foreground">
          Furniblog
        </Link>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="p-2 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/products"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-foreground/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm border-l border-border">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="font-serif text-lg font-medium tracking-tight">Furniblog</span>
              </Link>
              <button
                type="button"
                className="p-2 text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block py-3 text-base transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
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
      )}
    </header>
  )
}
