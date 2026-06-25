import Link from "next/link"
import {
  ShoppingCart,
  CreditCard,
  BarChart3,
  Lock,
  Wallet,
  Bell,
  Package,
  MessageSquare,
  Globe,
  Zap,
  Shield,
  RefreshCw,
  ArrowRight,
} from "lucide-react"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

const bentoItems = [
  { icon: ShoppingCart, title: "Product Catalog", description: "Create stunning product listings with rich media support. Add images, descriptions, and variants to showcase your offerings.", size: "large" },
  { icon: CreditCard, title: "Instant Payments", description: "Accept payments in seconds with support for crypto currencies.", size: "small" },
  { icon: Lock, title: "Escrow System", description: "Built-in escrow protects both buyers and sellers from fraud.", size: "small" },
  { icon: BarChart3, title: "Real-Time Analytics", description: "Track every metric that matters. Monitor sales, revenue, and customer behavior with a comprehensive dashboard.", size: "large" },
  { icon: Wallet, title: "Multi-Currency", description: "Accept BTC, ETH, LTC, SOL, USDT and more, with automatic conversion to your preferred payout.", size: "medium" },
  { icon: Package, title: "Auto-Delivery", description: "Automatically deliver digital goods upon payment confirmation.", size: "small" },
  { icon: Bell, title: "Smart Alerts", description: "Never miss a sale with instant notifications.", size: "small" },
  { icon: MessageSquare, title: "Support Tickets", description: "Integrated ticket system for customer support — handle inquiries and disputes right inside Discord.", size: "medium" },
  { icon: Globe, title: "Multi-Server Management", description: "Run marketplaces across multiple Discord servers from one unified dashboard.", size: "large" },
  { icon: Zap, title: "Lightning Fast", description: "Sub-second response times for all commands and transactions.", size: "small" },
  { icon: Shield, title: "Secure by Design", description: "Encryption and non-custodial crypto checkout for every transaction.", size: "small" },
  { icon: RefreshCw, title: "Automated Workflows", description: "Set up automated responses and follow-ups to engage customers without manual effort.", size: "medium" },
]

const stats = [
  { value: "12K+", label: "Servers running stores" },
  { value: "$2.4M+", label: "Processed in crypto" },
  { value: "60s", label: "Average delivery time" },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader
        eyebrow="Features"
        title="Everything you need to sell in Discord"
        subtitle="Build, manage, and scale your crypto marketplace — all inside your server."
      />

      <main className="mx-auto -mt-16 max-w-7xl px-4 pb-24 sm:-mt-20 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bentoItems.map((item) => {
            const colSpan =
              item.size === "large"
                ? "lg:col-span-2"
                : item.size === "medium"
                  ? "sm:col-span-2 lg:col-span-2"
                  : "col-span-1"
            return (
              <div
                key={item.title}
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${colSpan}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-10 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-primary">{s.value}</div>
              <p className="mt-2 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl bg-slate-900 px-8 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Ready to start selling?
            </h2>
            <p className="mt-2 text-slate-300">Turn your Discord server into a crypto storefront in minutes.</p>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2">
            <Link href="/signin">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
