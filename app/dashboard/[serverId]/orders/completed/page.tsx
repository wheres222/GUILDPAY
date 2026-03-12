import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch, formatUsd } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type SellerOrdersResponse = {
  success: boolean
  orders: Array<{
    id: string
    status: string
    subtotalCents: number
    createdAt: string
    items: Array<{ productName: string }>
  }>
}

export default async function CompletedOrdersPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let orders: SellerOrdersResponse["orders"] = []
  let error: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const res = await apiFetch<SellerOrdersResponse>(
        `/dashboard/seller/${ctx.sellerId}/orders?status=DELIVERED,REFUNDED,CANCELLED,FAILED&limit=100`
      )
      orders = res.orders
    } catch {
      error = "Could not load completed orders from backend API."
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Completed Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Delivered and finalized order history.</p>

      {error ? (
        <div className="mb-4 mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <Card className="mt-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{order.items?.[0]?.productName || "Order"}</p>
                  <p className="text-xs font-semibold text-foreground">{order.status}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{order.id}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                  <span className="font-medium text-foreground">{formatUsd(order.subtotalCents)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No completed orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
