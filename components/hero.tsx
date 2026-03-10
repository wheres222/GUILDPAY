import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/discord-icon"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        {/* Coin images flanking the content */}
        <div className="relative flex items-center justify-center">
          {/* Bitcoin coin — left side */}
          <div className="pointer-events-none absolute -left-4 top-1/2 hidden -translate-y-1/2 lg:block xl:-left-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bitcoin-sv-bsv-glass-crypto-coin-3d-illustration-free-png%201-h2uAEPA4EKOnqtdfQkLzRitntUaYQO.png"
              alt="Bitcoin coin"
              width={220}
              height={220}
              className="drop-shadow-2xl"
              priority
            />
          </div>

          {/* Binance coin — right side, horizontally flipped */}
          <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block xl:-right-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/binance-coin-bnb-glass-crypto-coin-3d-illustration-free-png%201-kKGbxZDfNdcddns6WpIzwrhY1F0EQZ.png"
              alt="Binance coin"
              width={220}
              height={220}
              className="drop-shadow-2xl [transform:scaleX(-1)]"
              priority
            />
          </div>

          {/* Center content */}
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-sm font-sans font-medium backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Trusted by 10,000+ Discord servers</span>
            </div>

            {/* Headline — Plus Jakarta Sans Bold */}
            <h1
              className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Turn Your Discord Into a{" "}
              <span className="text-primary">
                Marketplace
              </span>
            </h1>

            {/* Subheadline — Inter Regular */}
            <p className="mx-auto mt-6 max-w-2xl text-pretty font-sans text-lg font-normal leading-relaxed text-muted-foreground lg:text-xl">
              The ultimate Discord bot for facilitating direct purchases, managing products,
              and creating seamless marketplace experiences within your server.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary font-sans font-medium text-primary-foreground hover:bg-primary/90"
              >
                <DiscordIcon className="mr-2 h-5 w-5" />
                Add to Discord
              </Button>
              <Button size="lg" variant="outline" className="border-border/60 font-sans font-medium">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
