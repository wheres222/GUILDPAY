"use client"

/**
 * Live embed preview studio — renders the bot's rich embeds straight from the
 * builders in lib/preview-embeds.ts. Edit that file and these update on hot
 * reload. No Discord/backend needed. Visit /preview.
 */

import { useMemo, useState } from "react"
import {
  welcomeResponse,
  setupResponse,
  storefrontResponse,
  checkoutEmbed,
  deliveredDmEmbed,
  type PreviewProduct,
} from "@/lib/preview-embeds"
import {
  DiscordMessage,
  type ActionRow,
  type Embed,
} from "@/components/discord-embed"

const DASH = "https://app.guildpay.io/dashboard/demo"

// Stable reference time for the sample checkout embed, evaluated once at module
// load (not during render) so the purity rule stays happy.
const PREVIEW_NOW = Date.now()

const SAMPLE_PRODUCTS: PreviewProduct[] = [
  {
    id: "p1",
    name: "Premium License Key",
    description: "Lifetime activation key, delivered instantly via DM.",
    price_amount: 29.99,
    price_currency: "USD",
    category: "Digital",
  },
  {
    id: "p2",
    name: "VIP Membership (30 days)",
    description: "Get the @VIP role with perks for a month.",
    price_amount: 9.99,
    price_currency: "USD",
    category: "Subscription",
  },
  {
    id: "p3",
    name: "Custom Bot Build",
    description: "Tell us what you need — we'll open a ticket and deliver.",
    price_amount: 199,
    price_currency: "USD",
    category: "Services",
  },
]

type TabId = "start" | "setup" | "store" | "checkout" | "delivery"

const TABS: { id: TabId; label: string; sub: string }[] = [
  { id: "start", label: "/start", sub: "Welcome embed" },
  { id: "setup", label: "/setup", sub: "Admin setup embed" },
  { id: "store", label: "/store", sub: "Storefront + buy buttons" },
  { id: "checkout", label: "Buy → Checkout", sub: "Pay embed" },
  { id: "delivery", label: "Delivery DM", sub: "After payment" },
]

interface Rendered {
  content?: string
  embeds?: Embed[]
  components?: ActionRow[]
  ephemeral?: boolean
}

export default function PreviewPage() {
  const [tab, setTab] = useState<TabId>("start")
  const [storeName, setStoreName] = useState("Cheat Paradise")

  const rendered = useMemo<Rendered>(() => {
    switch (tab) {
      case "start": {
        const r = welcomeResponse(storeName, DASH)
        return {
          embeds: r.data.embeds as Embed[],
          components: r.data.components as ActionRow[],
          ephemeral: true,
        }
      }
      case "setup": {
        const r = setupResponse(storeName, DASH)
        return {
          embeds: r.data.embeds as Embed[],
          components: r.data.components as ActionRow[],
          ephemeral: true,
        }
      }
      case "store": {
        const r = storefrontResponse(SAMPLE_PRODUCTS)
        const data = r.data as { embeds?: Embed[]; components?: ActionRow[]; content?: string }
        return { embeds: data.embeds, components: data.components, content: data.content }
      }
      case "checkout": {
        const r = checkoutEmbed({
          productName: "Premium License Key",
          payAmount: 29.99,
          payCurrency: "usdttrc20",
          payAddress: "TXk9aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0",
          fiatAmount: 29.99,
          fiatCurrency: "USD",
          orderId: "a1b2c3d4",
          expiresAt: new Date(PREVIEW_NOW + 15 * 60000).toISOString(),
        })
        return { embeds: r.data.embeds as Embed[], ephemeral: true }
      }
      case "delivery": {
        const r = deliveredDmEmbed({
          productName: "Premium License Key",
          body: "Here is your key:\n```PREM-1A2B-3C4D-5E6F```",
        })
        return { embeds: r.embeds as Embed[] }
      }
    }
  }, [tab, storeName])

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row">
        <aside className="md:w-64 md:shrink-0">
          <h1 className="mb-1 text-lg font-bold">Embed preview</h1>
          <p className="mb-4 text-xs text-[#949ba4]">
            Live from <code className="text-[#dbdee1]">lib/preview-embeds.ts</code>. Edit
            and save to see changes.
          </p>

          <label className="mb-1 block text-xs font-medium text-[#949ba4]">Store name</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="mb-4 w-full rounded-md border border-[#3f4248] bg-[#2b2d31] px-3 py-1.5 text-sm outline-none focus:border-[#5865f2]"
          />

          <nav className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  tab === t.id ? "bg-[#5865f2] text-white" : "hover:bg-[#2b2d31]"
                }`}
              >
                <div className="text-sm font-medium">{t.label}</div>
                <div className={`text-xs ${tab === t.id ? "text-white/80" : "text-[#949ba4]"}`}>
                  {t.sub}
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-[#2b2d31] bg-[#313338] p-3">
            <DiscordMessage
              botName={tab === "delivery" ? "GuildPay" : storeName}
              content={rendered.content}
              embeds={rendered.embeds}
              components={rendered.components}
              ephemeral={rendered.ephemeral}
            />
          </div>
          <p className="mt-3 text-xs text-[#949ba4]">
            Discord-faithful preview. Buttons are non-interactive here; they work in Discord.
          </p>
        </main>
      </div>
    </div>
  )
}
