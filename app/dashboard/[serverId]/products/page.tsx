import Link from "next/link"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"
import { ProductsGrid, type GridProduct } from "./products-grid"

export const dynamic = "force-dynamic"

type ProductsResponse = {
  success: boolean
  products: Array<
    GridProduct & { description?: string | null; createdAt: string }
  >
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string }>
  searchParams?: Promise<{ product?: string; error?: string; guide?: string }>
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
      dataError = "Could not load products from the API."
    }
  }

  const showGuide = sp?.guide !== "off" && products.length === 0

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl font-bold text-foreground sm:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your product inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-2">
            <Link href={`/dashboard/${serverId}/products/new`}>
              <Plus className="h-4 w-4" /> Create Product
            </Link>
          </Button>
        </div>
      </div>

      {sp?.product === "created" && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Product created successfully.
        </div>
      )}
      {sp?.error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Action failed: {sp.error}
        </div>
      )}
      {dataError && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {dataError}
        </div>
      )}

      {/* Get started banner */}
      {showGuide && (
        <div className="relative mb-6 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <Link
            href={`/dashboard/${serverId}/products?guide=off`}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Get started</p>
          <h2 className="mt-2 text-xl font-bold text-foreground">Create your first product</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Add a product with a name, price, and deliverables, then publish it to your storefront.
            You can set up stock, custom fields, discount codes, and more as you go.
          </p>
          <Button asChild className="mt-4 gap-2">
            <Link href={`/dashboard/${serverId}/products/new`}>
              <Plus className="h-4 w-4" /> Create Product
            </Link>
          </Button>
        </div>
      )}

      <ProductsGrid serverId={serverId} products={products} />
    </div>
  )
}
