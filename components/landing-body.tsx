import {
  Boxes,
  Zap,
  ShieldCheck,
  Wallet,
  Bot,
  Ticket,
  KeyRound,
  BarChart3,
} from "lucide-react"

/**
 * White body below the hero. Light, clean, placeholder content for now.
 */
const stats = [
  { value: "12K+", label: "Servers running stores" },
  { value: "$2.4M+", label: "Processed in crypto" },
  { value: "60s", label: "Average delivery time" },
]

const tiles = [
  { icon: KeyRound, name: "License Keys" },
  { icon: ShieldCheck, name: "Roles" },
  { icon: Bot, name: "Auto-Deliver" },
  { icon: BarChart3, name: "Analytics" },
  { icon: Wallet, name: "Payouts" },
  { icon: Ticket, name: "Tickets" },
  { icon: Boxes, name: "Inventory" },
  { icon: Zap, name: "Instant" },
]

export function LandingBody() {
  return (
    <section className="bg-white px-6 pb-24 pt-36 text-slate-900 lg:px-10 lg:pt-44">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <h2 className="-translate-x-6 whitespace-nowrap text-center text-2xl font-bold leading-tight tracking-tight sm:-translate-x-12 sm:text-3xl lg:text-5xl">
          Your store is fully automated and accessible from anywhere.
        </h2>

        {/* Stats */}
        <div className="mt-40 grid grid-cols-1 gap-12 sm:mt-56 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                {s.value}
              </div>
              <p className="mt-2 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Capability grid */}
        <div className="mt-16 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 sm:grid-cols-4">
          {tiles.map((t, i) => (
            <div
              key={t.name}
              className={`flex items-center justify-center gap-2 py-7 text-slate-900 ${
                i % 4 !== 3 ? "sm:border-r" : ""
              } border-slate-200 ${i < 4 ? "border-b" : ""}`}
            >
              <t.icon className="h-5 w-5" />
              <span className="font-semibold">{t.name}</span>
            </div>
          ))}
        </div>

        {/* Feature block */}
        <div className="mt-24 max-w-md">
          <h3 className="text-4xl font-bold tracking-tight">Instant Delivery</h3>
          <p className="mt-4 leading-relaxed text-slate-500">
            The moment a payment confirms on-chain, the buyer is sent their key,
            role, or file automatically — no manual work, day or night.
          </p>
        </div>
      </div>
    </section>
  )
}
