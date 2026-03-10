import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/discord-icon"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-md px-4">
        <div className="mb-8 text-center">
          {/* Logo placeholder */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" />
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign in to Guild Pay
          </h1>
          <p className="mt-2 font-sans text-sm font-normal text-muted-foreground">
            Connect your Discord account to manage your marketplace
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <Link href="/select-server">
            <Button
              size="lg"
              className="w-full bg-[#5865F2] font-sans font-medium text-white hover:bg-[#4752c4]"
            >
              <DiscordIcon className="mr-2 h-5 w-5" />
              Continue with Discord
            </Button>
          </Link>

          <p className="mt-4 text-center font-sans text-xs font-normal text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center font-sans text-sm font-normal text-muted-foreground">
          {"Don't have a Discord account? "}
          <a
            href="https://discord.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}
