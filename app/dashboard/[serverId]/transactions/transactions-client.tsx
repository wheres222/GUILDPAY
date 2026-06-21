"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Download,
  BarChart3,
  Plus,
  Settings2,
  Bitcoin,
  Lightbulb,
  X,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PaymentRow {
  id: string
  amountCents: number
  currency: string
  method: string
  description: string
  customer: string
  date: string
  status: string
}

export interface PayoutRow {
  id: string
  amountCents: number
  currency: string
  destination: string
  type: string
  status: string
  arriveBy?: string | null
}

type Tab = "payments" | "payouts" | "topups" | "activity"

const TABS: { id: Tab; label: string }[] = [
  { id: "payments", label: "Payments" },
  { id: "payouts", label: "Payouts" },
  { id: "topups", label: "Top-ups" },
  { id: "activity", label: "All activity" },
]

const PAGE_SIZE = 20

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/** Map an OrderStatus to a Stripe-style coloured badge. */
const STATUS: Record<string, { label: string; cls: string }> = {
  DELIVERED: { label: "Succeeded", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  PAID: { label: "Paid", cls: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  PENDING_PAYMENT: { label: "Pending", cls: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PENDING: { label: "Pending", cls: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  REFUNDED: { label: "Refunded", cls: "border-border bg-muted text-muted-foreground" },
  FAILED: { label: "Failed", cls: "border-red-500/30 bg-red-500/10 text-red-400" },
  EXPIRED: { label: "Expired", cls: "border-border bg-muted text-muted-foreground" },
  CANCELLED: { label: "Cancelled", cls: "border-border bg-muted text-muted-foreground" },
}

function statusInfo(s: string) {
  return STATUS[s] || { label: s.charAt(0) + s.slice(1).toLowerCase(), cls: "border-border bg-muted text-muted-foreground" }
}

function StatusBadge({ status }: { status: string }) {
  const info = statusInfo(status)
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium", info.cls)}>
      {info.label}
    </span>
  )
}

/** Presentational filter chip (matches the Stripe filter row look). */
function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

const STAT_DEFS: { id: string; label: string; match: (s: string) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "succeeded", label: "Succeeded", match: (s) => s === "DELIVERED" || s === "PAID" },
  { id: "pending", label: "Pending", match: (s) => s === "PENDING_PAYMENT" || s === "PENDING" },
  { id: "refunded", label: "Refunded", match: (s) => s === "REFUNDED" },
  { id: "failed", label: "Failed", match: (s) => s === "FAILED" },
  { id: "expired", label: "Expired", match: (s) => s === "EXPIRED" || s === "CANCELLED" },
]

function CoinTag({ method }: { method: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/15 text-amber-500">
        <Bitcoin className="h-3.5 w-3.5" />
      </span>
      {method === "CRYPTO" ? "Crypto" : method}
    </span>
  )
}

function Pagination({ total, page, setPage }: { total: number; page: number; setPage: (p: number) => void }) {
  const start = total === 0 ? 0 : page * PAGE_SIZE + 1
  const end = Math.min(total, (page + 1) * PAGE_SIZE)
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)
  return (
    <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
      <span>
        {total === 0 ? "No items" : `Showing ${start}–${end} of ${total} items`}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= maxPage} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground", className)}>
      {children}
    </th>
  )
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap px-4 py-3 text-sm text-foreground", className)}>{children}</td>
}

function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-16 text-center text-sm text-muted-foreground">
        {label}
      </td>
    </tr>
  )
}

export function TransactionsClient({
  payments,
  payouts,
  error,
}: {
  payments: PaymentRow[]
  payouts: PayoutRow[]
  error?: string | null
}) {
  const [tab, setTab] = useState<Tab>("payments")
  const [stat, setStat] = useState("all")
  const [page, setPage] = useState(0)
  const [showBanner, setShowBanner] = useState(true)

  const changeTab = (t: Tab) => {
    setTab(t)
    setPage(0)
    setStat("all")
  }

  const statCounts = useMemo(
    () => STAT_DEFS.map((d) => ({ ...d, count: payments.filter((p) => d.match(p.status)).length })),
    [payments],
  )

  const filteredPayments = useMemo(() => {
    const def = STAT_DEFS.find((d) => d.id === stat) || STAT_DEFS[0]
    return payments.filter((p) => def.match(p.status))
  }, [payments, stat])

  const activity = useMemo(
    () => [
      ...payments.map((p) => ({ kind: "in" as const, id: p.id, amountCents: p.amountCents, label: p.description, date: p.date, status: p.status })),
      ...payouts.map((p) => ({ kind: "out" as const, id: p.id, amountCents: p.amountCents, label: p.destination, date: p.arriveBy ?? null, status: p.status })),
    ],
    [payments, payouts],
  )

  const headerActions =
    tab === "payouts" ? (
      <>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> New payout
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" /> Manage
        </Button>
      </>
    ) : (
      <>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" /> Analyze
        </Button>
      </>
    )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Transactions
        </h1>
        <div className="flex items-center gap-2">{headerActions}</div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => changeTab(t.id)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      {/* Tip banner */}
      {showBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm">
          <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
          <p className="flex-1 text-muted-foreground">
            Crypto payments confirm on-chain and deliver automatically. Add a payout wallet to withdraw your balance.
          </p>
          <Link href="../wallets" className="shrink-0 font-medium text-primary hover:underline">
            Manage payouts
          </Link>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ---- PAYMENTS ---- */}
      {tab === "payments" && (
        <>
          {/* Stat cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {statCounts.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStat(s.id)
                  setPage(0)
                }}
                className={cn(
                  "rounded-xl border bg-card/40 px-4 py-3 text-left transition-colors",
                  stat === s.id ? "border-primary ring-1 ring-primary/30" : "border-border/60 hover:border-border",
                )}
              >
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-xl font-bold text-foreground">{s.count}</div>
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FilterChip label="Amount" />
            <FilterChip label="Currency" />
            <FilterChip label="Status" />
            <FilterChip label="Payment method" />
            <FilterChip label="More filters" />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" /> Edit columns
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b border-border/60 bg-muted/30">
                  <tr>
                    <Th>Amount</Th>
                    <Th>Payment method</Th>
                    <Th>Description</Th>
                    <Th>Customer</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredPayments.length === 0 ? (
                    <EmptyRow cols={6} label="No payments yet." />
                  ) : (
                    filteredPayments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-muted/30">
                        <Td>
                          <span className="font-semibold">{money(p.amountCents)}</span>{" "}
                          <span className="text-xs text-muted-foreground">{p.currency.toUpperCase()}</span>
                        </Td>
                        <Td><CoinTag method={p.method} /></Td>
                        <Td className="font-mono text-xs text-muted-foreground">{p.description}</Td>
                        <Td className="text-muted-foreground">{p.customer}</Td>
                        <Td className="text-muted-foreground">{fmtDate(p.date)}</Td>
                        <Td><StatusBadge status={p.status} /></Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination total={filteredPayments.length} page={page} setPage={setPage} />
          </div>
        </>
      )}

      {/* ---- PAYOUTS ---- */}
      {tab === "payouts" && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FilterChip label="Date" />
            <FilterChip label="Amount" />
            <FilterChip label="Status" />
            <div className="ml-auto">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b border-border/60 bg-muted/30">
                  <tr>
                    <Th>Amount</Th>
                    <Th>Destination</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Arrive by</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {payouts.length === 0 ? (
                    <EmptyRow cols={5} label="No payouts yet." />
                  ) : (
                    payouts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-muted/30">
                        <Td>
                          <span className="font-semibold">{money(p.amountCents)}</span>{" "}
                          <span className="text-xs text-muted-foreground">{p.currency.toUpperCase()}</span>
                        </Td>
                        <Td className="font-mono text-xs text-muted-foreground">{p.destination}</Td>
                        <Td className="text-muted-foreground">{p.type}</Td>
                        <Td><StatusBadge status={p.status} /></Td>
                        <Td className="text-right text-muted-foreground">{fmtDate(p.arriveBy)}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination total={payouts.length} page={page} setPage={setPage} />
          </div>
        </>
      )}

      {/* ---- TOP-UPS ---- */}
      {tab === "topups" && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/30 px-6 py-20 text-center">
          <p className="text-sm font-medium text-foreground">No top-ups</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Top-ups let you add funds to your balance. They&apos;ll appear here once available.
          </p>
        </div>
      )}

      {/* ---- ALL ACTIVITY ---- */}
      {tab === "activity" && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Description</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {activity.length === 0 ? (
                  <EmptyRow cols={5} label="No activity yet." />
                ) : (
                  activity.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((a) => (
                    <tr key={`${a.kind}-${a.id}`} className="transition-colors hover:bg-muted/30">
                      <Td>
                        <span className="inline-flex items-center gap-2">
                          {a.kind === "in" ? (
                            <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-sky-400" />
                          )}
                          {a.kind === "in" ? "Payment" : "Payout"}
                        </span>
                      </Td>
                      <Td><span className="font-semibold">{money(a.amountCents)}</span></Td>
                      <Td className="font-mono text-xs text-muted-foreground">{a.label}</Td>
                      <Td className="text-muted-foreground">{fmtDate(a.date)}</Td>
                      <Td><StatusBadge status={a.status} /></Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination total={activity.length} page={page} setPage={setPage} />
        </div>
      )}
    </div>
  )
}
