import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/discord-icon"
import { siteConfig } from "@/lib/site-config"

export function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center sm:p-12 lg:p-16">
          {/* Subtle inner light */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-white/5 blur-3xl" />
          </div>

          <h2
            className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Transform Your Discord Server?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty font-sans text-lg font-normal text-primary-foreground/80">
            Join thousands of Discord servers already using Guild Pay to power their digital marketplace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-white font-sans font-medium text-primary hover:bg-white/90"
            >
              <a href={siteConfig.discordInviteUrl} target="_blank" rel="noopener noreferrer">
                <DiscordIcon className="mr-2 h-5 w-5" />
                Add to Discord
              </a>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="font-sans font-medium text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
