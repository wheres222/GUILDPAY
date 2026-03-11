import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, PlusCircle } from "lucide-react"
import { auth } from "@/auth"
import { buildBotInviteUrl, checkBotInstalledInGuild, fetchManagedGuilds } from "@/lib/discord"
import { Button } from "@/components/ui/button"

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

export default async function SelectServerPage() {
  const session = await auth()
  if (!session?.accessToken || !session.user?.id) {
    redirect("/signin")
  }

  const guilds = await fetchManagedGuilds(session.accessToken)

  const guildsWithState = await Promise.all(
    guilds.slice(0, 50).map(async (guild) => ({
      ...guild,
      hasBot: await checkBotInstalledInGuild(guild.id),
    }))
  )

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Select a Server</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a server you manage. If the bot is not installed yet, add it first.
        </p>
      </div>

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
                      const ok = await setupServer(guild.id, guild.name, session.user.id)
                      if (ok) redirect(`/dashboard/${guild.id}`)
                    }}
                  >
                    <Button type="submit">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Continue
                    </Button>
                  </form>
                </>
              ) : (
                <Button asChild variant="outline">
                  <a href={buildBotInviteUrl(guild.id)} target="_blank" rel="noopener noreferrer">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Bot
                  </a>
                </Button>
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
        <Link href="/api/auth/signout?callbackUrl=/" className="text-muted-foreground hover:text-foreground">
          Sign out
        </Link>
      </div>
    </div>
  )
}
