/**
 * Self-contained embed builders for the /preview studio.
 *
 * These mirror the rich embeds the bot sends so you can design/tweak them in the
 * browser with hot reload — no backend or Discord needed. They intentionally
 * have NO imports so they're trivial to copy into backend/src/bot when you want
 * the live bot to use the same designs.
 */

const BRAND_COLOR = 0x5865f2 // Discord blurple
const SUCCESS_COLOR = 0x22c55e

const BUTTON = 2 // component type: button
const ACTION_ROW = 1 // component type: action row
const PRIMARY = 1
const SECONDARY = 2
const LINK = 5

export interface PreviewProduct {
  id: string
  name: string
  description?: string | null
  price_amount: number
  price_currency: string
  category?: string | null
  image_url?: string | null
}

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

// ── /start ────────────────────────────────────────────────────────────────
export function welcomeEmbed(storeName: string) {
  return {
    title: `Welcome to ${storeName} 🛒`,
    description:
      "Buy digital products, keys, roles and services right here — paid in crypto, delivered instantly.\n\n" +
      "Tap **Browse store** to see what's for sale, or **My orders** to check a purchase.",
    color: BRAND_COLOR,
    fields: [
      { name: "🔒 Secure", value: "Crypto checkout", inline: true },
      { name: "⚡ Instant", value: "Auto-delivery", inline: true },
      { name: "🎫 Support", value: "Open a ticket", inline: true },
    ],
    footer: { text: "Powered by GuildPay" },
  }
}

export function welcomeResponse(storeName: string, dashboardUrl?: string) {
  const buttons: unknown[] = [
    { type: BUTTON, style: PRIMARY, label: "🛍️ Browse store", custom_id: "browse" },
    { type: BUTTON, style: SECONDARY, label: "📦 My orders", custom_id: "myorders" },
  ]
  if (dashboardUrl) {
    buttons.push({ type: BUTTON, style: LINK, label: "Open dashboard", url: dashboardUrl })
  }
  return {
    type: 4,
    data: {
      embeds: [welcomeEmbed(storeName)],
      components: [{ type: ACTION_ROW, components: buttons }],
    },
  }
}

// ── /setup ──────────────────────────────────────────────────────────────────
export function setupEmbed(storeName: string) {
  return {
    title: `⚙️ Set up ${storeName}`,
    description:
      "Get your store live in a few steps. Manage everything from your GuildPay dashboard.",
    color: BRAND_COLOR,
    fields: [
      { name: "1️⃣ Add products", value: "Create listings with keys, roles, files or services." },
      { name: "2️⃣ Connect payouts", value: "Add your crypto wallet to receive funds." },
      { name: "3️⃣ Publish your storefront", value: "Run `/store` to drop the buy embeds in any channel." },
    ],
    footer: { text: "Only members with Manage Server can see this • GuildPay" },
  }
}

export function setupResponse(storeName: string, dashboardUrl?: string) {
  const buttons: unknown[] = [
    { type: BUTTON, style: PRIMARY, label: "🛍️ Preview store", custom_id: "browse" },
  ]
  if (dashboardUrl) {
    buttons.unshift({ type: BUTTON, style: LINK, label: "Open dashboard", url: dashboardUrl })
  }
  return {
    type: 4,
    data: {
      embeds: [setupEmbed(storeName)],
      components: [{ type: ACTION_ROW, components: buttons }],
    },
  }
}

// ── /store ────────────────────────────────────────────────────────────────
export function productEmbed(p: PreviewProduct) {
  return {
    title: p.name,
    description: p.description ?? undefined,
    color: BRAND_COLOR,
    fields: [
      { name: "Price", value: money(p.price_amount, p.price_currency), inline: true },
      { name: "Category", value: p.category ?? "—", inline: true },
    ],
    image: p.image_url ? { url: p.image_url } : undefined,
    footer: { text: "Powered by GuildPay" },
  }
}

export function buyButton(productId: string, label = "Buy now") {
  return { type: BUTTON, style: PRIMARY, label, custom_id: `buy:${productId}` }
}

export function storefrontResponse(products: PreviewProduct[]) {
  if (!products.length) {
    return { type: 4, data: { content: "This store has no products listed yet." } }
  }
  const shown = products.slice(0, 10)
  const embeds = shown.map(productEmbed)
  const components: unknown[] = []
  for (let i = 0; i < shown.length; i += 5) {
    components.push({
      type: ACTION_ROW,
      components: shown.slice(i, i + 5).map((p) => buyButton(p.id, `Buy ${truncate(p.name, 60)}`)),
    })
  }
  return { type: 4, data: { embeds, components } }
}

// ── Buy → checkout ──────────────────────────────────────────────────────────
export interface CheckoutView {
  productName: string
  payAmount: number
  payCurrency: string
  payAddress: string
  fiatAmount: number
  fiatCurrency: string
  orderId: string
  expiresAt: string | null
}

export function checkoutEmbed(v: CheckoutView) {
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    v.payAddress,
  )}`
  const fields = [
    { name: "Send exactly", value: `\`${v.payAmount}\` ${v.payCurrency.toUpperCase()}`, inline: true },
    { name: "Total", value: money(v.fiatAmount, v.fiatCurrency), inline: true },
    { name: "Pay to address", value: `\`\`\`${v.payAddress}\`\`\`` },
  ]
  if (v.expiresAt) {
    const ts = Math.floor(new Date(v.expiresAt).getTime() / 1000)
    fields.push({ name: "Expires", value: `<t:${ts}:R>`, inline: true })
  }
  return {
    type: 4,
    data: {
      embeds: [
        {
          title: `Checkout — ${v.productName}`,
          description:
            "Scan the QR or copy the address below. Your item is delivered automatically once the payment confirms on-chain.",
          color: BRAND_COLOR,
          fields,
          thumbnail: { url: qr },
          footer: { text: `Order ${v.orderId} • GuildPay` },
        },
      ],
    },
  }
}

// ── Delivery DM ─────────────────────────────────────────────────────────────
export function deliveredDmEmbed(args: { productName: string; body: string }) {
  return {
    embeds: [
      {
        title: `✅ ${args.productName}`,
        description: args.body,
        color: SUCCESS_COLOR,
        footer: { text: "Thank you for your purchase • GuildPay" },
      },
    ],
  }
}
