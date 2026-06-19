"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FileText,
  CreditCard,
  Settings,
  Info,
  ImageIcon,
  KeyRound,
  Wrench,
  Cloud,
  Files,
  Box,
  Save,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createProductAction } from "./actions"
import { VariantsEditor } from "./variants-editor"

const TABS = [
  { id: "general", label: "General", icon: FileText },
  { id: "pricing", label: "Pricing & Stock", icon: CreditCard },
  { id: "custom", label: "Custom Fields", icon: Settings },
] as const

const DELIVERABLES = [
  { id: "serials", title: "Serials", icon: KeyRound, desc: "Automatically delivers serial keys. Stock is based on the number of entered serials." },
  { id: "service", title: "Service", icon: Wrench, desc: "Delivers only instructions. Stock is entered manually and can be infinite.", soon: true },
  { id: "dynamic", title: "Dynamic", icon: Cloud, desc: "Delivers content from a specified webhook URL. Stock is manual and can be infinite." },
  { id: "files", title: "Files", icon: Files, beta: true, desc: "Delivers downloadable files. Stock is manual and can be infinite." },
  { id: "physical", title: "Physical", icon: Box, beta: true, desc: "No automatic delivery — a physical item shipped to the customer.", soon: true },
] as const

const inputCls =
  "w-full rounded-lg border border-border/60 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"

function Section({ icon: Icon, title, children }: { icon: typeof FileText; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40">
      <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-foreground" />
        </span>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </div>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-card/30 px-5 py-16 text-center text-sm text-muted-foreground">
      <strong className="text-foreground">{label}</strong> settings are coming soon.
    </div>
  )
}

export function CreateProductForm({ serverId, error }: { serverId: string; error?: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("general")
  const [deliverable, setDeliverable] = useState("serials")

  return (
    <form action={createProductAction} className="p-4 sm:p-6 lg:p-8">
      <input type="hidden" name="serverId" value={serverId} />
      <input type="hidden" name="deliverable" value={deliverable} />

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Create Product
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Fill in the details below to create a new product.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/dashboard/${serverId}/products`}>
              <X className="h-4 w-4" /> Cancel
            </Link>
          </Button>
          <Button type="submit" name="exitAfter" value="1" variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" /> Create &amp; Exit
          </Button>
          <Button type="submit" size="sm" className="gap-2">
            <Save className="h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Could not create the product ({error}). Check the name, price, and deliverable.
        </div>
      )}

      {/* AUP notice */}
      <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        Before adding a product, please review our{" "}
        <Link href="/terms" className="text-primary hover:underline">Acceptable Use Policy</Link> to ensure it&apos;s permitted.
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2 border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* General (kept mounted so fields always submit) */}
      <div className={tab === "general" ? "space-y-6" : "hidden"}>
        <Section icon={FileText} title="General">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Name</label>
            <input name="name" required placeholder="Product Name" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              URL Path <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input name="urlPath" placeholder="product-url-path" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Description</label>
            <textarea name="description" rows={5} placeholder="Describe your product…" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Image</label>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-background/60 px-4 py-8 text-center">
              <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Paste an image URL below</p>
            </div>
            <input name="imageUrl" placeholder="https://…/image.png" className={`${inputCls} mt-2`} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Instructions</label>
            <p className="mb-1.5 text-xs text-muted-foreground">Shown to the customer on the invoice page &amp; in their DM.</p>
            <textarea name="instructions" rows={3} placeholder="To use this product, follow these instructions…" className={inputCls} />
          </div>

          {/* Deliverables Type */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Deliverables Type</label>
            <p className="mb-3 text-xs text-muted-foreground">Determines how the product is delivered and how stock is managed.</p>
            <div className="space-y-2">
              {DELIVERABLES.map((d) => {
                const disabled = "soon" in d && d.soon
                const active = deliverable === d.id
                return (
                  <button
                    type="button"
                    key={d.id}
                    disabled={disabled}
                    onClick={() => !disabled && setDeliverable(d.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                      active ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${active ? "border-primary" : "border-muted-foreground/40"}`}>
                      {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {d.title}
                        {"beta" in d && d.beta && (
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">Beta</span>
                        )}
                        {disabled && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Soon</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d.desc}</p>
                    </div>
                    <d.icon className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
            </div>

            {/* Conditional inputs per deliverable */}
            {deliverable === "dynamic" && (
              <input name="deliveryValue" placeholder="Webhook URL (https://…)" className={`${inputCls} mt-3`} />
            )}
            {deliverable === "files" && (
              <input name="deliveryValue" placeholder="File / download URL (https://…)" className={`${inputCls} mt-3`} />
            )}
          </div>
        </Section>

        {/* Description Tabs */}
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-4 w-4 text-foreground" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Description Tabs</h2>
              <p className="text-xs text-muted-foreground">Add tabs for Features, Specifications, FAQ and more.</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2" disabled>
            <Plus className="h-4 w-4" /> Add Tab
          </Button>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className={tab === "pricing" ? "space-y-6" : "hidden"}>
        <Section icon={CreditCard} title="Pricing & Stock">
          <VariantsEditor deliverable={deliverable} />
        </Section>
      </div>

      {/* Custom Fields */}
      <div className={tab === "custom" ? "" : "hidden"}><Placeholder label="Custom Fields" /></div>
    </form>
  )
}
