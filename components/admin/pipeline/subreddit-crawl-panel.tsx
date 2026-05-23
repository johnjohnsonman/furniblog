"use client"

import { useCallback, useRef, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchJson } from "@/lib/admin/fetch-json"
import { CHAIR_SUBREDDITS } from "@/lib/pipeline/subreddits"

type CollectStats = {
  new: number
  skipped: number
  classified: number
  noMatch: number
  postsScanned: number
}

const TARGET_PRESETS = [10, 50, 200] as const

export function SubredditCrawlPanel({ disabled }: { disabled?: boolean }) {
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState("")
  const [stats, setStats] = useState<CollectStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const stopRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const runCollect = useCallback(
    async (targetCount: number) => {
      stopRef.current = false
      setRunning(true)
      setError(null)
      setStats({
        new: 0,
        skipped: 0,
        classified: 0,
        noMatch: 0,
        postsScanned: 0,
      })

      const controller = new AbortController()
      abortRef.current = controller

      let cumulative: CollectStats = {
        new: 0,
        skipped: 0,
        classified: 0,
        noMatch: 0,
        postsScanned: 0,
      }

      try {
        for (const subreddit of CHAIR_SUBREDDITS) {
          if (stopRef.current || cumulative.new >= targetCount) break

          setStatus(`r/${subreddit} 처리 중… (신규 ${cumulative.new}/${targetCount})`)

          const result = await fetchJson<CollectStats & { success?: boolean }>(
            "/api/admin/pipeline/auto-collect",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                subreddit,
                targetCount,
                limit: 30,
                statsSoFar: cumulative,
              }),
            }
          )

          if (!result.ok) {
            throw new Error(result.error)
          }

          cumulative = {
            new: result.data.new,
            skipped: result.data.skipped,
            classified: result.data.classified,
            noMatch: result.data.noMatch,
            postsScanned: result.data.postsScanned,
          }
          setStats({ ...cumulative })
        }

        setStatus(
          stopRef.current
            ? "중단됨"
            : `완료 — 신규 ${cumulative.new}건, 스킵 ${cumulative.skipped}건, 미매칭 ${cumulative.noMatch}건`
        )
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setStatus("중단됨")
        } else {
          setError(err instanceof Error ? err.message : "수집 실패")
        }
      } finally {
        setRunning(false)
        abortRef.current = null
      }
    },
    []
  )

  function handleStop() {
    stopRef.current = true
    abortRef.current?.abort()
  }

  return (
    <section className="border border-border rounded-xl p-6 mb-8 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">🤖 서브레딧 자동 크롤링</h2>
          <p className="text-sm text-muted-foreground mt-1">
            의자 이름 검색 없이 r/OfficeChairs 등 전체 피드를 가져온 뒤 Claude로
            의자를 분류합니다. 수집 항목은{" "}
            <Link href="/admin/queue" className="text-primary underline">
              컨텐츠 큐
            </Link>
            에서 검토·게시하세요.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        대상: {CHAIR_SUBREDDITS.map((s) => `r/${s}`).join(", ")}
      </p>

      <div className="flex flex-wrap gap-2">
        {TARGET_PRESETS.map((n) => (
          <Button
            key={n}
            variant="outline"
            disabled={disabled || running}
            onClick={() => void runCollect(n)}
          >
            {running ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {n}개 수집
          </Button>
        ))}
        {running && (
          <Button variant="destructive" size="sm" onClick={handleStop}>
            중단
          </Button>
        )}
      </div>

      {status && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {running && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
          {status}
        </p>
      )}

      {stats && (
        <ul className="text-sm grid grid-cols-2 sm:grid-cols-5 gap-2">
          <li>
            <span className="text-muted-foreground">신규:</span> {stats.new}
          </li>
          <li>
            <span className="text-muted-foreground">스킵:</span> {stats.skipped}
          </li>
          <li>
            <span className="text-muted-foreground">분류 시도:</span>{" "}
            {stats.classified}
          </li>
          <li>
            <span className="text-muted-foreground">미매칭:</span> {stats.noMatch}
          </li>
          <li>
            <span className="text-muted-foreground">스캔 글:</span>{" "}
            {stats.postsScanned}
          </li>
        </ul>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </section>
  )
}
