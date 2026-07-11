import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader eyebrow="Changelog" title="What's new" subtitle="Release notes and platform updates." />
      <main className="mx-auto -mt-16 max-w-3xl px-6 pb-24 sm:-mt-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Updates and release notes will appear here as we ship them.
        </div>
      </main>
      <Footer />
    </div>
  )
}
