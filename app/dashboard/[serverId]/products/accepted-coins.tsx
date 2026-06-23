"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** Approx. floating-rate USD minimums per coin (network-fee driven). */
const COINS = [
  { value: "btc", label: "Bitcoin", min: 16 },
  { value: "eth", label: "Ethereum", min: 1 },
  { value: "ltc", label: "Litecoin", min: 1 },
  { value: "sol", label: "Solana", min: 1 },
  { value: "usdttrc20", label: "USDT (Tron)", min: 11 },
  { value: "xmr", label: "Monero", min: 5 },
  { value: "bnbbsc", label: "BNB", min: 1 },
]

export function AcceptedCoins({ price, initial }: { price: string; initial?: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initial && initial.length ? initial : COINS.map((c) => c.value)),
  )

  const priceNum = parseFloat(price || "0")
  const blocked = (min: number) => priceNum > 0 && priceNum < min

  const toggle = (v: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(v)) n.delete(v)
      else n.add(v)
      return n
    })

  // What actually gets submitted: selected coins that the price supports.
  const effective = COINS.filter((c) => selected.has(c.value) && !blocked(c.min)).map((c) => c.value)
  const anyBlocked = COINS.some((c) => selected.has(c.value) && blocked(c.min))

  return (
    <div>
      <input type="hidden" name="acceptedCoins" value={effective.join(",")} />
      <p className="mb-3 text-xs text-muted-foreground">
        Choose which coins buyers can pay with. Coins below their network minimum for this price are blocked automatically.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {COINS.map((c) => {
          const isBlocked = blocked(c.min)
          const on = selected.has(c.value) && !isBlocked
          return (
            <button
              key={c.value}
              type="button"
              disabled={isBlocked}
              onClick={() => !isBlocked && toggle(c.value)}
              className={cn(
                "flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors",
                isBlocked
                  ? "cursor-not-allowed border-border/40 bg-muted/30 opacity-60"
                  : on
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border",
              )}
            >
              <span className="flex w-full items-center justify-between text-sm font-medium text-foreground">
                {c.label}
                {on && <Check className="h-3.5 w-3.5 text-primary" />}
              </span>
              {isBlocked && <span className="mt-0.5 text-[11px] text-amber-500">Price must be ≥ ${c.min}</span>}
            </button>
          )
        })}
      </div>
      {anyBlocked && (
        <p className="mt-2 text-xs text-amber-500">
          Some coins are unavailable at this price — their network minimum is higher. Raise the price to accept them.
        </p>
      )}
      {priceNum > 0 && effective.length === 0 && (
        <p className="mt-2 text-xs text-red-400">
          No coins are available at this price. Raise the price or this product can&apos;t be purchased.
        </p>
      )}
    </div>
  )
}
