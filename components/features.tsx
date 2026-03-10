import { 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  Lock, 
  Wallet, 
  Bell,
  Package,
  MessageSquare,
  Globe
} from "lucide-react"

const features = [
  {
    icon: ShoppingCart,
    title: "Product Listings",
    description: "Create beautiful product catalogs with images, descriptions, and pricing directly in Discord.",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    description: "Accept crypto and traditional payments with automatic order confirmation and delivery.",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Track your sales, revenue, and customer data with real-time analytics dashboard.",
  },
  {
    icon: Lock,
    title: "Escrow Protection",
    description: "Built-in escrow system protects both buyers and sellers from fraudulent transactions.",
  },
  {
    icon: Wallet,
    title: "Multi-Currency",
    description: "Accept BTC, ETH, USDT, and 50+ other cryptocurrencies with instant conversion.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant alerts for new orders, payments, and customer inquiries.",
  },
  {
    icon: Package,
    title: "Auto-Delivery",
    description: "Automatically deliver digital products upon successful payment confirmation.",
  },
  {
    icon: MessageSquare,
    title: "Ticket System",
    description: "Built-in support ticket system for handling customer inquiries and disputes.",
  },
  {
    icon: Globe,
    title: "Multi-Server",
    description: "Manage multiple Discord servers from a single dashboard with unified analytics.",
  },
]

export function Features() {
  return (
    <section className="border-t border-border/40 bg-muted/20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-sans text-sm font-medium text-primary">Features</span>
          <h2
            className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything You Need to Sell
          </h2>
          <p className="mt-4 text-pretty font-sans text-lg font-normal leading-relaxed text-muted-foreground">
            Powerful tools designed for Discord-native commerce. Set up your marketplace in minutes.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border/40 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary transition-colors group-hover:from-primary/20 group-hover:to-accent/20">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3
                className="mt-4 text-lg font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {feature.title}
              </h3>
              <p className="mt-2 font-sans text-sm font-normal leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
