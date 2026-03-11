import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch, formatUsd } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

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
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatUsd(order.subtotalCents)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                  <p>Status: <span className="font-medium text-foreground">{order.status}</span></p>
                  <p>Method: <span className="font-medium text-foreground">{order.paymentMethod}</span></p>
                  <p>Provider: <span className="font-medium text-foreground">{order.paymentProvider}</span></p>
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
