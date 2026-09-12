const { resolve } = require("node:path")
const { load } = require("cheerio")

require("dotenv").config({ path: resolve(__dirname, "../.env.local"), quiet: true })

const { createClient } = require("@supabase/supabase-js")

async function fetchPublishedPosts(client) {
  const posts = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client
      .from("blog_posts")
      .select("id,slug,title,status,hero_image_url,content_html,updated_at")
      .eq("status", "published")
      .range(from, from + 999)

    if (error) throw error
    posts.push(...data)
    if (data.length < 1000) return posts
  }
}

function inspect(post) {
  const $ = load(post.content_html || "", null, false)
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    hero: Boolean(post.hero_image_url),
    images: $("img").length,
    figures: $("figure").length,
    words: $.text().trim().split(/\s+/).filter(Boolean).length,
    updatedAt: post.updated_at,
  }
}

function mediaDetails(post) {
  const $ = load(post.content_html || "", null, false)
  return {
    slug: post.slug,
    title: post.title,
    heroImageUrl: post.hero_image_url,
    headings: $("h2").toArray().map((node) => $(node).text().trim()),
    images: $("img").toArray().map((node) => ({
      src: $(node).attr("src") || "",
      alt: $(node).attr("alt") || "",
    })).filter((image) => image.src),
  }
}

async function main() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
  const posts = await fetchPublishedPosts(client)
  const rows = posts.map(inspect)
  const longNoInline = rows
    .filter((row) => row.words >= 800 && row.images === 0)
    .sort((a, b) => b.words - a.words)

  console.log(JSON.stringify({
    summary: {
      published: rows.length,
      noHero: rows.filter((row) => !row.hero).length,
      noInline: rows.filter((row) => row.images === 0).length,
      longNoInline: longNoInline.length,
      withTwoOrMoreInline: rows.filter((row) => row.images >= 2).length,
    },
    target: rows.filter((row) => /Kokuyo Ing Cloud|Zero-Gravity/i.test(row.title)),
    targetMedia: posts
      .filter((post) => /Kokuyo Ing Cloud|Zero-Gravity/i.test(post.title))
      .map(mediaDetails),
    longNoInline: longNoInline.slice(0, 40),
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
