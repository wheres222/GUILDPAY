import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * AstroNote-style hero: vibrant purple sky with soft clouds along the bottom
 * that fade into the white body below, an elegant serif-italic accent line, and
 * a product mockup card overlapping the seam. Uses explicit colors (not theme
 * tokens) so it stays light regardless of the app's dark theme.
 */
export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* Blue hero artwork + a top tint so the white headline stays legible. */}
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(31,134,230,0.45), rgba(58,163,244,0.18) 42%, rgba(255,255,255,0) 72%), url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Fade into the white body below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-b from-transparent to-white" />

      {/* Top nav */}
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Guild Pay
        </Link>
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm font-medium text-white/90 sm:flex">
          <Link href="/features" className="transition-colors hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-white">
            Pricing
          </Link>
        </div>
        <Link
          href="/signin"
          className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero copy */}
      <div className="relative mx-auto max-w-3xl px-6 pt-16 text-center sm:pt-24">
        <h1 className="text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Turn Your Discord
          <span
            className="my-1 block text-4xl font-normal italic sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            into a marketplace
          </span>
          Instantly
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-medium leading-relaxed text-white/80 sm:text-lg">
          Accept crypto payments and deliver products automatically — all inside
          your server, no external checkout.
        </p>

        <div className="mt-9 flex justify-center">
          <Link
            href="/signin"
            className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-6 text-base font-semibold text-slate-900 shadow-lg shadow-sky-900/20 transition-transform hover:scale-[1.02]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f8fef] text-white">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            Get Started
          </Link>
        </div>
      </div>

      {/* Product demo video overlapping the seam into white */}
      <div className="relative mx-auto mt-16 max-w-3xl px-6 pb-0">
        <div className="-mb-24 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl shadow-sky-950/20 sm:-mb-28">
          <video
            src="/hero-demo.mp4"
            poster="/hero-demo-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            className="block w-full"
          />
        </div>
      </div>
    </section>
  )
}
