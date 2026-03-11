import { auth, signOut } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/discord-icon"
import { resolveDashboardContext } from "@/lib/dashboard-context"

export default async function AccountPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const session = await auth()
  const ctx = await resolveDashboardContext(serverId)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Identity and access details for your seller account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>Read-only data from your current auth session.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                Name: <span className="font-medium text-foreground">{session?.user?.name || "Unknown"}</span>
              </p>
              <p>
                Email: <span className="font-medium text-foreground">{session?.user?.email || "-"}</span>
              </p>
              <p>
                User ID: <span className="font-mono text-foreground">{session?.user?.id || "-"}</span>
              </p>
              <p>
                Seller ID: <span className="font-mono text-foreground">{ctx.sellerId || "-"}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Connected Account</CardTitle>
              <CardDescription>Discord OAuth session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2]/10">
                    <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Discord</p>
                    <p className="text-xs text-muted-foreground">Connected via Auth.js OAuth</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">Connected</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>MVP account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" disabled className="w-full justify-start border-border/60">
                Two-factor auth setup (coming soon)
              </Button>
              <Button variant="outline" disabled className="w-full justify-start border-border/60">
                API key management (coming soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Server: <span className="font-mono text-foreground">{serverId}</span>
              </p>
              <p>
                Access token: <span className="text-foreground">{session?.accessToken ? "present" : "missing"}</span>
              </p>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button type="submit" variant="outline" className="w-full border-border/60">
                  Sign out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
