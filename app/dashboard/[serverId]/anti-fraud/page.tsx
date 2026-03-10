"use client"

import { Shield, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const recentFlags = [
  {
    id: "1",
    email: "suspicious@tempmail.com",
    reason: "Temporary email detected",
    severity: "high",
    date: "2 hours ago",
    status: "blocked",
  },
  {
    id: "2",
    email: "vpn.user@gmail.com",
    reason: "VPN/Proxy detected",
    severity: "medium",
    date: "5 hours ago",
    status: "flagged",
  },
  {
    id: "3",
    email: "multiple.cards@outlook.com",
    reason: "Multiple payment methods",
    severity: "low",
    date: "1 day ago",
    status: "reviewed",
  },
]

const stats = [
  { label: "Total Blocked", value: "127", change: "+12 this week" },
  { label: "Flagged Orders", value: "45", change: "+5 this week" },
  { label: "False Positives", value: "8", change: "-2 this week" },
  { label: "Fraud Rate", value: "2.3%", change: "-0.5% this month" },
]

export default function AntiFraudPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Anti-Fraud
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            Protect your marketplace from fraudulent activity
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Shield className="mr-2 h-4 w-4" />
          Configure Rules
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-6">
              <p className="font-sans text-sm text-muted-foreground">{stat.label}</p>
              <p
                className="mt-1 text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 font-sans text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fraud rules */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Active Rules
              </CardTitle>
              <CardDescription className="font-sans text-sm">
                Fraud detection rules currently in effect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "VPN/Proxy Detection",
                  description: "Block orders from VPN or proxy connections",
                  enabled: true,
                  action: "Block",
                },
                {
                  name: "Temporary Email",
                  description: "Flag orders using disposable email addresses",
                  enabled: true,
                  action: "Flag",
                },
                {
                  name: "Multiple Accounts",
                  description: "Detect users with multiple accounts",
                  enabled: true,
                  action: "Flag",
                },
                {
                  name: "High-Risk Countries",
                  description: "Extra verification for orders from high-risk regions",
                  enabled: false,
                  action: "Verify",
                },
                {
                  name: "Velocity Check",
                  description: "Limit purchase frequency per user",
                  enabled: true,
                  action: "Block",
                },
              ].map((rule) => (
                <div
                  key={rule.name}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        rule.enabled ? "bg-green-500/10" : "bg-muted"
                      }`}
                    >
                      <Shield
                        className={`h-5 w-5 ${
                          rule.enabled ? "text-green-600" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-medium text-foreground">
                        {rule.name}
                      </h4>
                      <p className="font-sans text-xs text-muted-foreground">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${
                        rule.action === "Block"
                          ? "bg-red-500/10 text-red-600"
                          : rule.action === "Flag"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {rule.action}
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        defaultChecked={rule.enabled}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-card after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent flags */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recent Flags
              </CardTitle>
              <CardDescription className="font-sans text-sm">
                Latest suspicious activity detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          flag.severity === "high"
                            ? "bg-red-500/10"
                            : flag.severity === "medium"
                            ? "bg-yellow-500/10"
                            : "bg-blue-500/10"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            flag.severity === "high"
                              ? "text-red-600"
                              : flag.severity === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium text-foreground">
                          {flag.email}
                        </p>
                        <p className="font-sans text-xs text-muted-foreground">
                          {flag.reason} • {flag.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${
                          flag.status === "blocked"
                            ? "bg-red-500/10 text-red-600"
                            : flag.status === "flagged"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {flag.status === "blocked" ? (
                          <XCircle className="h-3 w-3" />
                        ) : flag.status === "flagged" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {flag.status}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-green-600">
                    Protected
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    5 rules active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-border/60">
                View Blocked Users
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/60">
                Review Flagged Orders
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/60">
                Export Fraud Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
