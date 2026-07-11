import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader eyebrow="Legal" title="Privacy Policy" subtitle="How we collect, use, and protect your data." />
      <main className="mx-auto -mt-16 max-w-3xl px-6 pb-24 sm:-mt-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Draft privacy policy. Replace with your finalized legal copy before launch.
        </div>
      </main>
      <Footer />
    </div>
  )
}
