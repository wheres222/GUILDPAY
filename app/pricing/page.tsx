import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small communities getting started",
    price: "Free",
    priceNote: "Forever free",
    features: [
      "Up to 50 products",
      "Basic analytics",
      "Manual delivery",
      "Community support",
      "Standard transactions",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing servers with active sales",
    price: "$19",
    priceNote: "per month",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "Auto-delivery system",
      "Priority support",
      "Escrow protection",
      "Custom branding",
      "Multi-currency support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale marketplace operations",
    price: "$99",
    priceNote: "per month",
    features: [
      "Everything in Pro",
      "Multi-server support",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
      "White-label solution",
      "SLA guarantee",
      "24/7 phone support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-medium text-primary">Pricing</span>
              <h1 className="mt-2 text-balance font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Choose the plan that fits your needs. Upgrade or downgrade anytime.
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    plan.highlighted
                      ? "border-primary/50 bg-gradient-to-b from-primary/5 to-transparent shadow-lg shadow-primary/10"
                      : "border-border/40 bg-card/50"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-mono text-xl font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-6">
                    <span className="font-mono text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {plan.priceNote}
                    </span>
                  </div>

                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`mt-8 w-full ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : ""
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>

            {/* FAQ or additional info */}
            <div className="mt-20 rounded-2xl border border-border/40 bg-card/30 p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div>
                  <h4 className="font-mono font-semibold text-foreground">
                    Free forever
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Our Starter plan is completely free with no hidden costs. Perfect for testing the waters.
                  </p>
                </div>
                <div>
                  <h4 className="font-mono font-semibold text-foreground">
                    No credit card required
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start your free trial without entering payment information. Upgrade when ready.
                  </p>
                </div>
                <div>
                  <h4 className="font-mono font-semibold text-foreground">
                    Cancel anytime
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No long-term contracts. Cancel your subscription whenever you want, no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
