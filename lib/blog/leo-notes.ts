/**
 * Leo's first-hand notes, keyed by blog slug. Rendered only when `html` is
 * non-empty, so a reserved entry never shows an empty heading.
 */
export const LEO_NOTES: Record<string, { title: string; html: string }> = {
  "kokuyo-ing-cloud-review-the-3-000-chair-that-moves-with-you": { title: "Living with the Ing Cloud", html: "" },
}

export function getLeoNote(slug: string) {
  const note = LEO_NOTES[slug]
  return note && note.html.trim() ? note : null
}
