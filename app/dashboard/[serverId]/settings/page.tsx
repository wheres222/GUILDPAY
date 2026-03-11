import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Bell, CreditCard, Globe, Save, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type ProfileResponse = {
  success: boolean
  profile: {
    id: string
    planTier: "FREE" | "PRO" | "ENTERPRISE"
    stripeConnectedAccountId?: string | null
    cryptoPayoutAddress?: string | null
    webhookDeliveryUrl?: string | null
    webhookDeliverySecret?: string | null
    guild: {
      name?: string | null
      discordGuildId: string
    }
  }
}

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string }>
  searchParams?: Promise<{ saved?: string; error?: string; connected?: string }>
}) {
  const { serverId } = await params
  const sp = await searchParams
  const ctx = await resolveDashboardContext(serverId)

  let profile: ProfileResponse["profile"] | null = null
  let error: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const response = await apiFetch<ProfileResponse>(`/dashboard/seller/${ctx.sellerId}/profile`)
      profile = response.profile
    } catch {
      error = "Could not load seller settings from backend API."
    }
  }

  async function saveConnectionsAction(formData: FormData) {
    "use server"

    const serverId = String(formData.get("serverId") || "")
    const cryptoPayoutAddress = String(formData.get("cryptoPayoutAddress") || "").trim()
    const webhookDeliveryUrl = String(formData.get("webhookDeliveryUrl") || "").trim()
    const webhookDeliverySecret = String(formData.get("webhookDeliverySecret") || "").trim()

    const ctx = await resolveDashboardContext(serverId)
    if (!ctx.sellerId) {
      redirect(`/dashboard/${serverId}/settings?error=missing_seller`)
    }

    try {
      await apiFetch("/setup/connect", {
        method: "POST",
        body: JSON.stringify({
          sellerId: ctx.sellerId,
          cryptoPayoutAddress: cryptoPayoutAddress || undefined,
          webhookDeliveryUrl: webhookDeliveryUrl || undefined,
          webhookDeliverySecret: webhookDeliverySecret || undefined,
        }),
      })

      revalidatePath(`/dashboard/${serverId}/settings`)
      redirect(`/dashboard/${serverId}/settings?saved=1`)
    } catch {
      redirect(`/dashboard/${serverId}/settings?error=save_failed`)
    }
  }

  async function stripeConnectAction(formData: FormData) {
    "use server"

    const serverId = String(formData.get("serverId") || "")
    const ctx = await resolveDashboardContext(serverId)

    if (!ctx.sellerId) {
      redirect(`/dashboard/${serverId}/settings?error=missing_seller`)
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://guildpay.io"

      const response = await apiFetch<{ success: boolean; onboarding: { onboardingUrl: string } }>(
        "/setup/connect/stripe/link",
        {
          method: "POST",
          body: JSON.stringify({
            sellerId: ctx.sellerId,
            refreshUrl: `${appUrl}/dashboard/${serverId}/settings?connected=retry`,
            returnUrl: `${appUrl}/dashboard/${serverId}/settings?connected=ok`,
          }),
        }
      )

      redirect(response.onboarding.onboardingUrl)
    } catch {
      redirect(`/dashboard/${serverId}/settings?error=stripe_connect_failed`)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Settings
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">Configure seller payout and delivery settings.</p>
        </div>
      </div>

      {sp?.saved ? (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Settings saved.
        </div>
      ) : null}

      {sp?.connected ? (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Stripe onboarding flow returned: {sp.connected}
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

      <div className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>General</CardTitle>
                <CardDescription className="font-sans text-sm">Guild and seller identity (read-only)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              Guild: <span className="font-medium text-foreground">{profile?.guild?.name || `Guild ${serverId}`}</span>
            </p>
            <p>
              Plan: <span className="font-medium text-foreground">{profile?.planTier || "FREE"}</span>
            </p>
            <p>
              Guild ID: <span className="font-mono text-foreground">{profile?.guild?.discordGuildId || serverId}</span>
            </p>
            <p>
              Seller ID: <span className="font-mono text-foreground">{profile?.id || "-"}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Payment Methods</CardTitle>
                <CardDescription className="font-sans text-sm">Connect Stripe and configure payout destination.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
              Stripe account: <span className="font-mono text-foreground">{profile?.stripeConnectedAccountId || "not connected"}</span>
            </div>

            <form action={stripeConnectAction}>
              <input type="hidden" name="serverId" value={serverId} />
              <Button type="submit" variant="outline" className="border-border/60">
                Connect / Refresh Stripe Onboarding
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Delivery & Payout</CardTitle>
                <CardDescription className="font-sans text-sm">These values are live and used by backend delivery/payout systems.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={saveConnectionsAction} className="space-y-4">
              <input type="hidden" name="serverId" value={serverId} />

              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">Crypto payout address</label>
                <input
                  type="text"
                  name="cryptoPayoutAddress"
                  defaultValue={profile?.cryptoPayoutAddress || ""}
                  className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground"
                  placeholder="Wallet address for seller payouts"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">Webhook delivery URL</label>
                <input
                  type="url"
                  name="webhookDeliveryUrl"
                  defaultValue={profile?.webhookDeliveryUrl || ""}
                  className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground"
                  placeholder="https://merchant.example.com/delivery-webhook"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">Webhook delivery secret</label>
                <input
                  type="text"
                  name="webhookDeliverySecret"
                  defaultValue={profile?.webhookDeliverySecret || ""}
                  className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground"
                  placeholder="Shared secret for merchant webhook verification"
                />
              </div>

              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" />
                Save Delivery Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Security</CardTitle>
                <CardDescription className="font-sans text-sm">MVP security controls are backend-enforced and not editable from UI yet.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
              Checkout idempotency, webhook signature checks, and paid-only delivery are enabled in backend.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
