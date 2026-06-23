"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutGrid, List, Package, Copy, Trash2, Loader2, Pencil, Send, Check } from "lucide-react"
import { cloneProductAction, deleteProductAction, postProductPanelAction } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Channel {
  id: string
  name: string
}

function PostPanelDialog({
  serverId,
  product,
  channels,
  channelsLoading,
  onClose,
}: {
  serverId: string
  product: GridProduct
  channels: Channel[]
  channelsLoading: boolean
  onClose: () => void
}) {
  const [channelId, setChannelId] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const send = async () => {
    if (!channelId) return
    setState("sending")
    const res = await postProductPanelAction({
      serverId,
      productId: product.id,
      channelId,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
    })
    setState(res.ok ? "sent" : "error")
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post “{product.name}” to a channel</DialogTitle>
          <DialogDescription>The buy panel will be posted to the channel you pick.</DialogDescription>
        </DialogHeader>
        {state === "sent" ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
            <Check className="h-4 w-4" /> Panel posted.
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">{channelsLoading ? "Loading channels…" : "Select a channel…"}</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.name}
                </option>
              ))}
            </select>
            {state === "error" && (
              <p className="text-sm text-red-400">Could not post the panel. Make sure the bot is in the server with access to that channel.</p>
            )}
          </div>
        )}
        <DialogFooter>
          {state === "sent" ? (
            <Button onClick={onClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={state === "sending"}>
                Cancel
              </Button>
              <Button onClick={send} disabled={!channelId || state === "sending"} className="gap-2">
                {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Post panel
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface GridProduct {
  id: string
  name: string
  imageUrl?: string | null
  description?: string | null
  isActive: boolean
  variants: Array<{
    priceCents: number
    currency: string
    deliveryType: string
    deliveryValue?: string | null
  }>
}

const DELIVERY_LABEL: Record<string, string> = {
  LICENSE_KEY: "Serials",
  FILE_LINK: "File",
  WEBHOOK: "Dynamic",
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function ProductsGrid({
  serverId,
  products,
}: {
  serverId: string
  products: GridProduct[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)
  const [post, setPost] = useState<GridProduct | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    fetch(`${base}/discord/guild/${serverId}/channels`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { channels: [] }))
      .then((d) => {
        if (active) setChannels(d.channels || [])
      })
      .catch(() => {})
      .finally(() => {
        if (active) setChannelsLoading(false)
      })
    return () => {
      active = false
    }
  }, [serverId])

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  )

  function edit(id: string) {
    router.push(`/dashboard/${serverId}/products/${id}/edit`)
  }

  function run(id: string, fn: () => Promise<{ ok: boolean }>) {
    setBusy(id)
    startTransition(async () => {
      await fn()
      setBusy(null)
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-end gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="h-9 w-56 rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex overflow-hidden rounded-lg border border-border/60">
          <button
            onClick={() => setView("list")}
            className={`flex h-9 w-9 items-center justify-center ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex h-9 w-9 items-center justify-center ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {products.length === 0 ? "No products yet." : "No products match your search."}
        </p>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-3"
          }
        >
          {filtered.map((p) => {
            const v = p.variants[0]
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => edit(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    edit(p.id)
                  }
                }}
                className={`group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-primary/50 ${view === "list" ? "flex items-center" : ""}`}
              >
                {/* Image */}
                <div
                  className={`relative flex items-center justify-center bg-gradient-to-br from-muted to-background ${view === "list" ? "h-20 w-20 shrink-0" : "aspect-[4/3] w-full"}`}
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                  )}
                  <div className="absolute right-2 top-2 hidden items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white group-hover:flex">
                    <Pencil className="h-3 w-3" /> Edit
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{p.name}</h3>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{v ? money(v.priceCents) : "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      {v ? DELIVERY_LABEL[v.deliveryType] ?? v.deliveryType : "—"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        p.isActive ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.isActive ? "Public" : "Hidden"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-4 border-t border-border/50 pt-3 text-xs font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPost(p)
                      }}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Post
                    </button>
                    <button
                      disabled={busy === p.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        run(p.id, () =>
                          cloneProductAction({
                            serverId,
                            name: p.name,
                            priceCents: v?.priceCents ?? 0,
                            deliveryType: v?.deliveryType ?? "LICENSE_KEY",
                            deliveryValue: v?.deliveryValue,
                            imageUrl: p.imageUrl,
                          }),
                        )
                      }}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {busy === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Clone
                    </button>
                    <button
                      disabled={busy === p.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        run(p.id, () => deleteProductAction(serverId, p.id))
                      }}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {post && (
        <PostPanelDialog
          serverId={serverId}
          product={post}
          channels={channels}
          channelsLoading={channelsLoading}
          onClose={() => setPost(null)}
        />
      )}
    </div>
  )
}
