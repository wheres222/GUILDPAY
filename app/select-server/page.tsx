import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, PlusCircle, RefreshCw } from "lucide-react"
import { auth } from "@/auth"
import { buildBotInviteUrl, checkBotInstalledViaApi, fetchManagedGuilds } from "@/lib/discord"
import { Button } from "@/components/ui/button"
import { isDiscordOAuthConfigured } from "@/lib/auth-config"

export const dynamic = "force-dynamic"

function guildIconUrl(guildId: string, icon: string | null) {
  if (!icon) return null
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.png?size=256`
}

export default async function SelectServerPage({
  searchParams,
}: {
  searchParams?: Promise<{ demo?: string }>
}) {
  const params = await searchParams
  const demoMode = params?.demo === "1"
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
        guilds.slice(0, 100).map(async (guild) => ({
          ...guild,
          hasBot: await checkBotInstalledViaApi(guild.id),
        }))
      )
    } catch {
      guildsError = "Could not load Discord servers. Reconnect Discord permissions and retry."
    }
  } else {
    guildsWithState = demoGuilds
    guildsError = oauthConfigured
      ? "No active auth session found. Continue in demo mode or sign in again."
      : "OAuth not configured yet. Running in demo mode until env values are set."
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Select a server</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage servers where you have <span className="font-medium">Manage Server</span> permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/select-server">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh status
            </Link>
          </Button>
        </div>
      </div>

      {guildsError ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {guildsError}
          <div className="mt-2">
            <Link href="/signin?callbackUrl=%2Fselect-server&force=1" className="text-amber-100 underline hover:text-white">
              Reconnect Discord permissions
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {guildsWithState.map((guild) => {
          const iconUrl = guildIconUrl(guild.id, guild.icon)

          return (
            <div key={guild.id} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                {iconUrl ? (
                  <Image src={iconUrl} alt={guild.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 280px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary/70">
                    {guild.name.charAt(0)}
                  </div>
                )}
              </div>

              <p className="truncate text-sm font-semibold text-foreground">{guild.name}</p>
              <p className="mb-3 text-xs text-muted-foreground">Guild ID: {guild.id}</p>

              {guild.hasBot ? (
                <Button asChild className="w-full">
                  <Link href={`/dashboard/${guild.id}`}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Manage
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <a href={buildBotInviteUrl(guild.id)} target="_blank" rel="noopener noreferrer">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Bot
                  </a>
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {guildsWithState.length === 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
          No manageable servers found.
        </div>
      )}

      <div className="mt-8 flex items-center justify-between text-sm">
        <Link href="/signin" className="text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Back to home
        </Link>
      </div>
    </div>
  )
}
