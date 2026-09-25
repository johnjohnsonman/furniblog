/** One jump-menu target on the product page. Always server-rendered, never hidden. */
export function ProductSection({ id, eyebrow, title, children }: { id: string; eyebrow: string; title?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={title ? `${id}-title` : undefined} className="mt-12 scroll-mt-36 border-t border-[#171717] pt-8">
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">{eyebrow}</p>
      {title && <h2 id={`${id}-title`} className="mt-1 font-serif text-3xl">{title}</h2>}
      <div className={title ? "mt-5" : "mt-3"}>{children}</div>
    </section>
  )
}
