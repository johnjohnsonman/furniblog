"use client"

import { useEffect, useRef, useState } from "react"

export type JumpNavItem = { id: string; label: string }

/**
 * Sticky "on this page" menu under the product hero. Every section is already in
 * the server HTML; the menu only scrolls to it and highlights the one in view.
 */
export function ProductJumpNav({ items }: { items: JumpNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id)
  const [top, setTop] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Stick just below the site header, whatever its height at this breakpoint.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]")
    const update = () => setTop(header ? header.getBoundingClientRect().height : 0)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el))
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: `-${(top ?? 64) + 56}px 0px -55% 0px` }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items, top])

  // Keep the active item visible in the horizontally scrolling list on phones.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    const list = listRef.current
    if (!el || !list) return
    const left = el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2
    list.scrollTo({ left, behavior: "smooth" })
  }, [active])

  if (items.length < 2) return null
  return (
    <nav
      aria-label="On this page"
      data-product-jump-nav
      style={{ top: top ?? 64 }}
      className="sticky z-40 -mx-5 mt-6 border-y border-[#171717] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 lg:mx-0 lg:border-x"
    >
      <ul
        ref={listRef}
        className="flex gap-1 overflow-x-auto px-[max(1.25rem,env(safe-area-inset-left))] py-2 [scrollbar-width:none] lg:px-2 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              data-id={item.id}
              aria-current={active === item.id ? "location" : undefined}
              onClick={() => setActive(item.id)}
              className={`inline-flex min-h-10 items-center whitespace-nowrap px-3 text-sm font-semibold transition-colors ${
                active === item.id ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#f5f1e8]"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
