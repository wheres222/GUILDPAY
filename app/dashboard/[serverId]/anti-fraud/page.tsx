import { AlertTriangle, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type RiskResponse = {
  success: boolean
  risk: {
    totalOrders: number
    deliveredOrders: number
    failedOrders: number
    refundedOrders: number
    pendingOrders: number
    webhookFailedCount: number
    fraudRatePct: number
  }
}

export default async function AntiFraudPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let error: string | null = ctx.error
  let risk: RiskResponse["risk"] | null = null

  if (ctx.sellerId) {
    try {
      const response = await apiFetch<RiskResponse>(`/dashboard/seller/${ctx.sellerId}/risk`)
      risk = response.risk
    } catch {
      error = "Could not load risk metrics from backend API."
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Anti-Fraud
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Live risk indicators from order and webhook outcomes.</p>
        </div>
        <Button variant="outline" disabled className="border-border/60">
          <Shield className="mr-2 h-4 w-4" />
          Rule editor (soon)
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fraud Rate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{risk?.fraudRatePct ?? 0}%</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Failed Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{risk?.failedOrders ?? 0}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Refunded Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{risk?.refundedOrders ?? 0}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Webhook Failures</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{risk?.webhookFailedCount ?? 0}</p></CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Risk Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Total orders: <span className="font-medium text-foreground">{risk?.totalOrders ?? 0}</span>
          </p>
          <p>
            Delivered: <span className="font-medium text-foreground">{risk?.deliveredOrders ?? 0}</span>
          </p>
          <p>
            Pending payment: <span className="font-medium text-foreground">{risk?.pendingOrders ?? 0}</span>
          </p>
          <div className="rounded-md bg-amber-500/10 px-3 py-2 text-amber-200">
            <AlertTriangle className="mr-2 inline-block h-4 w-4" />
            Automated blocking/rule tuning UI is planned next. Current protections run server-side.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
