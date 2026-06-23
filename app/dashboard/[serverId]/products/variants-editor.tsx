"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Menu, Trash2, Box, Plus } from "lucide-react"

const inputCls =
  "w-full rounded-lg border border-border/60 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"

interface Variant {
  id: string
  name: string
  description: string
  price: string
  serials: string
}

let seq = 0
function newVariant(name = ""): Variant {
  seq += 1
  return { id: `v${Date.now()}_${seq}`, name, description: "", price: "", serials: "" }
}

function stockCount(serials: string) {
  return serials.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).length
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

export function VariantsEditor({
  deliverable,
  initialPrice = "",
  existingStock,
  onPrimaryPriceChange,
}: {
  deliverable: string
  initialPrice?: string
  existingStock?: number
  onPrimaryPriceChange?: (price: string) => void
}) {
  const [variants, setVariants] = useState<Variant[]>(() => [{ ...newVariant("Default"), price: initialPrice }])
  const [openId, setOpenId] = useState<string | null>(variants[0].id)

  const update = (id: string, patch: Partial<Variant>) =>
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)))

  const remove = (id: string) =>
    setVariants((vs) => (vs.length > 1 ? vs.filter((v) => v.id !== id) : vs))

  const add = () => {
    const v = newVariant("")
    setVariants((vs) => [...vs, v])
    setOpenId(v.id)
  }

  const primary = variants[0]

  useEffect(() => {
    onPrimaryPriceChange?.(primary.price)
  }, [primary.price, onPrimaryPriceChange])

  return (
    <div className="space-y-3">
      {/* Only the first variant feeds the backend; submit it via hidden inputs
          that stay mounted even when the row is collapsed. */}
      <input type="hidden" name="price" value={primary.price} />
      <input type="hidden" name="serials" value={primary.serials} />

      {/* Toolbar — quick add on the top right */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Variants</p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Variant
        </button>
      </div>

      {variants.map((v) => {
        const open = openId === v.id
        return (
          <div key={v.id} className="overflow-hidden rounded-lg border border-border/60">
            {/* Row header — the whole row toggles open/closed */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(open ? null : v.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setOpenId(open ? null : v.id)
                }
              }}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 ${
                open ? "border-b border-border/60 bg-primary/5" : ""
              }`}
            >
              <span className={open ? "text-primary" : "text-muted-foreground"}>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
              <Menu className="h-4 w-4 cursor-grab text-muted-foreground" />
              <span className={open ? "font-semibold text-primary" : "font-medium text-foreground"}>
                {v.name || "Untitled Variant"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(v.id)
                }}
                disabled={variants.length === 1}
                className="ml-auto text-red-500 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                title={variants.length === 1 ? "A product needs at least one variant" : "Delete variant"}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Expanded body */}
            {open && (
              <div className="space-y-5 p-5">
                <Field label="Variant Name">
                  <input
                    value={v.name}
                    onChange={(e) => update(v.id, { name: e.target.value })}
                    placeholder="Variant Name"
                    className={inputCls}
                  />
                </Field>

                <Field label="Description" optional>
                  <textarea
                    value={v.description}
                    onChange={(e) => update(v.id, { description: e.target.value })}
                    rows={3}
                    placeholder="Variant Description"
                    className={inputCls}
                  />
                </Field>

                <Field label="Price (USD)">
                  <input
                    value={v.price}
                    onChange={(e) => update(v.id, { price: e.target.value })}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="4.99"
                    className={inputCls}
                  />
                </Field>

                {/* Stock */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-foreground">Stock</label>
                  {deliverable === "serials" ? (
                    <>
                      {typeof existingStock === "number" && (
                        <p className="mb-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{existingStock}</span> currently in stock. New lines you add below are <span className="font-medium text-foreground">added on top</span> of existing stock.
                        </p>
                      )}
                      <p className="mb-2 text-xs text-muted-foreground">
                        Enter one deliverable per line. Each line is one unit of stock, delivered on purchase.
                      </p>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-500">
                          <Box className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-medium text-foreground">{stockCount(v.serials)} in stock</span>
                      </div>
                      <textarea
                        value={v.serials}
                        onChange={(e) => update(v.id, { serials: e.target.value })}
                        rows={6}
                        placeholder={"ABCD-1234-EFGH\nWXYZ-5678-IJKL"}
                        className={inputCls}
                      />
                    </>
                  ) : (
                    <div className="rounded-lg border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground">
                      Stock for this delivery type is managed automatically / set as infinite.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
