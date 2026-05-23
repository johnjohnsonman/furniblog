/** Chair-related subreddits for bulk crawl (no per-chair search). */
export const CHAIR_SUBREDDITS = [
  "OfficeChairs",
  "Workspaces",
  "remotework",
  "StandingDesks",
  "ergonomics",
  "HermanMiller",
  "Steelcase",
  "Aeron",
  "gaming",
] as const

export type ChairSubreddit = (typeof CHAIR_SUBREDDITS)[number]
