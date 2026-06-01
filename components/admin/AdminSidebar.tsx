"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Armchair,
  Star,
  Link2,
  Building2,
  BarChart3,
  Settings2,
  LogOut,
  Images,
  MessageSquareHeart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Armchair },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/experience", label: "체험 후기", icon: MessageSquareHeart },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/pipeline", label: "Pipeline", icon: Settings2 },
  { href: "/admin/affiliate", label: "Affiliate Links", icon: Link2 },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [reviewCount, setReviewCount] = useState<number | null>(null)

  useEffect(() => {
    void fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.totalReviews === "number") {
          setReviewCount(d.totalReviews)
        }
      })
      .catch(() => {})
  }, [])

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 bg-[#111111] text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="font-serif text-lg font-medium">
          Furniblog Admin
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const displayLabel =
            href === "/admin/reviews" && reviewCount != null
              ? `${label} (${reviewCount})`
              : label

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === href ||
                  (href !== "/admin" && pathname.startsWith(href))
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {displayLabel}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  )
}

