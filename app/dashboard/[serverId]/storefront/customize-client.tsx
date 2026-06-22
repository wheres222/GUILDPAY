"use client"

import { useState } from "react"
import { Image as ImageIcon, Palette, Bot, LayoutTemplate } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Style = "default" | "v2"

interface SampleProduct {
  id: string
  name: string
  price: string
  desc: string
}

const SAMPLE: SampleProduct[] = [
  { id: "p1", name: "Premium License Key", price: "$4.99", desc: "Lifetime activation key, delivered instantly via DM." },
  { id: "p2", name: "VIP Membership", price: "$9.99", desc: "Get the @VIP role with perks for a month." },
  { id: "p3", name: "Pro Toolkit", price: "$24.99", desc: "Full toolkit download with weekly updates and support." },
  { id: "p4", name: "Custom Build", price: "$199.00", desc: "Tell us what you need — we open a ticket and deliver." },
]

// ── Shared Discord message chrome ──────────────────────────────────────────
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

function BuyButtons() {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {SAMPLE.map((p) => (
        <button
          key={p.id}
          type="button"
          className="inline-flex h-8 items-center rounded bg-[#248046] px-4 text-[14px] font-medium text-white"
        >
          Buy {p.name.split(" ")[0]}
        </button>
      ))}
    </div>
  )
}

// ── Default style: classic embed (coloured left bar) ───────────────────────
function DefaultPreview({ botName, logoUrl, bannerUrl }: { botName: string; logoUrl: string; bannerUrl: string }) {
  return (
    <div className="min-h-[600px] rounded-lg bg-[#313338] p-4">
      <div className="flex gap-3">
        <Avatar botName={botName} logoUrl={logoUrl} />
        <div className="min-w-0 flex-1">
          <NameRow botName={botName} />
          <div className="my-1 max-w-[580px] rounded border-l-4 border-[#5865f2] bg-[#2b2d31] py-2 pl-3 pr-4 text-[#dbdee1]">
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 mt-1 text-[16px] font-semibold text-[#f2f3f5]">Welcome to {botName || "GuildPay"} 🛒</div>
                <div className="text-[14px] leading-snug">
                  Buy digital products, keys, roles and services — paid in crypto, delivered instantly.
                </div>
                <div className="mt-2 space-y-2">
                  {SAMPLE.map((p) => (
                    <div key={p.id}>
                      <div className="text-[14px] font-semibold text-[#f2f3f5]">
                        {p.name} — {p.price}
                      </div>
                      <div className="text-[13px] text-[#b5bac1]">{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
              )}
            </div>
            {bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="" className="mt-3 max-h-48 w-full rounded-lg object-cover" />
            )}
            <div className="mt-2 text-[12px] text-[#949ba4]">Powered by {botName || "GuildPay"}</div>
          </div>
          <BuyButtons />
        </div>
      </div>
    </div>
  )
}

// ── V2 style: Components V2 container (no left bar, banner on top) ──────────
function V2Preview({ botName, logoUrl, bannerUrl }: { botName: string; logoUrl: string; bannerUrl: string }) {
  return (
    <div className="min-h-[600px] rounded-lg bg-[#313338] p-4">
      <div className="flex gap-3">
        <Avatar botName={botName} logoUrl={logoUrl} />
        <div className="min-w-0 flex-1">
          <NameRow botName={botName} />
          <div className="mt-1 max-w-[580px] rounded-lg border border-[#3f4248] bg-[#2b2d31] p-3 text-[#dbdee1]">
            {bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="" className="mb-3 max-h-48 w-full rounded-lg object-cover" />
            )}
            <div className="flex items-center gap-2">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
              )}
              <div className="text-[16px] font-bold text-[#f2f3f5]">{botName || "GuildPay"} Store</div>
            </div>
            <div className="my-2 h-px bg-[#3f4248]" />
            <div className="text-[14px]">Browse the store below — pay in crypto, delivered instantly.</div>
            <div className="mt-2 space-y-2">
              {SAMPLE.map((p) => (
                <div key={p.id} className="rounded-md bg-[#1e1f22] p-2">
                  <div className="text-[14px] font-semibold text-[#f2f3f5]">{p.name}</div>
                  <div className="text-[13px] text-[#b5bac1]">{p.desc}</div>
                  <div className="mt-1 text-[13px] font-medium text-[#f2f3f5]">{p.price}</div>
                </div>
              ))}
            </div>
            <div className="my-2 h-px bg-[#3f4248]" />
            <BuyButtons />
          </div>
        </div>
      </div>
    </div>
  )
}

const inputCls = "mt-1"

export function CustomizeClient() {
  const [botName, setBotName] = useState("GuildPay")
  const [logoUrl, setLogoUrl] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [style, setStyle] = useState<Style>("default")

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
            <Input
              id="botName"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="GuildPay"
              className={inputCls}
            />
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
                <CardDescription>Paste a direct image link (e.g. from postimg.cc).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://i.postimg.cc/your-logo.png"
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="bannerUrl">Banner URL</Label>
              <Input
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://i.postimg.cc/your-banner.png"
                className={inputCls}
              />
            </div>
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
            <Button variant="outline" disabled className="w-full justify-start border-border/60">
              Background color editor (soon)
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
                <CardDescription>Choose how your store panel renders. Updates the preview live.</CardDescription>
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
              {style === "v2" ? (
                <V2Preview botName={botName} logoUrl={logoUrl} bannerUrl={bannerUrl} />
              ) : (
                <DefaultPreview botName={botName} logoUrl={logoUrl} bannerUrl={bannerUrl} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
