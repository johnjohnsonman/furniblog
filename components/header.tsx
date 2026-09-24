"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CHAIR_CATEGORIES } from "@/lib/chair-categories"

const primary = [
  { name: "Chairs", href: "/products" },
  { name: "Chair Finder", href: "/chair-fit-calculator" },
  { name: "Find Stores", href: "/stores" },
  { name: "Comparisons", href: "/compare" },
  { name: "Guides", href: "/chairpedia" },
]
const resources = [
  { name: "Chair guides", href: "/chairpedia" },
  { name: "Blog", href: "/blog" },
  { name: "Reviews", href: "/reviews" },
  { name: "Videos", href: "/videos" },
  { name: "News", href: "/news" },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => { if (media.matches) setOpen(false) }
    media.addEventListener("change", closeOnDesktop)
    return () => media.removeEventListener("change", closeOnDesktop)
  }, [])
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/") || (href === "/chair-fit-calculator" && pathname === "/chair")
  const linkClass = (href: string) => cn("flex min-h-11 items-center rounded-lg px-4 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2", active(href) ? "bg-muted text-foreground font-semibold" : "text-muted-foreground")
  const chairLinks = [{ name: "All chairs", href: "/products" }, { name: "Brands", href: "/brands" }, ...CHAIR_CATEGORIES.map(cat => ({ name: cat.navLabel, href: `/products?category=${cat.id}` }))]
  const dropdown = (name: string, links: typeof resources, selected: boolean) => (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2", selected ? "bg-muted font-semibold" : "text-muted-foreground")}>
        {name}<ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={10} className="z-[110] w-60 rounded-xl p-2">
        {links.map(item => <DropdownMenuItem key={item.href} asChild><Link className="min-h-11" href={item.href}>{item.name}</Link></DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
  return (
    <header data-site-header className="sticky top-0 z-[60] shrink-0 border-b border-border bg-background text-foreground">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 lg:h-[72px] lg:px-4">
        <Link href="/" className="font-serif text-xl font-medium tracking-tight">Chairpedia</Link>
        <div className="hidden items-center gap-1 lg:flex">
          {dropdown("Chairs", chairLinks, active("/products") || active("/brands"))}
          {primary.slice(1,4).map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={linkClass(item.href)}>{item.name}</Link>)}
          {dropdown("Guides", resources, resources.some(item => active(item.href)))}
          <Link href="/products" aria-label="Search chairs" className="ml-2 flex size-11 items-center justify-center rounded-full border border-border hover:bg-muted"><Search className="size-4" /></Link>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="flex size-11 items-center justify-center rounded-lg hover:bg-muted lg:hidden" aria-label="Open menu"><Menu className="size-5" /></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/30" />
            <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 right-0 z-[110] w-full overflow-y-auto bg-background px-5 pb-8 text-foreground shadow-xl sm:max-w-sm">
              <div className="flex h-16 items-center justify-between border-b border-border">
                <Dialog.Title className="font-serif text-xl font-medium">Chairpedia</Dialog.Title>
                <Dialog.Close aria-label="Close menu" className="flex size-11 items-center justify-center rounded-lg hover:bg-muted"><X className="size-5" /></Dialog.Close>
              </div>
              <nav aria-label="Mobile navigation" className="mt-5 space-y-1">
                {primary.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item.href) ? "page" : undefined} className={cn(linkClass(item.href), "min-h-12 text-base")}>{item.name}</Link>)}
              </nav>
              <div className="mt-6 border-t border-border pt-4">
                {[{ name: "Browse chairs", links: chairLinks }, { name: "Read & watch", links: resources }].map(group => <details key={group.name} className="border-b border-border py-1">
                  <summary className="cursor-pointer py-3 text-sm font-medium">{group.name}</summary>
                  <div className="pb-3">{group.links.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center px-3 text-sm text-muted-foreground hover:text-foreground">{item.name}</Link>)}</div>
                </details>)}
                <Link href="/chair" onClick={() => setOpen(false)} className="mt-4 flex min-h-11 items-center text-sm text-muted-foreground">Prefer to describe what you need? Ask chA.I.r</Link>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  )
}
