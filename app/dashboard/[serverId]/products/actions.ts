"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

/** Maps the UI's deliverable choices to the backend DeliveryType enum. */
const DELIVERY_MAP: Record<string, string> = {
  serials: "LICENSE_KEY",
  files: "FILE_LINK",
  dynamic: "WEBHOOK",
}

type CreatedProduct = {
  success: boolean
  product: { id: string; variants: { id: string }[] }
}

export async function createProductAction(formData: FormData) {
  const serverId = String(formData.get("serverId") || "")
  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const imageUrl = String(formData.get("imageUrl") || "").trim()
  const price = Number(formData.get("price") || 0)
  const deliverable = String(formData.get("deliverable") || "serials")
  const deliveryValue = String(formData.get("deliveryValue") || "").trim()
  const serials = String(formData.get("serials") || "")
  const exitAfter = String(formData.get("exitAfter") || "") === "1"

  const ctx = await resolveDashboardContext(serverId)
  if (!ctx.guildId || !ctx.sellerId) {
    redirect(`/dashboard/${serverId}/products?error=missing_context`)
  }
  const deliveryType = DELIVERY_MAP[deliverable] || "LICENSE_KEY"
  if (!name || !price) {
    redirect(`/dashboard/${serverId}/products/new?error=invalid_input`)
  }

  let ok = false
  try {
    const res = await apiFetch<CreatedProduct>("/products", {
      method: "POST",
      body: JSON.stringify({
        guildId: ctx.guildId,
        sellerId: ctx.sellerId,
        name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        priceCents: Math.round(price * 100),
        deliveryType,
        deliveryValue: deliveryValue || undefined,
      }),
    })

    if (deliverable === "serials" && serials.trim()) {
      const keys = serials
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (keys.length) {
        await apiFetch("/inventory/license-keys/bulk", {
          method: "POST",
          body: JSON.stringify({ sellerId: ctx.sellerId, productId: res.product.id, keys }),
        }).catch(() => {})
      }
    }
    ok = true
  } catch {
    ok = false
  }

  if (!ok) redirect(`/dashboard/${serverId}/products/new?error=create_failed`)
  revalidatePath(`/dashboard/${serverId}/products`)
  redirect(`/dashboard/${serverId}/products${exitAfter ? "?product=created" : "?product=created"}`)
}

export async function cloneProductAction(args: {
  serverId: string
  name: string
  priceCents: number
  deliveryType: string
  deliveryValue?: string | null
  imageUrl?: string | null
}) {
  const ctx = await resolveDashboardContext(args.serverId)
  if (!ctx.guildId || !ctx.sellerId) return { ok: false }
  try {
    await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify({
        guildId: ctx.guildId,
        sellerId: ctx.sellerId,
        name: `${args.name} (copy)`,
        priceCents: args.priceCents,
        deliveryType: args.deliveryType,
        deliveryValue: args.deliveryValue || undefined,
        imageUrl: args.imageUrl || undefined,
      }),
    })
    revalidatePath(`/dashboard/${args.serverId}/products`)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function updateProductAction(formData: FormData) {
  const serverId = String(formData.get("serverId") || "")
  const productId = String(formData.get("productId") || "")
  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const imageUrl = String(formData.get("imageUrl") || "").trim()
  const price = Number(formData.get("price") || 0)
  const deliverable = String(formData.get("deliverable") || "serials")
  const deliveryValue = String(formData.get("deliveryValue") || "").trim()
  const serials = String(formData.get("serials") || "")
  const exitAfter = String(formData.get("exitAfter") || "") === "1"

  const ctx = await resolveDashboardContext(serverId)
  if (!ctx.sellerId) {
    redirect(`/dashboard/${serverId}/products?error=missing_context`)
  }
  if (!productId || !name || !price) {
    redirect(`/dashboard/${serverId}/products/${productId}/edit?error=invalid_input`)
  }

  const deliveryType = DELIVERY_MAP[deliverable] || "LICENSE_KEY"

  let ok = false
  try {
    await apiFetch(`/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({
        sellerId: ctx.sellerId,
        name,
        description: description || undefined,
        imageUrl: imageUrl || null,
        priceCents: Math.round(price * 100),
        deliveryType,
        deliveryValue: deliveryValue || null,
      }),
    })

    // Any serials typed in are appended to existing stock.
    if (deliverable === "serials" && serials.trim()) {
      const keys = serials
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (keys.length) {
        await apiFetch("/inventory/license-keys/bulk", {
          method: "POST",
          body: JSON.stringify({ sellerId: ctx.sellerId, productId, keys }),
        }).catch(() => {})
      }
    }
    ok = true
  } catch {
    ok = false
  }

  if (!ok) redirect(`/dashboard/${serverId}/products/${productId}/edit?error=update_failed`)
  revalidatePath(`/dashboard/${serverId}/products`)
  redirect(`/dashboard/${serverId}/products${exitAfter ? "?product=updated" : "?product=updated"}`)
}

/** "Delete" = deactivate (the backend has no hard-delete; this hides it). */
export async function deleteProductAction(serverId: string, productId: string) {
  const ctx = await resolveDashboardContext(serverId)
  if (!ctx.sellerId) return { ok: false }
  try {
    await apiFetch(`/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ sellerId: ctx.sellerId, isActive: false }),
    })
    revalidatePath(`/dashboard/${serverId}/products`)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
