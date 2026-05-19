export type BrowserCollectItem = {
  url: string
  title: string
  body: string
  source: "reddit" | "youtube" | "dcinside" | "japan_community" | "naver"
  collectedAt: string
}

export function getKoreanName(chairName: string): string {
  const lower = chairName.toLowerCase()
  const map: Record<string, string> = {
    "herman miller aeron": "허먼밀러 에어론",
    "herman miller embody": "허먼밀러 엠바디",
    "herman miller cosm": "허먼밀러 코즘",
    "herman miller sayl": "허먼밀러 세일",
    "steelcase leap": "스틸케이스 립체어",
    "steelcase gesture": "스틸케이스 제스처",
    "steelcase think": "스틸케이스 씽크",
    "okamura contessa": "오카무라 콘테사",
    "okamura sylphy": "오카무라 실피",
    "humanscale freedom": "휴먼스케일 프리덤",
    "haworth fern": "하워스 펀체어",
    "hag capisco": "HÅG 카피스코",
    "kokuyo ing": "코쿠요 잉",
    "itoki act2": "이토키 ACT2",
    "itoki leala": "이토키 리알라",
    interstuhl: "인터스툴",
    wilkhahn: "빌칸",
    sidiz: "시디즈",
  }
  for (const [en, ko] of Object.entries(map)) {
    if (lower.includes(en)) return ko
  }
  return chairName
}

export function getJapaneseName(chairName: string): string {
  const lower = chairName.toLowerCase()
  const map: Record<string, string> = {
    "herman miller": "ハーマンミラー",
    steelcase: "スチールケース",
    okamura: "オカムラ",
    humanscale: "ヒューマンスケール",
    haworth: "ハワース",
    kokuyo: "コクヨ",
    itoki: "イトーキ",
    hag: "ホーグ",
    vitra: "ヴィトラ",
    knoll: "ノル",
  }
  for (const [en, ja] of Object.entries(map)) {
    if (lower.includes(en)) return ja
  }
  return chairName
}

type RedditSearchPost = {
  url: string
  title: string
  body: string
  permalink: string
}

function parseRedditSearchJson(json: unknown): RedditSearchPost[] {
  const listing = json as {
    data?: { children?: Array<{ data?: Record<string, unknown> }> }
  }
  const children = listing?.data?.children ?? []
  const posts: RedditSearchPost[] = []

  for (const child of children) {
    const p = child.data
    if (!p) continue

    const permalink = String(p.permalink ?? "")
    const title = String(p.title ?? "")
    const selftext = String(p.selftext ?? "")
    const body = `${title}\n\n${selftext}`.trim()

    if (!permalink || body.length < 10) continue

    const postUrl = permalink.startsWith("/")
      ? `https://reddit.com${permalink}`
      : `https://reddit.com/${permalink}`

    posts.push({
      url: postUrl,
      title,
      body,
      permalink,
    })
  }

  return posts
}

async function fetchRedditSearchBrowser(
  searchTerm: string,
  options?: { subreddit?: string; limit?: number }
): Promise<RedditSearchPost[]> {
  const q = encodeURIComponent(`${searchTerm} review`)
  const limit = options?.limit ?? 10
  const subreddit = options?.subreddit

  const urls = subreddit
    ? [
        `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${q}&sort=relevance&limit=${limit}&restrict_sr=1&t=all`,
        `https://old.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${q}&sort=relevance&limit=${limit}&restrict_sr=1`,
      ]
    : [
        `https://www.reddit.com/search.json?q=${q}&sort=relevance&t=all&limit=${limit}`,
        `https://old.reddit.com/search.json?q=${q}&sort=relevance&limit=${limit}`,
      ]

  const fetchOpts: RequestInit = {
    mode: "cors",
    headers: { Accept: "application/json" },
  }

  for (const url of urls) {
    try {
      const res = await fetch(url, fetchOpts)
      if (!res.ok) continue

      const json = await res.json()
      const posts = parseRedditSearchJson(json)
      console.log("[Reddit Browser] status:", res.status, "items:", posts.length)
      return posts
    } catch (error) {
      console.log("[Reddit Browser] error:", error)
    }
  }

  return []
}

function mergeRedditPosts(
  posts: RedditSearchPost[],
  source: BrowserCollectItem["source"],
  minBodyLength: number,
  seen: Set<string>,
  results: BrowserCollectItem[]
) {
  for (const post of posts) {
    if (post.body.length < minBodyLength || seen.has(post.permalink)) continue
    seen.add(post.permalink)
    results.push({
      url: post.url,
      title: post.title,
      body: post.body,
      source,
      collectedAt: new Date().toISOString(),
    })
  }
}

export function getAliases(chairName: string): string[] {
  const lower = chairName.toLowerCase()
  const map: Record<string, string[]> = {
    aeron: ["Aeron Chair", "Herman Miller Aeron"],
    embody: ["Embody Chair", "HM Embody"],
    leap: ["Leap Chair", "Leap V2", "Steelcase Leap"],
    gesture: ["Gesture Chair", "SC Gesture"],
    contessa: ["Contessa II", "Contessa 2", "オカムラ コンテッサ"],
    capisco: ["Capisco Chair", "HAG Capisco"],
    ing: ["Kokuyo Ing", "コクヨ イング"],
    freedom: ["Freedom Chair", "Humanscale Freedom"],
    fern: ["Fern Chair", "Haworth Fern"],
  }
  for (const [key, aliases] of Object.entries(map)) {
    if (lower.includes(key)) return aliases
  }
  return []
}

export async function browserCollectReddit(
  chairName: string,
  aliases: string[]
): Promise<BrowserCollectItem[]> {
  const results: BrowserCollectItem[] = []
  const seen = new Set<string>()
  const queries = [chairName, ...aliases].slice(0, 3)

  for (const query of queries) {
    const posts = await fetchRedditSearchBrowser(query)
    mergeRedditPosts(posts, "reddit", 50, seen, results)
    await new Promise((r) => setTimeout(r, 800))
  }

  return results
}

export async function browserCollectDCInside(
  chairName: string,
  koName: string
): Promise<BrowserCollectItem[]> {
  // DC Inside blocks browser CORS — collected on server via Naver webdoc API
  void chairName
  void koName
  return []
}

export async function browserCollectJapan(
  chairName: string,
  jaName: string
): Promise<BrowserCollectItem[]> {
  const results: BrowserCollectItem[] = []
  const seen = new Set<string>()

  const jpSubreddits = ["japanlife", "digitalnomad"]
  for (const sub of jpSubreddits) {
    const posts = await fetchRedditSearchBrowser(`${chairName} chair`, {
      subreddit: sub,
      limit: 5,
    })
    mergeRedditPosts(posts, "japan_community", 30, seen, results)
    await new Promise((r) => setTimeout(r, 800))
  }

  const officeChairPosts = await fetchRedditSearchBrowser(jaName, {
    subreddit: "officechairs",
    limit: 5,
  })
  mergeRedditPosts(officeChairPosts, "japan_community", 30, seen, results)

  return results
}
