import Link from "next/link"
import { CheckCircle2, Circle, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VolumeChart } from "@/components/dashboard/volume-chart"
import { apiFetch, formatUsd } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type SummaryResponse = {
  success: boolean
  summary: {
    productsCount: number
    ordersCount: number
    grossCents: number
    feeCents: number
    sellerNetCents: number
    availableBalanceCents: number
    statusCounts: Record<string, number>
  }
}

type Order = {
  id: string
  status: string
  subtotalCents: number
  currency: string
  createdAt: string
  buyerDiscordUserId: string
  items: Array<{ productName: string }>
}

function statusBadge(status: string) {
  const s = (status || "").toUpperCase()
  if (s.includes("DELIVER") || s === "PAID" || s.includes("COMPLETE"))
    return { label: "Succeeded", cls: "border-green-500/30 bg-green-500/10 text-green-500" }
  if (s.includes("PENDING")) return { label: "Pending", cls: "border-amber-500/30 bg-amber-500/10 text-amber-500" }
  const label = status ? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ") : "Unknown"
  return { label, cls: "border-red-500/30 bg-red-500/10 text-red-500" }
}

function dailySeries(orders: Order[], rate = 1) {
  const m = new Map<string, number>()
  for (const o of orders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    m.set(key, (m.get(key) || 0) + o.subtotalCents)
  }
  return [...m.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, cents]) => ({
      label: new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: (cents / 100) * rate,
    }))
}

export default async function DashboardPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let summary: SummaryResponse["summary"] | null = null
  let orders: Order[] = []
  let dataError: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        apiFetch<SummaryResponse>(`/dashboard/seller/${ctx.sellerId}/summary`),
        apiFetch<{ orders: Order[] }>(`/dashboard/seller/${ctx.sellerId}/orders?limit=100`),
      ])
      summary = summaryRes.summary
      orders = ordersRes.orders
    } catch {
      dataError = "Dashboard data could not be loaded from backend API."
    }
  }

  // Setup checklist
  let botInstalled = false
  let nowReady = false
  try {
    botInstalled = (await apiFetch<{ installed: boolean }>(`/discord/guild/${serverId}/bot-installed`)).installed
  } catch {}
  try {
    nowReady = Boolean((await apiFetch<{ features?: { nowPaymentsEnabled?: boolean } }>(`/health`)).features?.nowPaymentsEnabled)
  } catch {}
  const setupItems = [
    { done: botInstalled, label: "Add the bot to your server", href: "/select-server" as string | undefined },
    { done: nowReady, label: "Crypto payments enabled", href: undefined as string | undefined },
    { done: (summary?.productsCount ?? 0) > 0, label: "Create your first product", href: `/dashboard/${serverId}/products/new` },
  ]
  const setupComplete = setupItems.every((i) => i.done)

  // Payments breakdown (amount by status)
  const pay = { succeeded: 0, pending: 0, refunded: 0, expired: 0, failed: 0 }
  for (const o of orders) {
    const s = o.status.toUpperCase()
    const a = o.subtotalCents
    if (s.includes("DELIVER") || s === "PAID" || s.includes("COMPLETE")) pay.succeeded += a
    else if (s.includes("PENDING")) pay.pending += a
    else if (s.includes("REFUND")) pay.refunded += a
    else if (s.includes("FAIL")) pay.failed += a
    else pay.expired += a
  }
  const payRows = [
    { label: "Succeeded", amount: pay.succeeded, cls: "bg-primary" },
    { label: "Pending", amount: pay.pending, cls: "bg-amber-500" },
    { label: "Refunded", amount: pay.refunded, cls: "bg-sky-400" },
    { label: "Expired", amount: pay.expired, cls: "bg-orange-400" },
    { label: "Failed", amount: pay.failed, cls: "bg-red-500" },
  ]
  const payTotal = payRows.reduce((s, r) => s + r.amount, 0) || 1

  // Volume series
  const netRate = summary && summary.grossCents > 0 ? summary.sellerNetCents / summary.grossCents : 1
  const grossSeries = dailySeries(orders, 1)
  const netSeries = dailySeries(orders, netRate)

  // Top customers by spend
  const custMap = new Map<string, number>()
  for (const o of orders) custMap.set(o.buyerDiscordUserId, (custMap.get(o.buyerDiscordUserId) || 0) + o.subtotalCents)
  const topCustomers = [...custMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Your overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Live store metrics across all your orders.</p>
        </div>
      </div>

      {dataError ? (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          {dataError}
        </div>
      ) : null}

      {!setupComplete && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Finish setting up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {setupItems.map((i) => (
              <div key={i.label} className="flex items-center gap-2 text-sm">
                {i.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={i.done ? "text-muted-foreground line-through" : "text-foreground"}>{i.label}</span>
                {!i.done && i.href ? (
                  <Link href={i.href} className="ml-auto text-xs font-medium text-primary hover:underline">
                    Do it →
                  </Link>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top row: Payments breakdown · Gross volume · Net volume */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-muted">
              {payRows.map((r) =>
                r.amount > 0 ? (
                  <div key={r.label} className={r.cls} style={{ width: `${(r.amount / payTotal) * 100}%` }} />
                ) : null,
              )}
            </div>
            <div className="space-y-2">
              {payRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${r.cls}`} />
                    {r.label}
                  </span>
                  <span className="font-medium text-foreground">{formatUsd(r.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross volume</CardTitle>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {summary ? formatUsd(summary.grossCents) : "$0.00"}
            </div>
          </CardHeader>
          <CardContent className="px-1 pb-2">
            <VolumeChart data={grossSeries} gradId="gross" />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net volume</CardTitle>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {summary ? formatUsd(summary.sellerNetCents) : "$0.00"}
            </div>
          </CardHeader>
          <CardContent className="px-1 pb-2">
            <VolumeChart data={netSeries} color="#10b981" gradId="net" />
          </CardContent>
        </Card>
      </div>

      {/* Second row: Recent payments · Stats · Top customers */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold sm:text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Recent payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length ? (
              orders.slice(0, 6).map((o) => {
                const b = statusBadge(o.status)
                return (
                  <div key={o.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{o.items?.[0]?.productName || "Order"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{formatUsd(o.subtotalCents)}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            )}
            <Link href={`/dashboard/${serverId}/orders`} className="block pt-1 text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold sm:text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Orders</span>
              <span className="text-lg font-bold text-foreground">{summary?.ordersCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Delivered</span>
              <span className="text-lg font-bold text-foreground">{summary?.statusCounts?.DELIVERED ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform fees</span>
              <span className="text-lg font-bold text-foreground">{summary ? formatUsd(summary.feeCents) : "$0.00"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available balance</span>
              <span className="text-lg font-bold text-primary">{summary ? formatUsd(summary.availableBalanceCents) : "$0.00"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold sm:text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Top customers by spend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCustomers.length ? (
              topCustomers.map(([id, cents]) => (
                <div key={id} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {id.slice(-2)}
                    </span>
                    <span className="truncate font-mono text-xs text-muted-foreground">{id}</span>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground">{formatUsd(cents)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No customers yet.</p>
            )}
            <Link href={`/dashboard/${serverId}/orders`} className="flex items-center gap-1 pt-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
