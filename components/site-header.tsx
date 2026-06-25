import Link from "next/link"

/** Blue hero band with the landing nav + a centered page title. */
export function SiteHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <header className="relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(31,134,230,0.55), rgba(58,163,244,0.3)), url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
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

      <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-10 text-center sm:pb-32 sm:pt-16">
        {eyebrow ? (
          <span className="text-sm font-semibold uppercase tracking-wide text-white/80">{eyebrow}</span>
        ) : null}
        <h1
          className="mt-2 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {subtitle ? <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-white/85 sm:text-lg">{subtitle}</p> : null}
      </div>
    </header>
  )
}
