export function isChairpediaPreview(
  environment: { VERCEL_ENV?: string; CHAIRPEDIA_PREVIEW?: string } = process.env as {
    VERCEL_ENV?: string
    CHAIRPEDIA_PREVIEW?: string
  }
): boolean {
  return environment.VERCEL_ENV === "preview" || environment.CHAIRPEDIA_PREVIEW === "true"
}

export function comparisonPublicationMetadata(slug: string, preview: boolean) {
  return {
    alternates: preview ? undefined : { canonical: `/compare/${slug}` },
    robots: preview ? { index: false as const, follow: false as const, nocache: true } : undefined,
    openGraphUrl: preview ? undefined : `/compare/${slug}`,
  }
}
