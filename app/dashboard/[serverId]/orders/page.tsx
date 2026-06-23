import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch, formatUsd } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

/** Colour-coded order status: green = done, orange = pending, red = ended. */
function statusBadge(status: string) {
  const s = (status || "").toUpperCase()
  if (s.includes("DELIVER") || s === "PAID" || s.includes("COMPLETE")) {
    return { label: "Completed", cls: "border-green-500/30 bg-green-500/10 text-green-500" }
  }
  if (s.includes("PENDING")) {
    return { label: "Pending", cls: "border-amber-500/30 bg-amber-500/10 text-amber-500" }
  }
  const label = status ? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ") : "Unknown"
  return { label, cls: "border-red-500/30 bg-red-500/10 text-red-500" }
}

type SellerOrdersResponse = {
  success: boolean
  orders: Array<{
    id: string
    status: string
    paymentMethod: string
    paymentProvider: string
    subtotalCents: number
    currency: string
    createdAt: string
    buyerDiscordUserId: string
    items: Array<{
      productName: string
      variantName: string
      deliveryType: string
      deliveredValue?: string | null
    }>
  }>
}

export default async function OrdersPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let orders: SellerOrdersResponse["orders"] = []
  let error: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const res = await apiFetch<SellerOrdersResponse>(`/dashboard/seller/${ctx.sellerId}/orders?limit=50`)
      orders = res.orders
    } catch {
      error = "Could not load orders from backend API."
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Live order feed from your seller account.</p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border/50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-primary">{order.id}</p>
                    <p className="text-sm font-medium text-foreground">{order.items?.[0]?.productName || "Order item"}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p className="text-sm font-semibold text-foreground">{formatUsd(order.subtotalCents)}</p>
                    {(() => {
                      const b = statusBadge(order.status)
                      return (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${b.cls}`}>
                          {b.label}
                        </span>
                      )
                    })()}
                  </div>
                </div>

                <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                  <p>Method: <span className="font-medium text-foreground">Crypto</span></p>
                  <p>Buyer: <span className="font-mono text-foreground">{order.buyerDiscordUserId}</span></p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
