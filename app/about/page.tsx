import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

const milestones = [
  { year: "2022", title: "Founded", description: "GuildPay was born from bringing seamless commerce to Discord communities." },
  { year: "2023", title: "10K Servers", description: "Reached 10,000 active Discord servers using GuildPay for their storefronts." },
  { year: "2024", title: "$50M Processed", description: "Processed over $50 million in transactions across all channels." },
  { year: "2025", title: "Crypto-native", description: "Went fully crypto-native with in-Discord checkout and auto-delivery." },
]

const values = [
  { title: "Community first", body: "Every feature starts with the community in mind. We listen, learn, and iterate on real feedback." },
  { title: "Trust & security", body: "Non-custodial crypto checkout and secure delivery — trust is built into every transaction." },
  { title: "Simplicity", body: "Complex under the hood, simple to use. Powerful tools shouldn't require a manual." },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader
        eyebrow="About us"
        title="Building the future of Discord commerce"
        subtitle="We believe communities should transact as easily as they communicate. GuildPay makes that possible."
      />

      <main className="mx-auto -mt-16 max-w-6xl px-4 pb-24 sm:-mt-20 lg:px-8">
        {/* Mission / Vision */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
              Our mission
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              To empower Discord communities with the tools they need to run thriving storefronts — making buying and
              selling as natural as chatting, for creators and businesses of any size.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
              Our vision
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              A world where any Discord server can become a marketplace — where trust is built in, payments are instant,
              and community commerce is accessible to everyone.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <h2 className="mt-16 text-center text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
          Our journey
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {milestones.map((m) => (
            <div key={m.year} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-3xl font-extrabold text-primary">{m.year}</span>
              <h3 className="mt-2 font-bold text-slate-900">{m.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{m.description}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mt-16 grid gap-8 rounded-2xl border border-slate-200 bg-slate-50 p-10 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title}>
              <h3 className="font-bold text-slate-900">{v.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{v.body}</p>
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
