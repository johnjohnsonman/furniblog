import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"
config({ path: ".env.local" })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const YT_KEY = process.env.YOUTUBE_API_KEY

// guard: column must exist (migration 038)
{
  const { error } = await sb.from("reviews").select("country").limit(1)
  if (error) {
    console.error("reviews.country column missing — run migration 038 first.\n", error.message)
    process.exit(1)
  }
}

// ---------- Tier 1: deterministic by source ----------
const SOURCE_COUNTRY = {
  naver: "KR", dcinside: "KR",
  japan_community: "JP",
  reddit: "US", hackernews: "US", review_sites: "US", community: "US",
}
for (const [source, country] of Object.entries(SOURCE_COUNTRY)) {
  const { error, count } = await sb.from("reviews")
    .update({ country }, { count: "exact" })
    .eq("source", source)
  if (error) console.error("tier1 err", source, error.message)
  else console.log(`tier1: ${source} -> ${country} (${count})`)
}

// ---------- Tier 2: YouTube via channel country / video language ----------
const LANG_COUNTRY = { en: "US", ko: "KR", ja: "JP", de: "DE", fr: "FR", es: "ES", it: "IT", pt: "PT", zh: "CN", hi: "IN", ru: "RU", nl: "NL", sv: "SE", pl: "PL" }
const langToCountry = (l) => (l ? LANG_COUNTRY[String(l).toLowerCase().split("-")[0]] ?? null : null)
const vidId = (url) => {
  if (!url) return null
  let m = /[?&]v=([\w-]{11})/.exec(url); if (m) return m[1]
  m = /youtu\.be\/([\w-]{11})/.exec(url); if (m) return m[1]
  m = /\/(embed|shorts)\/([\w-]{11})/.exec(url); if (m) return m[2]
  return null
}
const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o }

const { data: yts } = await sb.from("reviews").select("id, source_url").eq("source", "youtube")
console.log(`\nyoutube reviews: ${yts?.length ?? 0}`)
if (!YT_KEY) console.warn("YOUTUBE_API_KEY missing — youtube rows will fall back to US by language.")

// map review -> videoId
const rows = (yts ?? []).map((r) => ({ id: r.id, vid: vidId(r.source_url) }))
const vids = [...new Set(rows.map((r) => r.vid).filter(Boolean))]

// videos.list -> channelId + language
const vidInfo = {} // vid -> { channelId, lang }
const chanIds = new Set()
if (YT_KEY) {
  for (const c of chunk(vids, 50)) {
    const u = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${c.join(",")}&key=${YT_KEY}`
    const res = await fetch(u)
    const j = await res.json()
    if (j.error) { console.error("videos.list err", j.error.message); break }
    for (const it of j.items ?? []) {
      const lang = it.snippet?.defaultAudioLanguage || it.snippet?.defaultLanguage || null
      vidInfo[it.id] = { channelId: it.snippet?.channelId ?? null, lang }
      if (it.snippet?.channelId) chanIds.add(it.snippet.channelId)
    }
  }
}
// channels.list -> country
const chanCountry = {}
if (YT_KEY && chanIds.size) {
  for (const c of chunk([...chanIds], 50)) {
    const u = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${c.join(",")}&key=${YT_KEY}`
    const res = await fetch(u)
    const j = await res.json()
    if (j.error) { console.error("channels.list err", j.error.message); break }
    for (const it of j.items ?? []) chanCountry[it.id] = it.snippet?.country ?? null
  }
}

let byChannel = 0, byLang = 0, byDefault = 0
const tally = {}
for (const r of rows) {
  let country = null
  const info = r.vid ? vidInfo[r.vid] : null
  if (info?.channelId && chanCountry[info.channelId]) { country = chanCountry[info.channelId]; byChannel++ }
  else if (info?.lang && langToCountry(info.lang)) { country = langToCountry(info.lang); byLang++ }
  else { country = "US"; byDefault++ } // language unknown -> default English -> US
  tally[country] = (tally[country] ?? 0) + 1
  const { error } = await sb.from("reviews").update({ country }).eq("id", r.id)
  if (error) console.error("yt update err", r.id, error.message)
}
console.log(`\nyoutube resolved: channel=${byChannel}, language=${byLang}, default(US)=${byDefault}`)
console.log("youtube country tally:", tally)

// ---------- final distribution ----------
const { data: all } = await sb.from("reviews").select("country")
const dist = {}
for (const r of all) dist[r.country ?? "NULL"] = (dist[r.country ?? "NULL"] ?? 0) + 1
console.log("\n=== FINAL country distribution ===")
console.log(dist)
