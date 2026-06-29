import { ImageResponse } from "next/og"

// Default social-share card for the whole site (pages without their own OG
// image inherit this). Twitter falls back to og:image when no twitter-image.
export const runtime = "edge"
export const alt = "Furniblog — Premium Chair Reviews, Specs & Comparisons"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#14110E",
          color: "#F5F3EF",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 8, color: "#B79B6E", textTransform: "uppercase" }}>
          Furniblog
        </div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05, marginTop: 28 }}>
          Premium Chair Reviews,
        </div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>
          Specs &amp; Comparisons
        </div>
        <div style={{ fontSize: 30, color: "#C9C3B8", marginTop: 36, maxWidth: 900 }}>
          Real specs, global reviews, videos and news for office, ergonomic and design chairs — updated daily.
        </div>
      </div>
    ),
    { ...size }
  )
}
