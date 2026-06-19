import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"
import { WalletsClient, type Payout } from "./wallets-client"

export const dynamic = "force-dynamic"

type SummaryResponse = {
  success: boolean
  summary: { availableBalanceCents: number }
}
type PayoutListResponse = { success: boolean; payouts: Payout[] }

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
  let availableCents = 0
  let payouts: Payout[] = []

  if (ctx.sellerId) {
    try {
      const [summaryRes, payoutRes] = await Promise.all([
        apiFetch<SummaryResponse>(`/dashboard/seller/${ctx.sellerId}/summary`),
        apiFetch<PayoutListResponse>(`/payouts/crypto/requests?sellerId=${ctx.sellerId}&limit=20`),
      ])
      availableCents = summaryRes.summary.availableBalanceCents
      payouts = payoutRes.payouts
    } catch {
      error = "Could not load wallet data from the backend API."
    }
  }

  async function payoutAction(formData: FormData) {
    "use server"
    const amount = Number(formData.get("amount") || 0)
    const walletAddress = String(formData.get("walletAddress") || "")
    const currency = String(formData.get("currency") || "")
    const serverId = String(formData.get("serverId") || "")

    const ctx = await resolveDashboardContext(serverId)
    if (!ctx.sellerId) redirect(`/dashboard/${serverId}/wallets?error=missing_seller`)

    let ok = false
    try {
      await apiFetch("/payouts/crypto/request", {
        method: "POST",
        body: JSON.stringify({
          sellerId: ctx.sellerId,
          amountCents: Math.round(amount * 100),
          walletAddress,
          currency,
        }),
      })
      ok = true
    } catch {
      ok = false
    }
    if (!ok) redirect(`/dashboard/${serverId}/wallets?error=payout_failed`)
    revalidatePath(`/dashboard/${serverId}/wallets`)
    redirect(`/dashboard/${serverId}/wallets?payout=requested`)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1
          className="text-xl font-bold text-foreground sm:text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Crypto Wallets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your cryptocurrency balances and withdraw funds to your payout address.
        </p>
      </div>

      {sp?.payout === "requested" && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Withdrawal request submitted.
        </div>
      )}
      {sp?.error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Action failed: {sp.error}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {error}
        </div>
      )}

      <WalletsClient
        serverId={serverId}
        availableCents={availableCents}
        payouts={payouts}
        payoutAction={payoutAction}
      />
    </div>
  )
}
