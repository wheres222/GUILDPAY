import { auth } from "@/auth"
import { fetchManagedGuilds } from "@/lib/discord"
import { DashboardShell } from "./dashboard-shell"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ serverId: string }>
}) {
  const { serverId } = await params

  // Resolve the human-readable server name from the user's Discord guild list
  // so the sidebar shows the real name instead of the raw guild id.
  let serverName = `Server ${serverId}`
  try {
    const session = await auth()
    if (session?.accessToken) {
      const guilds = await fetchManagedGuilds(session.accessToken as string)
      const match = guilds.find((g) => g.id === serverId)
      if (match?.name) serverName = match.name
    }
  } catch {
    // Keep the fallback name if Discord can't be reached.
  }

  return (
    <DashboardShell serverId={serverId} serverName={serverName}>
      {children}
    </DashboardShell>
  )
}
