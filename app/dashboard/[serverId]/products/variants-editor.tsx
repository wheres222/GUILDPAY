"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Menu,
  Trash2,
  Box,
  Plus,
  Minus,
  Percent,
  MessageCircle,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Code2,
  Link2,
  Palette,
  PaintBucket,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"

const inputCls =
  "w-full rounded-lg border border-border/60 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"

type Selection = "last" | "first" | "random"

interface Variant {
  id: string
  name: string
  description: string
  price: string
  slashedPrice: string
  serials: string
  minQty: string
  maxQty: string
  redirectUrl: string
  selection: Selection
  manageStock: boolean
}

let seq = 0
function newVariant(name = ""): Variant {
  seq += 1
  return {
    id: `v${Date.now()}_${seq}`,
    name,
    description: "",
    price: "",
    slashedPrice: "",
    serials: "",
    minQty: "",
    maxQty: "",
    redirectUrl: "",
    selection: "last",
    manageStock: true,
  }
}

function stockCount(serials: string) {
  return serials.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).length
}

function Field({
  label,
  optional,
  hint,
  children,
}: {
  label: string
  optional?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  )
}

/** Presentational rich-text toolbar (matches the SellAuth editor chrome). */
function EditorToolbar() {
  const tools = [Undo2, Redo2, Bold, Italic, Underline, Code2, Link2, Palette, PaintBucket, AlignLeft, AlignCenter, AlignRight, AlignJustify]
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-border/60 bg-muted/40 px-2 py-1.5">
      {tools.map((T, i) => (
        <button
          key={i}
          type="button"
          disabled
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground"
        >
          <T className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

const SELECTION: { id: Selection; title: string; desc: string }[] = [
  { id: "last", title: "Last", desc: "The last item will be delivered first." },
  { id: "first", title: "First", desc: "The first item will be delivered first." },
  { id: "random", title: "Random", desc: "A random item will be delivered." },
]

export function VariantsEditor({ deliverable }: { deliverable: string }) {
  const [variants, setVariants] = useState<Variant[]>(() => [newVariant("Default")])
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

  return (
    <div className="space-y-3">
      {variants.map((v, index) => {
        const open = openId === v.id
        // Only the first variant feeds the backend create action.
        const isPrimary = index === 0
        return (
          <div key={v.id} className="overflow-hidden rounded-lg border border-border/60">
            {/* Row header */}
            <div
              className={`flex items-center gap-3 px-4 py-3 ${
                open ? "border-b border-border/60 bg-primary/5" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : v.id)}
                className={open ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              >
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <Menu className="h-4 w-4 cursor-grab text-muted-foreground" />
              <span className={open ? "font-semibold text-primary" : "font-medium text-foreground"}>
                {v.name || "Untitled Variant"}
              </span>
              <button
                type="button"
                onClick={() => remove(v.id)}
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

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Price">
                    <input
                      name={isPrimary ? "price" : undefined}
                      value={v.price}
                      onChange={(e) => update(v.id, { price: e.target.value })}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.01"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Slashed Price" optional>
                    <input
                      value={v.slashedPrice}
                      onChange={(e) => update(v.id, { slashedPrice: e.target.value })}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1.00"
                      className={`${inputCls} line-through placeholder:line-through`}
                    />
                  </Field>
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-foreground">Stock</label>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Enter one deliverable per line. Upon purchase, the selected item is delivered to the customer.
                  </p>
                  {deliverable === "serials" ? (
                    <>
                      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                            <Box className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{stockCount(v.serials)} items in stock</p>
                            <p className="text-xs text-muted-foreground">Click to manage existing deliverables</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => update(v.id, { manageStock: !v.manageStock })}
                          className="flex items-center gap-2 rounded-lg border border-primary/50 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                          <Box className="h-4 w-4" /> Manage Stock
                        </button>
                      </div>
                      {v.manageStock && (
                        <textarea
                          name={isPrimary ? "serials" : undefined}
                          value={v.serials}
                          onChange={(e) => update(v.id, { serials: e.target.value })}
                          rows={6}
                          placeholder={"ABCD-1234-EFGH\nWXYZ-5678-IJKL"}
                          className={`${inputCls} mt-2`}
                        />
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground">
                      Stock for this delivery type is managed automatically / set as infinite.
                    </div>
                  )}
                </div>

                {/* Downloadable files */}
                <Field label="Downloadable Files" hint="Files that will be available for download after purchase.">
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-4 py-2.5 text-sm text-muted-foreground"
                  >
                    <Plus className="h-4 w-4" /> Attach downloadable files
                  </button>
                </Field>

                {/* Quantities */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Min Quantity" optional>
                    <input
                      value={v.minQty}
                      onChange={(e) => update(v.id, { minQty: e.target.value })}
                      type="number"
                      min="0"
                      placeholder="1"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Max Quantity" optional>
                    <input
                      value={v.maxQty}
                      onChange={(e) => update(v.id, { maxQty: e.target.value })}
                      type="number"
                      min="0"
                      placeholder="10"
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Volume discounts */}
                <Field label="Volume Discounts" optional>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <input placeholder="Quantity…" className={`${inputCls} pr-12`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">pcs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-border/60 bg-background">
                        <button type="button" disabled className="px-3 py-2.5 text-muted-foreground">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex items-center px-2 text-sm text-muted-foreground">
                          <Percent className="h-3.5 w-3.5" />
                        </span>
                        <button type="button" disabled className="px-3 py-2.5 text-muted-foreground">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/50 text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <label className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-background px-4 py-3 text-sm text-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border-border/60" />
                    Disable Volume Discounts when a Coupon is applied
                  </label>
                </Field>

                {/* Override instructions */}
                <Field label="Override Instructions" optional hint="Override the default instructions for this variant.">
                  <EditorToolbar />
                  <textarea
                    rows={4}
                    placeholder="To use this product variant, follow these instructions…"
                    className={`${inputCls} rounded-t-none`}
                  />
                </Field>

                {/* Deliverable selection method */}
                <Field
                  label="Deliverable Selection Method"
                  hint="Choose how will the system determine which deliverables to deliver to the customer."
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    {SELECTION.map((s) => {
                      const active = v.selection === s.id
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => update(v.id, { selection: s.id })}
                          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                            active ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                              active ? "border-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-foreground">{s.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{s.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Field>

                {/* Disabled payment methods */}
                <Field label="Disabled Payment Methods" optional hint="Disable specific payment methods on this variant.">
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm text-muted-foreground"
                  >
                    Disabled Payment Methods
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </Field>

                {/* Discord auto join & role */}
                <Field
                  label="Discord Auto Join & Auto Role"
                  optional
                  hint="Configure the servers which users will be joined to and the roles which will be assigned to them."
                >
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 rounded-lg border border-primary/50 px-4 py-2.5 text-sm font-medium text-primary"
                  >
                    <MessageCircle className="h-4 w-4" /> Configure Discord Servers &amp; Roles
                  </button>
                </Field>

                {/* Redirect URL */}
                <Field
                  label="Redirect URL"
                  optional
                  hint="Redirect your customers to this URL after a payment has been completed. If multiple items have been purchased, only the first URL will be used."
                >
                  <input
                    value={v.redirectUrl}
                    onChange={(e) => update(v.id, { redirectUrl: e.target.value })}
                    placeholder="https://example.com"
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </div>
        )
      })}

      {/* Create a new variant */}
      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Plus className="h-4 w-4" /> Create a New Variant
      </button>
    </div>
  )
}
