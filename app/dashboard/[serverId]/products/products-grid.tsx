"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutGrid, List, Package, Copy, Trash2, Loader2, Pencil } from "lucide-react"
import { cloneProductAction, deleteProductAction, editProductAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface GridProduct {
  id: string
  name: string
  imageUrl?: string | null
  description?: string | null
  isActive: boolean
  variants: Array<{
    priceCents: number
    currency: string
    deliveryType: string
    deliveryValue?: string | null
  }>
}

const DELIVERY_LABEL: Record<string, string> = {
  LICENSE_KEY: "Serials",
  FILE_LINK: "File",
  WEBHOOK: "Dynamic",
}

const DELIVERY_OPTIONS = [
  { value: "LICENSE_KEY", label: "Serials" },
  { value: "FILE_LINK", label: "File" },
  { value: "WEBHOOK", label: "Dynamic" },
]

const fieldCls =
  "w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function EditDialog({
  serverId,
  product,
  onClose,
}: {
  serverId: string
  product: GridProduct
  onClose: () => void
}) {
  const router = useRouter()
  const v = product.variants[0]
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? "")
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "")
  const [price, setPrice] = useState(((v?.priceCents ?? 0) / 100).toFixed(2))
  const [deliveryType, setDeliveryType] = useState(v?.deliveryType ?? "LICENSE_KEY")
  const [deliveryValue, setDeliveryValue] = useState(v?.deliveryValue ?? "")
  const [isActive, setIsActive] = useState(product.isActive)
  const [error, setError] = useState<string | null>(null)
  const [saving, start] = useTransition()

  const needsValue = deliveryType === "FILE_LINK" || deliveryType === "WEBHOOK"

  const save = () => {
    setError(null)
    const cents = Math.round(parseFloat(price || "0") * 100)
    if (name.trim().length < 2) return setError("Name must be at least 2 characters.")
    if (!cents || cents <= 0) return setError("Enter a valid price.")
    if (needsValue && !deliveryValue.trim()) return setError("A delivery value is required for File / Dynamic.")
    start(async () => {
      const res = await editProductAction({
        serverId,
        productId: product.id,
        name: name.trim(),
        description,
        imageUrl,
        priceCents: cents,
        deliveryType,
        deliveryValue,
        isActive,
      })
      if (!res.ok) return setError("Could not save changes. Check the image URL is a valid link.")
      onClose()
      router.refresh()
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>Update the details for this product.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
          )}
          <div>
            <Label htmlFor="e-name">Name</Label>
            <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="e-desc">Description</Label>
            <textarea
              id="e-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your product…"
              className={cn(fieldCls, "mt-1")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="e-price">Price (USD)</Label>
              <Input id="e-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="e-delivery">Delivery type</Label>
              <select
                id="e-delivery"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
                className={cn(fieldCls, "mt-1")}
              >
                {DELIVERY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {needsValue && (
            <div>
              <Label htmlFor="e-dval">{deliveryType === "WEBHOOK" ? "Webhook URL" : "File / download URL"}</Label>
              <Input id="e-dval" value={deliveryValue} onChange={(e) => setDeliveryValue(e.target.value)} placeholder="https://…" className="mt-1" />
            </div>
          )}
          <div>
            <Label htmlFor="e-img">Image URL</Label>
            <Input id="e-img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…/image.png" className="mt-1" />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border/60"
            />
            Visible in store (Public)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductsGrid({
  serverId,
  products,
}: {
  serverId: string
  products: GridProduct[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)
  const [edit, setEdit] = useState<GridProduct | null>(null)

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  )

  function run(id: string, fn: () => Promise<{ ok: boolean }>) {
    setBusy(id)
    startTransition(async () => {
      await fn()
      setBusy(null)
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-end gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="h-9 w-56 rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex overflow-hidden rounded-lg border border-border/60">
          <button
            onClick={() => setView("list")}
            className={`flex h-9 w-9 items-center justify-center ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex h-9 w-9 items-center justify-center ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {products.length === 0 ? "No products yet." : "No products match your search."}
        </p>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-3"
          }
        >
          {filtered.map((p) => {
            const v = p.variants[0]
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setEdit(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setEdit(p)
                  }
                }}
                className={`group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-primary/50 ${view === "list" ? "flex items-center" : ""}`}
              >
                {/* Image */}
                <div
                  className={`relative flex items-center justify-center bg-gradient-to-br from-muted to-background ${view === "list" ? "h-20 w-20 shrink-0" : "aspect-[4/3] w-full"}`}
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                  )}
                  <div className="absolute right-2 top-2 hidden items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white group-hover:flex">
                    <Pencil className="h-3 w-3" /> Edit
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{p.name}</h3>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {v ? money(v.priceCents) : "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {v ? DELIVERY_LABEL[v.deliveryType] ?? v.deliveryType : "—"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        p.isActive
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.isActive ? "Public" : "Hidden"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-4 border-t border-border/50 pt-3 text-xs font-medium">
                    <button
                      disabled={busy === p.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        run(p.id, () =>
                          cloneProductAction({
                            serverId,
                            name: p.name,
                            priceCents: v?.priceCents ?? 0,
                            deliveryType: v?.deliveryType ?? "LICENSE_KEY",
                            deliveryValue: v?.deliveryValue,
                            imageUrl: p.imageUrl,
                          }),
                        )
                      }}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {busy === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Clone
                    </button>
                    <button
                      disabled={busy === p.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        run(p.id, () => deleteProductAction(serverId, p.id))
                      }}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {edit && <EditDialog serverId={serverId} product={edit} onClose={() => setEdit(null)} />}
    </div>
  )
}
