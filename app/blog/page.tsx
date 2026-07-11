import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader eyebrow="Blog" title="Guides & updates" subtitle="Product guides, launch notes, and news from GuildPay." />
      <main className="mx-auto -mt-16 max-w-3xl px-6 pb-24 sm:-mt-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Posts are coming soon. Follow along in our Discord for the latest updates.
        </div>
      </main>
      <Footer />
    </div>
  )
}
