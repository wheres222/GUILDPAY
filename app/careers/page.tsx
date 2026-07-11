import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader eyebrow="Careers" title="Work with us" subtitle="Help build the future of commerce in Discord." />
      <main className="mx-auto -mt-16 max-w-3xl px-6 pb-24 sm:-mt-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          We&apos;re not hiring publicly right now — but we&apos;re always happy to hear from great people. Reach out via our Discord.
        </div>
      </main>
      <Footer />
    </div>
  )
}
