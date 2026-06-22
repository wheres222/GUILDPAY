"use client"

import { useState } from "react"
import {
  Image as ImageIcon,
  Palette,
  Bot,
  LayoutTemplate,
  Type,
  MousePointerClick,
  Plus,
  X,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Style = "default" | "v2"
type BtnStyle = "primary" | "success" | "secondary" | "link"

interface PanelButton {
  id: string
  label: string
  style: BtnStyle
}

interface PanelConfig {
  botName: string
  logoUrl: string
  bannerUrl: string
  title: string
  description: string
  footer: string
  buttons: PanelButton[]
}

const fieldCls =
  "w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"

const BTN_BG: Record<BtnStyle, string> = {
  primary: "bg-[#5865f2]",
  success: "bg-[#248046]",
  secondary: "bg-[#4e5058]",
  link: "bg-[#4e5058]",
}

const STYLE_OPTIONS: { value: BtnStyle; label: string }[] = [
  { value: "primary", label: "Blurple" },
  { value: "success", label: "Green" },
  { value: "secondary", label: "Grey" },
  { value: "link", label: "Link" },
]

// ── Shared Discord chrome ──────────────────────────────────────────────────
function Avatar({ botName, logoUrl }: { botName: string; logoUrl: string }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
    )
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5865f2] text-sm font-bold text-white">
      {(botName || "G").charAt(0).toUpperCase()}
    </div>
  )
}

function NameRow({ botName }: { botName: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[15px] font-medium text-[#f2f3f5]">{botName || "GuildPay"}</span>
      <span className="rounded bg-[#5865f2] px-1 py-px text-[10px] font-semibold uppercase text-white">App</span>
      <span className="text-[12px] text-[#949ba4]">Today</span>
    </div>
  )
}

function PreviewButtons({ buttons }: { buttons: PanelButton[] }) {
  if (!buttons.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {buttons.map((b) => (
        <span
          key={b.id}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded px-4 text-[14px] font-medium text-white",
            BTN_BG[b.style],
          )}
        >
          {b.label || "Button"}
          {b.style === "link" && <ExternalLink className="h-3.5 w-3.5 opacity-80" />}
        </span>
      ))}
    </div>
  )
}

// ── Default style: classic embed ───────────────────────────────────────────
function DefaultPreview({ c }: { c: PanelConfig }) {
  return (
    <div className="min-h-[600px] rounded-lg bg-[#313338] p-4">
      <div className="flex gap-3">
        <Avatar botName={c.botName} logoUrl={c.logoUrl} />
        <div className="min-w-0 flex-1">
          <NameRow botName={c.botName} />
          <div className="my-1 max-w-[580px] rounded border-l-4 border-[#5865f2] bg-[#2b2d31] py-2 pl-3 pr-4 text-[#dbdee1]">
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                {c.title && <div className="mb-1 mt-1 text-[16px] font-semibold text-[#f2f3f5]">{c.title}</div>}
                {c.description && (
                  <div className="whitespace-pre-wrap text-[14px] leading-snug">{c.description}</div>
                )}
              </div>
              {c.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logoUrl} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
              )}
            </div>
            {c.bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.bannerUrl} alt="" className="mt-3 max-h-56 w-full rounded-lg object-cover" />
            )}
            {c.footer && <div className="mt-2 text-[12px] text-[#949ba4]">{c.footer}</div>}
          </div>
          <PreviewButtons buttons={c.buttons} />
        </div>
      </div>
    </div>
  )
}

// ── V2 style: Components V2 container ───────────────────────────────────────
function V2Preview({ c }: { c: PanelConfig }) {
  return (
    <div className="min-h-[600px] rounded-lg bg-[#313338] p-4">
      <div className="flex gap-3">
        <Avatar botName={c.botName} logoUrl={c.logoUrl} />
        <div className="min-w-0 flex-1">
          <NameRow botName={c.botName} />
          <div className="mt-1 max-w-[580px] rounded-lg border border-[#3f4248] bg-[#2b2d31] p-3 text-[#dbdee1]">
            {c.bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.bannerUrl} alt="" className="mb-3 max-h-56 w-full rounded-lg object-cover" />
            )}
            <div className="flex items-start justify-between gap-3">
              {c.title && <div className="text-[16px] font-bold text-[#f2f3f5]">{c.title}</div>}
              {c.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
              )}
            </div>
            {c.description && (
              <>
                <div className="my-2 h-px bg-[#3f4248]" />
                <div className="whitespace-pre-wrap text-[14px]">{c.description}</div>
              </>
            )}
            <div className="my-2 h-px bg-[#3f4248]" />
            <PreviewButtons buttons={c.buttons} />
            {c.footer && <div className="mt-2 text-[12px] text-[#949ba4]">{c.footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CustomizeClient() {
  const [botName, setBotName] = useState("GuildPay")
  const [logoUrl, setLogoUrl] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [title, setTitle] = useState("Welcome to our store 🛒")
  const [description, setDescription] = useState(
    "Buy digital products, keys, roles and services — paid in crypto, delivered instantly.",
  )
  const [footer, setFooter] = useState("Powered by GuildPay")
  const [buttons, setButtons] = useState<PanelButton[]>([
    { id: "b1", label: "🛍️ Browse store", style: "primary" },
    { id: "b2", label: "📦 My orders", style: "secondary" },
  ])
  const [style, setStyle] = useState<Style>("default")

  const updateButton = (id: string, patch: Partial<PanelButton>) =>
    setButtons((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const removeButton = (id: string) =>
    setButtons((bs) => (bs.length > 1 ? bs.filter((b) => b.id !== id) : bs))
  const addButton = () =>
    setButtons((bs) =>
      bs.length >= 5 ? bs : [...bs, { id: `b${Date.now()}`, label: "New button", style: "secondary" }],
    )

  const config: PanelConfig = { botName, logoUrl, bannerUrl, title, description, footer, buttons }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Editing column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Bot identity */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Bot Name</CardTitle>
                <CardDescription>The name shown on your store messages in Discord.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Label htmlFor="botName">Display name</Label>
            <Input id="botName" value={botName} onChange={(e) => setBotName(e.target.value)} placeholder="GuildPay" className="mt-1" />
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Branding</CardTitle>
                <CardDescription>Paste a direct image link (e.g. from postimg.cc). The logo shows top-right.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://i.postimg.cc/your-logo.png" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bannerUrl">Banner URL</Label>
              <Input id="bannerUrl" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://i.postimg.cc/your-banner.png" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Content</CardTitle>
                <CardDescription>The text shown on your store panel.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Welcome to our store" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe your store…"
                className={cn(fieldCls, "mt-1")}
              />
            </div>
            <div>
              <Label htmlFor="footer">Footer</Label>
              <Input id="footer" value={footer} onChange={(e) => setFooter(e.target.value)} placeholder="Powered by GuildPay" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MousePointerClick className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Buttons</CardTitle>
                <CardDescription>Edit the buttons on your panel (up to 5).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {buttons.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <input
                  value={b.label}
                  onChange={(e) => updateButton(b.id, { label: e.target.value })}
                  placeholder="Button label"
                  className={cn(fieldCls, "flex-1")}
                />
                <select
                  value={b.style}
                  onChange={(e) => updateButton(b.id, { style: e.target.value as BtnStyle })}
                  className={cn(fieldCls, "w-28 shrink-0")}
                >
                  {STYLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeButton(b.id)}
                  disabled={buttons.length <= 1}
                  className="shrink-0 rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  title={buttons.length <= 1 ? "Keep at least one button" : "Remove button"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addButton} disabled={buttons.length >= 5} className="gap-2 border-border/60">
              <Plus className="h-4 w-4" /> Add button
            </Button>
          </CardContent>
        </Card>

        {/* Panel style */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <LayoutTemplate className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Panel Style</CardTitle>
                <CardDescription>Choose how your panel renders. Updates the preview live.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStyle("default")}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                style === "default" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border",
              )}
            >
              <div className="text-sm font-semibold text-foreground">Default webhook</div>
              <div className="mt-0.5 text-xs text-muted-foreground">Classic Discord embed with a colored sidebar.</div>
            </button>
            <button
              type="button"
              onClick={() => setStyle("v2")}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                style === "v2" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border",
              )}
            >
              <div className="text-sm font-semibold text-foreground">Webhooks V2</div>
              <div className="mt-0.5 text-xs text-muted-foreground">Modern Components V2 container layout.</div>
            </button>
          </CardContent>
        </Card>

        {/* Theme (still gated) */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Theme</CardTitle>
                <CardDescription>Color editing will be enabled after storefront API contracts are finalized.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" disabled className="w-full justify-start border-border/60">
              Primary color editor (soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live preview */}
      <div className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Live preview</CardTitle>
            <CardDescription>
              {style === "v2" ? "Components V2 container" : "Classic embed"} — updates as you edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg">
              {style === "v2" ? <V2Preview c={config} /> : <DefaultPreview c={config} />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
