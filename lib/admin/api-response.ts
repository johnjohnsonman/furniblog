import { NextResponse } from "next/server"

export function jsonInternalError(error: unknown, status = 500) {
  return NextResponse.json(
    {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    },
    { status }
  )
}

export function isMissingTableError(error: {
  code?: string
  message?: string
} | null): boolean {
  if (!error) return false
  if (error.code === "42P01" || error.code === "PGRST205") return true
  const msg = error.message?.toLowerCase() ?? ""
  return msg.includes("does not exist") || msg.includes("schema cache")
}
