import { DollarSign, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueOrdersChart } from "@/components/dashboard/revenue-orders-chart"
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

type SellerOrdersResponse = {
  success: boolean
  orders: Array<{
    id: string
    status: string
    subtotalCents: number
    currency: string
    createdAt: string
    items: Array<{ productName: string }>
  }>
}

export default async function DashboardPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let summary: SummaryResponse["summary"] | null = null
  let recentOrders: SellerOrdersResponse["orders"] = []
  let dataError: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        apiFetch<SummaryResponse>(`/dashboard/seller/${ctx.sellerId}/summary`),
        apiFetch<SellerOrdersResponse>(`/dashboard/seller/${ctx.sellerId}/orders?limit=8`),
      ])

      summary = summaryRes.summary
      recentOrders = ordersRes.orders
    } catch {
      dataError = "Dashboard data could not be loaded from backend API."
    }
  }

  const chartData = recentOrders
    .slice()
    .reverse()
    .map((order, index) => ({
      label: `#${index + 1}`,
      revenue: order.subtotalCents / 100,
      orders: 1,
    }))

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Live store metrics and recent activity.</p>
      </div>

      {dataError ? (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {dataError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {summary ? formatUsd(summary.grossCents) : "$0.00"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Platform fees: {summary ? formatUsd(summary.feeCents) : "$0.00"}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {summary?.ordersCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Delivered: {summary?.statusCounts?.DELIVERED ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {summary?.productsCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Available balance: {summary ? formatUsd(summary.availableBalanceCents) : "$0.00"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="border-border/60 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold sm:text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Revenue & Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueOrdersChart data={chartData.length ? chartData : [{ label: "No data", revenue: 0, orders: 0 }]} />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold sm:text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length ? (
              recentOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="rounded-lg border border-border/50 p-3">
                  <p className="text-sm font-medium text-foreground">{order.items?.[0]?.productName || "Order"}</p>
                  <p className="text-xs text-muted-foreground">{order.id}</p>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                    <span className="font-medium text-foreground">{formatUsd(order.subtotalCents)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
