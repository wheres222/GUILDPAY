import Link from "next/link"
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/discord-icon"
import { isDiscordOAuthConfigured } from "@/lib/auth-config"
import { computeReadiness } from "@/lib/readiness"

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  const callbackUrl = params?.callbackUrl || "/select-server"
  const oauthConfigured = isDiscordOAuthConfigured()
  const readiness = await computeReadiness()
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
          {oauthConfigured ? (
            <form
              action={async () => {
                "use server"
                await signIn("discord", { redirectTo: callbackUrl })
              }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#5865F2] font-sans font-medium text-white hover:bg-[#4752c4]"
              >
                <DiscordIcon className="mr-2 h-5 w-5" />
                Continue with Discord
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Discord OAuth is not configured yet. You can still continue in demo mode until env values are set.
              </div>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href="/select-server?demo=1">Continue in Demo Mode</Link>
              </Button>
            </div>
          )}

          {readiness.notes.length ? (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              <p className="font-medium">Readiness checks:</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {readiness.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-300">
              OAuth and API readiness checks passed.
            </div>
          )}

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
