import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"
import { TransactionsClient, type PaymentRow, type PayoutRow } from "./transactions-client"

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
    items: Array<{ productName: string; variantName: string }>
  }>
}

type PayoutsResponse = {
  requests?: Array<{
    id?: string
    amountCents?: number
    netAmountCents?: number
    currency?: string
    toAddress?: string
    address?: string
    chain?: string
    status?: string
    createdAt?: string
    arriveBy?: string
  }>
}

export default async function TransactionsPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let payments: PaymentRow[] = []
  let payouts: PayoutRow[] = []
  let error: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const res = await apiFetch<SellerOrdersResponse>(`/dashboard/seller/${ctx.sellerId}/orders?limit=200`)
      payments = res.orders.map((o) => ({
        id: o.id,
        amountCents: o.subtotalCents,
        currency: o.currency || "usd",
        method: o.paymentMethod,
        description: o.items?.[0]?.productName || o.id,
        customer: o.buyerDiscordUserId,
        date: o.createdAt,
        status: o.status,
      }))
    } catch {
      error = "Could not load transactions from the backend API."
    }

    // Payouts are best-effort — the endpoint shape may vary, so fail soft.
    try {
      const res = await apiFetch<PayoutsResponse>(`/payouts/crypto/requests?sellerId=${ctx.sellerId}`)
      payouts = (res.requests || []).map((r, i) => ({
        id: r.id || `payout_${i}`,
        amountCents: r.netAmountCents ?? r.amountCents ?? 0,
        currency: r.currency || "usd",
        destination: r.toAddress || r.address || "—",
        type: r.chain ? `Payout to ${r.chain.toUpperCase()} wallet` : "Crypto payout",
        status: r.status || "PENDING",
        arriveBy: r.arriveBy || r.createdAt || null,
      }))
    } catch {
      payouts = []
    }
  }

  return <TransactionsClient payments={payments} payouts={payouts} error={error} />
}
