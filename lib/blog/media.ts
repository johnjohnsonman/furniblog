import { load } from "cheerio"

export type MediaPost = { content_html: string; hero_image_url: string | null }
export type BlogProductMedia = { slug: string; name: string; images: { url: string; alt?: string | null }[]; chairpediaSlugs?: string[] }

export function usableImageUrl(value: string | null | undefined): string | null {
  const url = value?.trim()
  if (!url) return null
  if (/^\/(?!\/)/.test(url)) return url
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" || parsed.hostname === "images.unsplash.com") return null
    return url
  } catch { return null }
}

function referenceSlug(href: string, section = "products"): string | null {
  try {
    const url = new URL(href, "https://furniblog.com")
    if (!["furniblog.com", "www.furniblog.com"].includes(url.hostname)) return null
    return url.pathname.match(new RegExp(`^/${section}/([a-z0-9-]+)/?$`))?.[1] ?? null
  } catch { return null }
}

export function linkedProductSlugs(html: string): string[] {
  const $ = load(html || "", null, false)
  return [...new Set($("a[href]").toArray().map(node => referenceSlug($(node).attr("href") || "")).filter((slug): slug is string => !!slug))]
}

export function linkedChairpediaSlugs(html: string): string[] {
  const $ = load(html || "", null, false)
  return [...new Set($("a[href]").toArray().map(node => referenceSlug($(node).attr("href") || "", "chairpedia")).filter((slug): slug is string => !!slug))]
}

export function bodyContainsImage(html: string, url: string | null): boolean {
  if (!url) return false
  const $ = load(html || "", null, false)
  const normalize = (src: string) => {
    try { return new URL(src, "https://www.furniblog.com").href } catch { return src }
  }
  return $("img").toArray().some(node => normalize($(node).attr("src") || "") === normalize(url))
}

/** Exact product links only: never infer a model/edition from loose title matches. */
export function enrichBlogMedia<T extends MediaPost>(post: T, products: BlogProductMedia[]): T {
  const $ = load(post.content_html || "", null, false)
  const existing = new Set($("img").toArray().map(node => usableImageUrl($(node).attr("src"))).filter(Boolean))
  let added = 0
  // Keep authored layouts untouched; fill only articles with no usable body images.
  if (existing.size === 0) {
    const seenProducts = new Set<string>()
    const illustratedSections = new Set<unknown>()
    for (const link of $("a[href]").toArray()) {
      const href = $(link).attr("href") || ""
      const slug = referenceSlug(href)
      const guide = referenceSlug(href, "chairpedia")
      const product = products.find(item => item.slug === slug || (!!guide && item.chairpediaSlugs?.includes(guide)))
      const photo = product?.images.find(item => usableImageUrl(item.url) && !existing.has(item.url))
      if (!product || !photo || added >= 3 || seenProducts.has(product.slug)) continue
      // Insert beside the containing block, never inside a link, paragraph or table.
      let block = $(link)
      while (block.parent().length) block = block.parent()
      const section = block.is("h2") ? block[0] : block.prevAll("h2").first()[0] ?? null
      if (illustratedSections.has(section)) continue
      illustratedSections.add(section)
      seenProducts.add(product.slug)
      while (block.next().is("figure.blog-inline-media")) block = block.next()
      const figure = $("<figure></figure>").attr("class", "blog-inline-media")
      figure.append($("<img>").attr({ src: photo.url, alt: photo.alt?.trim() || product.name, loading: "lazy", decoding: "async" }))
      figure.append($("<figcaption></figcaption>").text(product.name))
      block.after(figure)
      existing.add(photo.url)
      added++
    }
  }
  const firstImage = $("img").toArray().map(node => usableImageUrl($(node).attr("src"))).find(Boolean) ?? null
  return { ...post, hero_image_url: usableImageUrl(post.hero_image_url) || firstImage, content_html: added ? $.html() : post.content_html }
}
