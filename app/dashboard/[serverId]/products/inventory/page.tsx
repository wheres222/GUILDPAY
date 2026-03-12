import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type InventorySummaryResponse = {
  success: boolean
  products: Array<{
    id: string
    name: string
    variants: Array<{
      id: string
      name: string
      deliveryType: string
      totalLicenseKeys: number
      availableLicenseKeys: number | null
    }>
  }>
}

export default async function ProductInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string }>
  searchParams?: Promise<{ added?: string; error?: string }>
}) {
  const { serverId } = await params
  const sp = await searchParams
  const ctx = await resolveDashboardContext(serverId)

  let products: InventorySummaryResponse["products"] = []
  let error: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const res = await apiFetch<InventorySummaryResponse>(`/inventory/seller/${ctx.sellerId}/summary`)
      products = res.products
    } catch {
      error = "Could not load inventory summary from backend API."
    }
  }

  async function addKeysAction(formData: FormData) {
    "use server"

    const serverId = String(formData.get("serverId") || "")
    const productId = String(formData.get("productId") || "")
    const rawKeys = String(formData.get("keys") || "")

    const keys = rawKeys
      .split(/[\n,]/g)
      .map((v) => v.trim())
      .filter(Boolean)

    const ctx = await resolveDashboardContext(serverId)
    if (!ctx.sellerId) {
      redirect(`/dashboard/${serverId}/products/inventory?error=missing_seller`)
    }

    if (!keys.length) {
      redirect(`/dashboard/${serverId}/products/inventory?error=no_keys`)
    }

    try {
      await apiFetch("/inventory/license-keys/bulk", {
        method: "POST",
        body: JSON.stringify({
          sellerId: ctx.sellerId,
          productId,
          keys,
        }),
      })

      revalidatePath(`/dashboard/${serverId}/products/inventory`)
      redirect(`/dashboard/${serverId}/products/inventory?added=1`)
    } catch {
      redirect(`/dashboard/${serverId}/products/inventory?error=add_failed`)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="mt-2 text-sm text-muted-foreground">License stock and key management.</p>
      </div>

      {sp?.added ? (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          License keys added successfully.
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

      <div className="space-y-4">
        {products.length ? (
          products.map((product) => {
            const keyVariant = product.variants.find((variant) => variant.deliveryType === "LICENSE_KEY")

            return (
              <Card key={product.id} className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="rounded-lg border border-border/50 p-3">
                        <p className="font-medium text-foreground">{variant.name}</p>
                        <p className="text-xs text-muted-foreground">Type: {variant.deliveryType}</p>
                        {variant.deliveryType === "LICENSE_KEY" ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Available: <span className="font-semibold text-foreground">{variant.availableLicenseKeys ?? 0}</span> / {variant.totalLicenseKeys}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {keyVariant ? (
                    <form action={addKeysAction} className="space-y-2 rounded-lg border border-border/60 p-3">
                      <input type="hidden" name="serverId" value={serverId} />
                      <input type="hidden" name="productId" value={product.id} />

                      <label className="text-sm font-medium text-foreground">Add license keys (comma or newline separated)</label>
                      <textarea
                        name="keys"
                        rows={4}
                        className="w-full rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
                        placeholder="KEY-123\nKEY-456\nKEY-789"
                        required
                      />

                      <Button type="submit" size="sm">Add Keys</Button>
                    </form>
                  ) : (
                    <p className="text-sm text-muted-foreground">No LICENSE_KEY variant found for this product.</p>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-border/60">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">No products to manage inventory for.</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
