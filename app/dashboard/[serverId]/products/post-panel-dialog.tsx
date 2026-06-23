"use client"

import { useState } from "react"
import { Send, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { postProductPanelAction } from "./actions"

export interface Channel {
  id: string
  name: string
}

interface PostableProduct {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
}

export function PostPanelDialog({
  serverId,
  product,
  channels,
  channelsLoading,
  onClose,
}: {
  serverId: string
  product: PostableProduct
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
              <p className="text-sm text-red-400">
                Could not post the panel. Make sure the bot is in the server with access to that channel.
              </p>
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
