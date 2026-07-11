import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader eyebrow="Legal" title="Cookie Policy" subtitle="How we use cookies and manage consent." />
      <main className="mx-auto -mt-16 max-w-3xl px-6 pb-24 sm:-mt-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Draft cookie policy. Replace with your finalized legal copy before launch.
        </div>
      </main>
      <Footer />
    </div>
  )
}
