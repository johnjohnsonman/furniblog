"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { QueueItem } from "@/types/pipeline"
import { SOURCE_LABELS } from "@/components/chairs/review-utils"
import type { ReviewSource } from "@/types/review"
import { cn } from "@/lib/utils"

type QueueItemView = QueueItem & {
  productName?: string
  productSlug?: string
}

const STATUS_TABS = [
  { value: "all", label: "\uc804\uccb4" },
  { value: "pending", label: "\ub300\uae30\uc911" },
  { value: "processed", label: "\ucc98\ub9ac\uc644\ub8cc" },
  { value: "failed", label: "\uc2e4\ud328" },
] as const

const SOURCE_BADGE: Record<ReviewSource, string> = {
  chairpark: "bg-blue-100 text-blue-800",
  reddit: "bg-orange-100 text-orange-800",
  youtube: "bg-red-100 text-red-800",
  dcinside: "bg-gray-100 text-gray-800",
  naver: "bg-green-100 text-green-800",
  japan_community: "bg-purple-100 text-purple-800",
  google: "bg-slate-100 text-slate-800",
  trustpilot: "bg-[#00B67A]/15 text-[#00B67A]",
  review_sites: "bg-blue-100 text-blue-800 border-blue-200",
  hackernews: "bg-[#FF6600]/15 text-[#FF6600]",
  twitter: "bg-sky-100 text-sky-700",
  quora: "bg-[#B92B27]/15 text-[#B92B27]",
}

function getAdminSecret(): string {
  if (typeof window === "undefined") return ""
  return sessionStorage.getItem("furniblog_admin_secret") ?? ""
}

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const secret = getAdminSecret()
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": secret,
      ...options.headers,
    },
  })
}

export default function AdminQueuePage() {
  const [secretInput, setSecretInput] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [statusTab, setStatusTab] = useState<string>("all")
  const [items, setItems] = useState<QueueItemView[]>([])
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const saved = getAdminSecret()
    if (saved) {
      setAuthenticated(true)
      setSecretInput(saved)
    }
  }, [])

  const loadQueue = useCallback(async () => {
    if (!getAdminSecret()) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await apiFetch(`/api/pipeline/queue?status=${statusTab}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to load queue")
      setItems(json.items ?? [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Load failed")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [statusTab])

  useEffect(() => {
    if (authenticated) loadQueue()
  }, [authenticated, loadQueue])

  function saveSecret() {
    sessionStorage.setItem("furniblog_admin_secret", secretInput.trim())
    setAuthenticated(true)
  }

  async function handleProcess(queueId: string) {
    setActionId(queueId)
    setMessage(null)
    try {
      const res = await apiFetch("/api/pipeline/process", {
        method: "POST",
        body: JSON.stringify({ queueId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Process failed")
      const conf = json.data?.confidence
      setMessage(
        `AI \ucc98\ub9ac \uc644\ub8cc (confidence: ${typeof conf === "number" ? conf.toFixed(2) : "\u2014"})`
      )
      await loadQueue()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Process failed")
    } finally {
      setActionId(null)
    }
  }

  async function handleApprove(queueId: string) {
    setActionId(queueId)
    setMessage(null)
    try {
      const res = await apiFetch("/api/pipeline/approve", {
        method: "POST",
        body: JSON.stringify({ queueId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Approve failed")
      setMessage(`\ub9ac\ubdf0 \uac8c\uc2dc \uc644\ub8cc (id: ${json.reviewId})`)
      await loadQueue()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Approve failed")
    } finally {
      setActionId(null)
    }
  }

  async function handleReject(queueId: string) {
    setActionId(queueId)
    setMessage(null)
    try {
      const res = await apiFetch("/api/pipeline/reject", {
        method: "POST",
        body: JSON.stringify({ queueId, reason: "rejected_by_admin" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Reject failed")
      setMessage("\ud56d\ubaa9\uc744 \uac70\ubd80\ud588\uc2b5\ub2c8\ub2e4.")
      await loadQueue()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reject failed")
    } finally {
      setActionId(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl space-y-4">
            <h1 className="font-serif text-xl font-medium">
              {"\uad00\ub9ac\uc790 \uc778\uc99d"}
            </h1>
            <p className="text-sm text-muted-foreground">
              <code className="text-xs">.env.local</code>
              {"\uc758 "}
              <code className="text-xs">ADMIN_SECRET</code>
              {" \uac12\uc744 \uc785\ub825\ud558\uc138\uc694."}
            </p>
            <Input
              type="password"
              placeholder="ADMIN_SECRET"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
            />
            <Button className="w-full" onClick={saveSecret}>
              {"\uc785\uc7a5"}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-medium">
                {"\ucf58\ud150\uce20 \ud050"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {"AI \ud30c\uc774\ud504\ub77c\uc778 \uc218\uc9d1\u00b7\ucc98\ub9ac\u00b7\uc2b9\uc778 \uad00\ub9ac"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadQueue} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              {"\uc0c8\ub85c\uace0\uce68"}
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6">
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-muted text-sm text-foreground">
              {message}
            </div>
          )}

          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {STATUS_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                {loading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-16">
                    {"\ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <QueueRowCard
                        key={item.id}
                        item={item}
                        busy={actionId === item.id}
                        onProcess={() => handleProcess(item.id)}
                        onApprove={() => handleApprove(item.id)}
                        onReject={() => handleReject(item.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function QueueRowCard({
  item,
  busy,
  onProcess,
  onApprove,
  onReject,
}: {
  item: QueueItemView
  busy: boolean
  onProcess: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const preview = item.rawContent.slice(0, 120).replace(/\n/g, " ")
  const badgeClass = SOURCE_BADGE[item.sourceType] ?? "bg-muted text-foreground"

  return (
    <article className="p-4 bg-card border border-border rounded-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", badgeClass)}>
            {SOURCE_LABELS[item.sourceType]}
          </span>
          <span className="text-xs text-muted-foreground uppercase">{item.status}</span>
          <span className="text-xs text-muted-foreground">{item.itemType}</span>
        </div>
        <time className="text-xs text-muted-foreground shrink-0">
          {new Date(item.createdAt).toLocaleString("ko-KR")}
        </time>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="md:col-span-2 space-y-1 min-w-0">
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-foreground hover:underline truncate max-w-full"
          >
            {item.sourceUrl}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
          <p className="text-muted-foreground line-clamp-2">{preview}…</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{"\uc544\uc774\ud15c"}</p>
          <p className="font-medium">
            {item.productName ?? item.productSlug ?? item.itemId ?? "—"}
          </p>
        </div>
      </div>

      {item.aiOutput && (
        <div className="mt-4 p-3 bg-muted/40 rounded-lg text-sm space-y-2">
          <p className="font-medium text-foreground">{"AI \uc694\uc57d"}</p>
          <p className="text-muted-foreground">{item.aiOutput.summary}</p>
          <p className="text-xs text-muted-foreground">
            {"\uc885\ud569 "}
            {item.aiOutput.scores.overall}/5 · confidence{" "}
            {item.aiOutput.confidence.toFixed(2)}
          </p>
          {item.aiOutput.pros.length > 0 && (
            <p className="text-xs">+ {item.aiOutput.pros.join(", ")}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.status === "pending" && (
          <Button size="sm" onClick={onProcess} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "AI \ucc98\ub9ac"}
          </Button>
        )}
        {item.status === "processed" && item.aiOutput && (
          <>
            <Button size="sm" onClick={onApprove} disabled={busy}>
              {"\uac8c\uc2dc \uc2b9\uc778"}
            </Button>
            <Button size="sm" variant="outline" onClick={onReject} disabled={busy}>
              {"\uac70\ubd80"}
            </Button>
          </>
        )}
        {(item.status === "failed" || item.status === "processing") && (
          <Button size="sm" variant="outline" onClick={onProcess} disabled={busy}>
            {"\uc7ac\ucc98\ub9ac"}
          </Button>
        )}
      </div>
    </article>
  )
}
