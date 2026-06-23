import { redirect } from "next/navigation"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"
import { CreateProductForm } from "../../create-form"

export const dynamic = "force-dynamic"

type ProductsResponse = {
  success: boolean
  products: Array<{
    id: string
    name: string
    imageUrl?: string | null
    description?: string | null
    variants: Array<{
      priceCents: number
      currency: string
      deliveryType: string
      deliveryValue?: string | null
    }>
  }>
}

const DELIVERABLE_FROM_TYPE: Record<string, string> = {
  LICENSE_KEY: "serials",
  FILE_LINK: "files",
  WEBHOOK: "dynamic",
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string; productId: string }>
  searchParams?: Promise<{ error?: string }>
}) {
  const { serverId, productId } = await params
  const sp = await searchParams
  const ctx = await resolveDashboardContext(serverId)

  if (!ctx.guildId) {
    redirect(`/dashboard/${serverId}/products?error=missing_context`)
  }

  let product: ProductsResponse["products"][number] | undefined
  try {
    const res = await apiFetch<ProductsResponse>(`/products/guild/${ctx.guildId}`)
    product = res.products.find((p) => p.id === productId)
  } catch {
    redirect(`/dashboard/${serverId}/products?error=load_failed`)
  }

  if (!product) {
    redirect(`/dashboard/${serverId}/products?error=not_found`)
  }

  const v = product.variants[0]
  const initial = {
    name: product.name,
    description: product.description ?? "",
    imageUrl: product.imageUrl ?? "",
    deliverable: DELIVERABLE_FROM_TYPE[v?.deliveryType ?? "LICENSE_KEY"] ?? "serials",
    price: ((v?.priceCents ?? 0) / 100).toFixed(2),
    deliveryValue: v?.deliveryValue ?? "",
  }

  return (
    <CreateProductForm serverId={serverId} mode="edit" productId={productId} initial={initial} error={sp?.error} />
  )
}
