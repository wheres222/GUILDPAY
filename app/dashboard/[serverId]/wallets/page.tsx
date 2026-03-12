import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch, formatUsd } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type SummaryResponse = {
  success: boolean
  summary: {
    availableBalanceCents: number
    grossCents: number
    feeCents: number
    sellerNetCents: number
  }
}

type PayoutResponse = {
  success: boolean
  payout: {
    id: string
    status: string
  }
}

type PayoutListResponse = {
  success: boolean
  payouts: Array<{
    id: string
    amountCents: number
    currency: string
    walletAddress: string
    status: string
    txHash?: string | null
    createdAt: string
  }>
}

export default async function WalletsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string }>
  searchParams?: Promise<{ payout?: string; error?: string }>
}) {
  const { serverId } = await params
  const sp = await searchParams
  const ctx = await resolveDashboardContext(serverId)

  let error: string | null = ctx.error
  let summary: SummaryResponse["summary"] | null = null
  let payouts: PayoutListResponse["payouts"] = []

  if (ctx.sellerId) {
    try {
      const [summaryRes, payoutRes] = await Promise.all([
        apiFetch<SummaryResponse>(`/dashboard/seller/${ctx.sellerId}/summary`),
        apiFetch<PayoutListResponse>(`/payouts/crypto/requests?sellerId=${ctx.sellerId}&limit=20`),
      ])

      summary = summaryRes.summary
      payouts = payoutRes.payouts
    } catch {
      error = "Could not load wallet metrics from backend API."
    }
  }

  async function payoutAction(formData: FormData) {
    "use server"

    const amountCents = Number(formData.get("amountCents") || 0)
    const walletAddress = String(formData.get("walletAddress") || "")
    const serverId = String(formData.get("serverId") || "")

    const ctx = await resolveDashboardContext(serverId)
    if (!ctx.sellerId) {
      redirect(`/dashboard/${serverId}/wallets?error=missing_seller`)
    }

    try {
      await apiFetch<PayoutResponse>("/payouts/crypto/request", {
        method: "POST",
        body: JSON.stringify({
          sellerId: ctx.sellerId,
          amountCents,
          walletAddress,
        }),
      })

      revalidatePath(`/dashboard/${serverId}/wallets`)
      redirect(`/dashboard/${serverId}/wallets?payout=requested`)
    } catch {
      redirect(`/dashboard/${serverId}/wallets?error=payout_failed`)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Wallets & Payouts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform fee is taken per order (1–3% by tier), seller net is credited on paid webhook confirmation.</p>
      </div>

      {sp?.payout === "requested" ? (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Payout request submitted.
        </div>
      ) : null}

      {sp?.error ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Action failed: {sp.error}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Available</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatUsd(summary?.availableBalanceCents ?? 0)}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Gross</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatUsd(summary?.grossCents ?? 0)}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Platform Fees</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatUsd(summary?.feeCents ?? 0)}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Seller Net</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatUsd(summary?.sellerNetCents ?? 0)}</p></CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Request Crypto Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={payoutAction} className="grid gap-3 sm:max-w-xl">
            <input type="hidden" name="serverId" value={serverId} />
            <input
              name="amountCents"
              type="number"
              min={1}
              step={1}
              required
              placeholder="Amount in USD cents (e.g. 1000 = $10.00)"
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm"
            />
            <input
              name="walletAddress"
              required
              placeholder="Destination wallet address"
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm"
            />
            <div>
              <Button type="submit">Submit Payout Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent Payout Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payouts.length ? (
            payouts.map((payout) => (
              <div key={payout.id} className="rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-primary">{payout.id}</p>
                  <p className="text-xs font-semibold text-foreground">{payout.status}</p>
                </div>
                <div className="mt-1 grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                  <p>Amount: <span className="font-medium text-foreground">{formatUsd(payout.amountCents)}</span></p>
                  <p>Wallet: <span className="font-mono text-foreground">{payout.walletAddress}</span></p>
                  <p>{new Date(payout.createdAt).toLocaleString()}</p>
                </div>
                {payout.txHash ? (
                  <p className="mt-1 text-xs text-muted-foreground">Tx: <span className="font-mono text-foreground">{payout.txHash}</span></p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No payout requests yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
