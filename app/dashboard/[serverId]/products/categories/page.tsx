import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type ProductsResponse = {
  success: boolean
  products: Array<{
    id: string
    name: string
    isActive: boolean
    variants: Array<{
      id: string
      deliveryType: string
      isActive: boolean
    }>
  }>
}

export default async function ProductCategoriesPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let products: ProductsResponse["products"] = []
  let error: string | null = ctx.error

  if (ctx.guildId) {
    try {
      const res = await apiFetch<ProductsResponse>(`/products/guild/${ctx.guildId}`)
      products = res.products
    } catch {
      error = "Could not load products from backend API."
    }
  }

  const deliveryBreakdown = products.reduce(
    (acc, product) => {
      const firstVariant = product.variants[0]
      const type = firstVariant?.deliveryType || "UNKNOWN"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const activeCount = products.filter((p) => p.isActive).length
  const inactiveCount = products.length - activeCount

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Product Categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">Catalog segmentation by delivery type and active status.</p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Products</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{products.length}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{activeCount}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inactive</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{inactiveCount}</p></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Delivery Types</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Object.keys(deliveryBreakdown).length}</p></CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Delivery Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(deliveryBreakdown).length ? (
            Object.entries(deliveryBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">{type}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Link href={`/dashboard/${serverId}/products`} className="text-sm text-primary hover:underline">
          Back to products
        </Link>
      </div>
    </div>
  )
}
