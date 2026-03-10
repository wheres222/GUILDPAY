import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CTASection } from "@/components/cta-section"
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
  RefreshCw
} from "lucide-react"

const bentoItems = [
  {
    icon: ShoppingCart,
    title: "Product Catalog",
    description: "Create stunning product listings with rich media support. Add images, videos, descriptions, and variants to showcase your offerings beautifully.",
    size: "large",
    gradient: "from-primary/10 to-accent/10",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    description: "Accept payments in seconds with support for crypto and fiat currencies.",
    size: "small",
    gradient: "from-accent/10 to-primary/5",
  },
  {
    icon: Lock,
    title: "Escrow System",
    description: "Built-in escrow protects both buyers and sellers from fraud.",
    size: "small",
    gradient: "from-primary/5 to-accent/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track every metric that matters. Monitor sales, revenue, conversion rates, and customer behavior with our comprehensive dashboard.",
    size: "large",
    gradient: "from-accent/10 to-primary/10",
  },
  {
    icon: Wallet,
    title: "Multi-Currency",
    description: "Accept BTC, ETH, USDT, and 50+ cryptocurrencies with automatic conversion to your preferred currency.",
    size: "medium",
    gradient: "from-primary/10 to-transparent",
  },
  {
    icon: Package,
    title: "Auto-Delivery",
    description: "Automatically deliver digital goods upon payment confirmation.",
    size: "small",
    gradient: "from-accent/5 to-primary/10",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Never miss a sale with instant notifications.",
    size: "small",
    gradient: "from-primary/10 to-accent/5",
  },
  {
    icon: MessageSquare,
    title: "Support Tickets",
    description: "Integrated ticket system for customer support. Handle inquiries, disputes, and feedback all within Discord with organized ticket channels.",
    size: "medium",
    gradient: "from-accent/10 to-primary/5",
  },
  {
    icon: Globe,
    title: "Multi-Server Management",
    description: "Run marketplaces across multiple Discord servers from one unified dashboard. Perfect for brands with multiple communities.",
    size: "large",
    gradient: "from-primary/10 to-accent/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-second response times for all commands and transactions.",
    size: "small",
    gradient: "from-accent/10 to-primary/5",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security for all transactions and data.",
    size: "small",
    gradient: "from-primary/5 to-accent/10",
  },
  {
    icon: RefreshCw,
    title: "Automated Workflows",
    description: "Set up automated responses, follow-ups, and marketing sequences to engage customers without manual effort.",
    size: "medium",
    gradient: "from-accent/10 to-primary/10",
  },
]

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl" />
            <div className="absolute right-0 top-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-accent/15 to-transparent blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-medium text-primary">Features</span>
              <h1 className="mt-2 text-balance font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Powerful Features for Modern Commerce
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Everything you need to build, manage, and scale your Discord marketplace.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {bentoItems.map((item, index) => {
                const colSpan = 
                  item.size === "large" ? "lg:col-span-2" : 
                  item.size === "medium" ? "sm:col-span-2 lg:col-span-2" : 
                  "col-span-1"
                
                return (
                  <div
                    key={index}
                    className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br ${item.gradient} p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${colSpan}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card/80 text-primary shadow-sm">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-mono text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    
                    {/* Decorative gradient overlay on hover */}
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Additional showcase section */}
            <div className="mt-20">
              <h2 className="text-center font-mono text-2xl font-bold text-foreground">
                Built for Discord, Designed for Growth
              </h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-border/40 bg-card/30 p-8 text-center">
                  <span className="font-mono text-4xl font-bold text-primary">10K+</span>
                  <p className="mt-2 text-muted-foreground">Active Servers</p>
                </div>
                <div className="rounded-2xl border border-border/40 bg-card/30 p-8 text-center">
                  <span className="font-mono text-4xl font-bold text-primary">$50M+</span>
                  <p className="mt-2 text-muted-foreground">Processed Volume</p>
                </div>
                <div className="rounded-2xl border border-border/40 bg-card/30 p-8 text-center">
                  <span className="font-mono text-4xl font-bold text-primary">99.9%</span>
                  <p className="mt-2 text-muted-foreground">Uptime SLA</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
