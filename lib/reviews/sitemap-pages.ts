type Row = { id: string; created_at: string | null }
type Result = { data: Row[] | null; error: { message: string } | null }

// Keyset pagination avoids REST row caps and offset shifts during collection.
export async function loadReviewSitemapPages(
  fetchPage: (after: string | null, size: number) => PromiseLike<Result>
): Promise<Row[]> {
  const rows: Row[] = []
  let after: string | null = null
  for (let page = 0; page < 100; page++) {
    const result = await fetchPage(after, 500)
    if (result.error) throw new Error(result.error.message)
    if (!result.data) throw new Error("Missing review sitemap data")
    if (!result.data.length) return rows
    for (const row of result.data) {
      if (after !== null && row.id <= after) throw new Error("Review sitemap cursor did not advance")
      rows.push(row)
      after = row.id
    }
  }
  throw new Error("Review sitemap requires splitting before exceeding URL limit")
}
