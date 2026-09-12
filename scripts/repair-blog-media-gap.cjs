const assert = require("node:assert/strict")
const { mkdirSync, writeFileSync } = require("node:fs")
const { resolve } = require("node:path")
const { load } = require("cheerio")

require("dotenv").config({ path: resolve(__dirname, "../.env.local"), quiet: true })

const { createClient } = require("@supabase/supabase-js")

const targetSlug = "kokuyo-ing-cloud-eight-years-of-engineering-zero-gravity-focus"
const sourceSlug = "kokuyo-ing-cloud-review-the-zero-gravity-office-chair-born-from-eight-years-of-e"

function restoreInlineImages(targetHtml, sourceHtml) {
  const target = load(targetHtml || "", null, false)
  const source = load(sourceHtml || "", null, false)
  const sourceImages = source("img").toArray().slice(0, 5)
  const headings = target("h2").toArray()

  assert.equal(target("img").length, 0, "Target already has inline images")
  assert.ok(headings.length >= 7, "Target section structure changed")
  assert.equal(sourceImages.length, 5, "Source does not have enough images")

  const originalText = target.text()
  const originalLinks = target("a").toArray().map((node) => target(node).attr("href"))

  sourceImages.forEach((node, index) => {
    const src = source(node).attr("src")
    assert.ok(src, `Source image ${index + 1} has no URL`)
    target(headings[index + 2]).before(
      `<figure class="blog-inline-media"><img src="${src}" alt="" loading="lazy" decoding="async"></figure>`,
    )
  })

  assert.equal(target.text(), originalText, "Article text changed")
  assert.deepEqual(
    target("a").toArray().map((node) => target(node).attr("href")),
    originalLinks,
    "Article links changed",
  )
  assert.equal(target("img").length, 5)
  return target.html()
}

async function main() {
  const apply = process.argv.includes("--apply")
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .in("slug", [targetSlug, sourceSlug])
    .eq("status", "published")
  if (error) throw error

  const target = data.find((row) => row.slug === targetSlug)
  const source = data.find((row) => row.slug === sourceSlug)
  assert.ok(target && source, "Target or source post is missing")

  const contentHtml = restoreInlineImages(target.content_html, source.content_html)
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", targetSlug, sourceSlug, images: 5 }))
  if (!apply) return

  const backupDir = resolve(__dirname, "backups")
  mkdirSync(backupDir, { recursive: true })
  const backupPath = resolve(backupDir, `blog-media-${targetSlug}-${Date.now()}.json`)
  writeFileSync(backupPath, JSON.stringify(target, null, 2), { flag: "wx" })

  const result = await client
    .from("blog_posts")
    .update({ content_html: contentHtml, updated_at: new Date().toISOString() })
    .eq("id", target.id)
    .eq("updated_at", target.updated_at)
    .eq("content_html", target.content_html)
    .select("*")
    .single()
  if (result.error) throw result.error

  for (const key of Object.keys(target)) {
    if (key === "updated_at") continue
    assert.deepEqual(
      result.data[key],
      key === "content_html" ? contentHtml : target[key],
      `Unexpected change: ${key}`,
    )
  }
  console.log(`Backup: ${backupPath}`)
  console.log("PASS: restored five existing Ing Cloud images without changing article text or links.")
}

module.exports = { restoreInlineImages }

if (require.main === module) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
