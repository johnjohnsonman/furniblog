"use client"
import { Analytics } from "@vercel/analytics/next"
export function PrivateAwareAnalytics() {
  return <Analytics beforeSend={event => new URL(event.url).pathname.startsWith("/chair-fit-report/") ? null : event} />
}
