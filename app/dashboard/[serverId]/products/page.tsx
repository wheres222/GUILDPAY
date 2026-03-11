import Link from "next/link"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch, formatUsd } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type ProductsResponse = {
  success: boolean
  products: Array<{
    id: string
    name: string
    isActive: boolean
    createdAt: string
    variants: Array<{
      id: string
      name: string
      priceCents: number
      currency: string
      deliveryType: string
      isActive: boolean
    }>
  }>
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string }>
  searchParams?: Promise<{ panel?: string; error?: string }>
}) {
  const { serverId } = await params
  const sp = await searchParams
  const ctx = await resolveDashboardContext(serverId)

  let products: ProductsResponse["products"] = []
  let dataError: string | null = ctx.error

  if (ctx.guildId) {
    try {
      const res = await apiFetch<ProductsResponse>(`/products/guild/${ctx.guildId}`)
      products = res.products
    } catch {
      dataError = "Could not load products from API."
    }
  }

  async function createPanelAction(formData: FormData) {
    "use server"

    const serverId = String(formData.get("serverId") || "")
    const productId = String(formData.get("productId") || "")
    const channelId = String(formData.get("channelId") || "")
    const paymentMode = String(formData.get("paymentMode") || "BOTH")

    const ctx = await resolveDashboardContext(serverId)
    if (!ctx.session?.user?.id) {
      redirect(`/dashboard/${serverId}/products?error=auth_required`)
    }

    try {
      await apiFetch<{ success: boolean; panel: { url: string } }>("/discord/panels/create", {
        method: "POST",
        body: JSON.stringify({
          discordGuildId: serverId,
          sellerDiscordUserId: ctx.session.user.id,
          productId,
          channelId,
          paymentMode,
        }),
      })

      revalidatePath(`/dashboard/${serverId}/products`)
      redirect(`/dashboard/${serverId}/products?panel=created`)
    } catch {
      redirect(`/dashboard/${serverId}/products?error=panel_failed`)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Products
        </h1>
        <p className="text-sm text-muted-foreground">
          Live catalog from backend API. Use Discord `/product_create` and `/license_add` to manage inventory quickly.
        </p>
      </div>

      {sp?.panel === "created" ? (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Product panel posted successfully.
        </div>
      ) : null}

      {sp?.error ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Action failed: {sp.error}
        </div>
      ) : null}

      {dataError ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {dataError}
        </div>
      ) : null}

      <div className="grid gap-4">
        {products.length ? (
          products.map((product) => {
            const variant = product.variants[0]
            return (
              <Card key={product.id} className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm sm:grid-cols-4">
                    <p className="text-muted-foreground">
                      Product ID: <span className="font-mono text-foreground">{product.id}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Price: <span className="font-medium text-foreground">{variant ? formatUsd(variant.priceCents) : "-"}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Delivery: <span className="font-medium text-foreground">{variant?.deliveryType || "-"}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Status: <span className="font-medium text-foreground">{product.isActive ? "Active" : "Inactive"}</span>
                    </p>
                  </div>

                  <form action={createPanelAction} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center">
                    <input type="hidden" name="serverId" value={serverId} />
                    <input type="hidden" name="productId" value={product.id} />

                    <input
                      name="channelId"
                      placeholder="Discord channel ID"
                      className="w-full rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground sm:w-52"
                      required
                    />

                    <select
                      name="paymentMode"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
                      defaultValue="BOTH"
                    >
                      <option value="BOTH">Card + Crypto</option>
                      <option value="CARD">Card only</option>
                      <option value="CRYPTO">Crypto only</option>
                    </select>

                    <Button type="submit" size="sm">Post Buy Panel</Button>
                  </form>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-border/60">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No products found. Create one in Discord with <code>/product_create</code>.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <Button asChild variant="outline">
          <Link href={`/dashboard/${serverId}/products/inventory`}>Inventory</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/${serverId}/orders`}>View Orders</Link>
        </Button>
      </div>
    </div>
  )
}
