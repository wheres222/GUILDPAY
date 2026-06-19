import { CreateProductForm } from "../create-form"

export const dynamic = "force-dynamic"

export default async function NewProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverId: string }>
  searchParams?: Promise<{ error?: string }>
}) {
  const { serverId } = await params
  const sp = await searchParams
  return <CreateProductForm serverId={serverId} error={sp?.error} />
}
