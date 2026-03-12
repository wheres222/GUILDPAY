import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/backend-api"
import { resolveDashboardContext } from "@/lib/dashboard-context"

type WebhookEventsResponse = {
  success: boolean
  events: Array<{
    id: string
    provider: string
    eventId: string
    eventType?: string | null
    status: string
    orderId?: string | null
    failureReason?: string | null
    receivedAt: string
    processedAt?: string | null
  }>
}

export default async function WebhooksPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const ctx = await resolveDashboardContext(serverId)

  let events: WebhookEventsResponse["events"] = []
  let error: string | null = ctx.error

  if (ctx.sellerId) {
    try {
      const res = await apiFetch<WebhookEventsResponse>(`/webhooks/events?sellerId=${ctx.sellerId}&limit=50`)
      events = res.events
    } catch {
      error = "Could not load webhook event logs."
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Webhook Events
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provider event processing timeline (received, verified, processed, failed).
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      ) : null}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.length ? (
            events.map((event) => (
              <div key={event.id} className="rounded-lg border border-border/50 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-xs text-primary">{event.eventId}</p>
                  <p className="text-xs text-muted-foreground">{new Date(event.receivedAt).toLocaleString()}</p>
                </div>

                <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-4">
                  <p>Provider: <span className="font-medium text-foreground">{event.provider}</span></p>
                  <p>Status: <span className="font-medium text-foreground">{event.status}</span></p>
                  <p>Type: <span className="font-medium text-foreground">{event.eventType || "-"}</span></p>
                  <p>Order: <span className="font-mono text-foreground">{event.orderId || "-"}</span></p>
                </div>

                {event.failureReason ? (
                  <p className="mt-2 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300">
                    Failure: {event.failureReason}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No webhook events yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
