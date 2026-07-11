import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader
        eyebrow="Docs"
        title="Documentation"
        subtitle="Bot setup, product management, checkout flow, and webhook events."
      />
      <main className="mx-auto -mt-16 max-w-3xl px-6 pb-24 sm:-mt-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          The docs hub is coming soon. In the meantime, add the bot to your server and use the in-dashboard guides to get started.
        </div>
      </main>
      <Footer />
    </div>
  )
}
