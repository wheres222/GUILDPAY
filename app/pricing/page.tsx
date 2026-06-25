import Link from "next/link"
import { Check } from "lucide-react"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small communities getting started",
    price: "Free",
    priceNote: "Forever free",
    features: ["Up to 50 products", "Basic analytics", "Manual delivery", "Community support", "Standard transactions"],
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

const faqs = [
  { title: "Free forever", body: "Our Starter plan is completely free with no hidden costs. Perfect for testing the waters." },
  { title: "No credit card required", body: "Start your free trial without entering payment information. Upgrade when ready." },
  { title: "Cancel anytime", body: "No long-term contracts. Cancel your subscription whenever you want, no questions asked." },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        subtitle="Choose the plan that fits your needs. Upgrade or downgrade anytime."
      />

      <main className="mx-auto -mt-16 max-w-7xl px-4 pb-24 sm:-mt-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 ${
                plan.highlighted ? "border-primary shadow-xl ring-1 ring-primary/20" : "border-slate-200 shadow-sm"
              }`}
            >
              {plan.highlighted ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                </div>
              ) : null}

              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                {plan.name}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="ml-2 text-sm text-slate-500">{plan.priceNote}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-8 w-full" variant={plan.highlighted ? "default" : "outline"}>
                <Link href="/signin">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:grid-cols-3">
          {faqs.map((f) => (
            <div key={f.title}>
              <h4 className="font-semibold text-slate-900">{f.title}</h4>
              <p className="mt-2 text-sm text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
