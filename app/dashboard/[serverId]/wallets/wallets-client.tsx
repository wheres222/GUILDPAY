"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Settings2,
  Send,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface Payout {
  id: string
  amountCents: number
  currency: string
  walletAddress: string
  status: string
  txHash?: string | null
  createdAt: string
}

interface Coin {
  ticker: string
  name: string
  icon: string
  pay: string
}

const COINS: Coin[] = [
  { ticker: "BTC", name: "Bitcoin", icon: "/crypto/btc.png", pay: "btc" },
  { ticker: "LTC", name: "Litecoin", icon: "/crypto/ltc.png", pay: "ltc" },
  { ticker: "ETH", name: "Ethereum", icon: "/crypto/eth.png", pay: "eth" },
  { ticker: "SOL", name: "Solana", icon: "/crypto/sol.png", pay: "sol" },
]

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function shorten(v: string, head = 6, tail = 6) {
  if (!v) return "—"
  return v.length > head + tail + 3 ? `${v.slice(0, head)}…${v.slice(-tail)}` : v
}

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  if (!value) return null
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value)
        setDone(true)
        setTimeout(() => setDone(false), 1200)
      }}
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function statusClass(s: string) {
  const v = s.toLowerCase()
  if (v.includes("process") || v.includes("complete") || v.includes("paid"))
    return "bg-green-500/10 text-green-500"
  if (v.includes("pending")) return "bg-amber-500/10 text-amber-500"
  if (v.includes("fail")) return "bg-red-500/10 text-red-500"
  return "bg-muted text-muted-foreground"
}

export function WalletsClient({
  serverId,
  availableCents,
  payouts,
  payoutAction,
}: {
  serverId: string
  availableCents: number
  payouts: Payout[]
  payoutAction: (formData: FormData) => void
}) {
  const [coin, setCoin] = useState<Coin | null>(null)

  return (
    <div className="space-y-6">
      {/* Coin cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COINS.map((c) => (
          <div key={c.ticker} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                <Image src={c.icon} alt={c.name} width={28} height={28} className="h-7 w-7 object-contain" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.ticker}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-bold text-foreground">{money(availableCents)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1 gap-2"
                disabled={availableCents <= 0}
                onClick={() => setCoin(c)}
              >
                <Send className="h-4 w-4" /> Withdraw
              </Button>
              <Button size="sm" variant="outline" className="px-2" disabled title="Configure address — coming soon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawal History */}
      <div className="rounded-xl border border-border/60 bg-card/40">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="font-semibold text-foreground">Withdrawal History</h2>
          <p className="text-xs text-muted-foreground">Manual and automatic payouts sent from your wallets.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">USD Value</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Transaction ID</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No withdrawals yet.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="border-b border-border/40">
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium uppercase text-foreground">{p.currency}</td>
                    <td className="px-5 py-3 text-foreground">{money(p.amountCents)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{money(p.amountCents)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        {shorten(p.walletAddress)} <CopyBtn value={p.walletAddress} />
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        {shorten(p.txHash || "")} {p.txHash && <CopyBtn value={p.txHash} />}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 text-xs text-muted-foreground">
          Showing {payouts.length === 0 ? "0" : `1–${payouts.length}`} of {payouts.length}
        </div>
      </div>

      {/* Withdraw dialog */}
      <Dialog open={coin !== null} onOpenChange={(o) => !o && setCoin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw {coin?.name}</DialogTitle>
            <DialogDescription>
              Send your available balance to your {coin?.ticker} address.
            </DialogDescription>
          </DialogHeader>
          <form action={payoutAction} className="space-y-4">
            <input type="hidden" name="serverId" value={serverId} />
            <input type="hidden" name="currency" value={coin?.pay ?? ""} />
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={(availableCents / 100).toFixed(2)}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">Available: {money(availableCents)}</p>
            </div>
            <div>
              <Label htmlFor="walletAddress">{coin?.ticker} payout address</Label>
              <Input id="walletAddress" name="walletAddress" placeholder="Your wallet address" required />
            </div>
            <DialogFooter>
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" /> Request withdrawal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
