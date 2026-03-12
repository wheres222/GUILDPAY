import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, PlusCircle } from "lucide-react"
import { auth, signOut } from "@/auth"
import { buildBotInviteUrl, checkBotInstalledInGuild, fetchManagedGuilds } from "@/lib/discord"
import { Button } from "@/components/ui/button"
import { isDiscordOAuthConfigured } from "@/lib/auth-config"

export const dynamic = "force-dynamic"

async function setupServer(guildId: string, guildName: string, discordUserId: string) {
  const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"

  const response = await fetch(`${apiBase}/setup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      discordGuildId: guildId,
      guildName,
      discordUserId,
    }),
    cache: "no-store",
  })

  return response.ok
}

export default async function SelectServerPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; demo?: string; confirmGuild?: string }>
}) {
  const params = await searchParams
  const setupError = params?.error
  const demoMode = params?.demo === "1"
  const confirmGuild = params?.confirmGuild
  const oauthConfigured = isDiscordOAuthConfigured()

  const session = await auth()
  const hasSession = Boolean(session?.accessToken && session.user?.id)
  if (!hasSession && oauthConfigured && !demoMode) {
    redirect("/signin")
  }

  const demoGuilds = [
    { id: "demo-1", name: "Demo Storefront", icon: null, permissions: "0", hasBot: true },
    { id: "demo-2", name: "Demo Community", icon: null, permissions: "0", hasBot: false },
  ]

  const currentUserId = session?.user?.id || "demo-user"

  let guildsWithState: Array<{
    id: string
    name: string
    icon: string | null
    permissions: string
    hasBot: boolean
  }> = []
  let guildsError: string | null = null

  if (hasSession) {
    try {
      const guilds = await fetchManagedGuilds(session!.accessToken as string)
      guildsWithState = await Promise.all(
        guilds.slice(0, 50).map(async (guild) => ({
          ...guild,
          hasBot: await checkBotInstalledInGuild(guild.id),
        }))
      )
    } catch {
      guildsError =
        "Could not load Discord servers. Ensure OAuth scopes and env variables are configured correctly."
    }
  } else {
    guildsWithState = demoGuilds
    guildsError = oauthConfigured
      ? "No active auth session found. Continue in demo mode or sign in again."
      : "OAuth not configured yet. Running in demo mode until env values are set."
  }

  let confirmMessage: string | null = null

  if (confirmGuild && hasSession) {
    const guild = guildsWithState.find((entry) => entry.id === confirmGuild)

    if (guild) {
      const ok = await setupServer(guild.id, guild.name, currentUserId)
      if (ok) {
        redirect(`/dashboard/${guild.id}`)
      }
      redirect(`/select-server?error=${encodeURIComponent(`setup_failed:${guild.id}`)}`)
    }

    confirmMessage = "Server not found in your managed guild list. Refresh and try again."
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Select a Server</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a server you manage. If the bot is not installed yet, add it first.
        </p>
      </div>

      {setupError ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Setup failed for one server. Check backend API URL and try again.
        </div>
      ) : null}

      {guildsError ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {guildsError}
        </div>
      ) : null}

      {confirmMessage ? (
        <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
          {confirmMessage}
        </div>
      ) : null}

      <div className="space-y-3">
        {guildsWithState.map((guild) => (
          <div
            key={guild.id}
            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {guild.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-foreground">{guild.name}</p>
                <p className="text-xs text-muted-foreground">Guild ID: {guild.id}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {guild.hasBot ? (
                <>
                  <form
                    action={async () => {
                      "use server"
                      if (!hasSession) {
                        redirect(`/dashboard/${guild.id}`)
                      }

                      const ok = await setupServer(guild.id, guild.name, currentUserId)
                      if (ok) {
                        redirect(`/dashboard/${guild.id}`)
                      }

                      redirect(`/select-server?error=${encodeURIComponent(`setup_failed:${guild.id}`)}`)
                    }}
                  >
                    <Button type="submit">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Continue
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <a href={buildBotInviteUrl(guild.id)} target="_blank" rel="noopener noreferrer">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Bot
                    </a>
                  </Button>

                  <Button asChild>
                    <Link href={`/select-server?confirmGuild=${encodeURIComponent(guild.id)}`}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Added
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {guildsWithState.length === 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
          No manageable servers found. Make sure you have &quot;Manage Server&quot; permissions.
        </div>
      )}

      <div className="mt-8 flex items-center justify-between text-sm">
        <Link href="/signin" className="text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button type="submit" className="text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
