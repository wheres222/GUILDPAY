"use client"

import { Plus, Webhook, MoreHorizontal, Edit, Trash2, Copy, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const webhooks = [
  {
    id: "1",
    name: "Order Notifications",
    url: "https://api.mysite.com/webhooks/orders",
    events: ["order.created", "order.completed"],
    status: "Active",
    lastTriggered: "2 hours ago",
  },
  {
    id: "2",
    name: "Payment Alerts",
    url: "https://api.mysite.com/webhooks/payments",
    events: ["payment.received", "payment.failed"],
    status: "Active",
    lastTriggered: "5 hours ago",
  },
  {
    id: "3",
    name: "Inventory Updates",
    url: "https://api.mysite.com/webhooks/inventory",
    events: ["product.stock_low", "product.out_of_stock"],
    status: "Inactive",
    lastTriggered: "3 days ago",
  },
]

const eventTypes = [
  { category: "Orders", events: ["order.created", "order.completed", "order.cancelled", "order.refunded"] },
  { category: "Payments", events: ["payment.received", "payment.failed", "payment.pending"] },
  { category: "Products", events: ["product.created", "product.updated", "product.stock_low", "product.out_of_stock"] },
  { category: "Customers", events: ["customer.created", "customer.updated"] },
]

export default function WebhooksPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Webhooks
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            Configure webhooks to receive real-time notifications
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      {/* Webhooks list */}
      <div className="mb-8 space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="border-border/60">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Webhook className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans text-sm font-medium text-foreground">
                        {webhook.name}
                      </h3>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-xs font-medium ${
                          webhook.status === "Active"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {webhook.status === "Active" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {webhook.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                        {webhook.url}
                      </code>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="rounded bg-secondary px-2 py-0.5 font-sans text-xs text-secondary-foreground"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 font-sans text-xs text-muted-foreground">
                      Last triggered: {webhook.lastTriggered}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available events */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Available Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {eventTypes.map((category) => (
              <div key={category.category}>
                <h4 className="mb-2 font-sans text-sm font-medium text-foreground">
                  {category.category}
                </h4>
                <div className="space-y-1">
                  {category.events.map((event) => (
                    <code
                      key={event}
                      className="block rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {event}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
