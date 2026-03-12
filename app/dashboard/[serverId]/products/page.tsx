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
    description?: string | null
    isActive: boolean
    createdAt: string
    variants: Array<{
      id: string
      name: string
      priceCents: number
      currency: string
      deliveryType: string
      isActive: boolean
      deliveryValue?: string | null
    }>
  }>
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string }>
  searchParams?: Promise<{ panel?: string; product?: string; error?: string }>
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

  async function createProductAction(formData: FormData) {
    "use server"

    const serverId = String(formData.get("serverId") || "")
    const name = String(formData.get("name") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const priceCents = Number(formData.get("priceCents") || 0)
    const deliveryType = String(formData.get("deliveryType") || "")
    const deliveryValue = String(formData.get("deliveryValue") || "").trim()

    const ctx = await resolveDashboardContext(serverId)
    if (!ctx.guildId || !ctx.sellerId) {
      redirect(`/dashboard/${serverId}/products?error=missing_context`)
    }

    if (!name || !priceCents || !deliveryType) {
      redirect(`/dashboard/${serverId}/products?error=invalid_product_input`)
    }

    try {
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          guildId: ctx.guildId,
          sellerId: ctx.sellerId,
          name,
          description: description || undefined,
          priceCents,
          deliveryType,
          deliveryValue: deliveryValue || undefined,
        }),
      })

      revalidatePath(`/dashboard/${serverId}/products`)
      redirect(`/dashboard/${serverId}/products?product=created`)
    } catch {
      redirect(`/dashboard/${serverId}/products?error=product_create_failed`)
    }
  }

  async function createPanelAction(formData: FormData) {
    "use server"

    const serverId = String(formData.get("serverId") || "")
    const productId = String(formData.get("productId") || "")
    const channelId = String(formData.get("channelId") || "")
    const paymentMode = String(formData.get("paymentMode") || "BOTH")
    const note = String(formData.get("note") || "").trim()
    const panelTitle = String(formData.get("panelTitle") || "").trim()
    const panelDescription = String(formData.get("panelDescription") || "").trim()
    const imageUrl = String(formData.get("imageUrl") || "").trim()
    const cardButtonLabel = String(formData.get("cardButtonLabel") || "").trim()
    const cryptoButtonLabel = String(formData.get("cryptoButtonLabel") || "").trim()

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
          note: note || undefined,
          panelTitle: panelTitle || undefined,
          panelDescription: panelDescription || undefined,
          imageUrl: imageUrl || undefined,
          cardButtonLabel: cardButtonLabel || undefined,
          cryptoButtonLabel: cryptoButtonLabel || undefined,
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
          Manage product pricing, delivery mode, and channel buy-panels from one place.
        </p>
      </div>

      {sp?.product === "created" ? (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Product created successfully.
        </div>
      ) : null}

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

      <Card className="mb-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Create Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProductAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="serverId" value={serverId} />

            <input
              name="name"
              placeholder="Product name"
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
              required
            />
            <input
              name="priceCents"
              type="number"
              min={1}
              step={1}
              placeholder="Price in cents (e.g., 1999)"
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
              required
            />

            <select
              name="deliveryType"
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
              defaultValue="FILE_LINK"
            >
              <option value="FILE_LINK">FILE_LINK</option>
              <option value="LICENSE_KEY">LICENSE_KEY</option>
              <option value="WEBHOOK">WEBHOOK</option>
            </select>
            <input
              name="deliveryValue"
              placeholder="Delivery value (URL or endpoint for FILE_LINK/WEBHOOK)"
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
            />

            <textarea
              name="description"
              rows={3}
              placeholder="Optional product description"
              className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground sm:col-span-2"
            />

            <div className="sm:col-span-2">
              <Button type="submit">Create Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>

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

                  <form action={createPanelAction} className="grid gap-2 rounded-lg border border-border/60 p-3 sm:grid-cols-2">
                    <input type="hidden" name="serverId" value={serverId} />
                    <input type="hidden" name="productId" value={product.id} />

                    <input
                      name="channelId"
                      placeholder="Discord channel ID"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
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

                    <input
                      name="panelTitle"
                      placeholder="Optional panel title override"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
                    />
                    <input
                      name="imageUrl"
                      placeholder="Optional image URL"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
                    />

                    <input
                      name="cardButtonLabel"
                      placeholder="Card button label (optional)"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
                    />
                    <input
                      name="cryptoButtonLabel"
                      placeholder="Crypto button label (optional)"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
                    />

                    <textarea
                      name="panelDescription"
                      rows={2}
                      placeholder="Optional panel description"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground sm:col-span-2"
                    />
                    <textarea
                      name="note"
                      rows={2}
                      placeholder="Optional extra note"
                      className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground sm:col-span-2"
                    />

                    <div className="sm:col-span-2">
                      <Button type="submit" size="sm">Post Buy Panel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-border/60">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No products found. Create one above or in Discord with <code>/product_create</code>.
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
