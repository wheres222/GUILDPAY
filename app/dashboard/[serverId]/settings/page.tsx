"use client"

import { Save, Bell, Shield, Globe, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Settings
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            Configure your server marketplace settings
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* General settings */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  General
                </CardTitle>
                <CardDescription className="font-sans text-sm">
                  Basic marketplace configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                Store Name
              </label>
              <input
                type="text"
                defaultValue="Crypto Trading Hub Store"
                className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                Store Description
              </label>
              <textarea
                rows={3}
                defaultValue="Your one-stop shop for digital products and gaming licenses."
                className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                Currency
              </label>
              <select className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>BTC (₿)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payment settings */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Payment Methods
                </CardTitle>
                <CardDescription className="font-sans text-sm">
                  Configure accepted payment methods
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Stripe", enabled: true },
              { name: "PayPal", enabled: true },
              { name: "Cryptocurrency", enabled: false },
              { name: "Manual Payment", enabled: false },
            ].map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-between rounded-lg border border-border/60 p-4"
              >
                <span className="font-sans text-sm font-medium text-foreground">
                  {method.name}
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked={method.enabled}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-card after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notification settings */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Notifications
                </CardTitle>
                <CardDescription className="font-sans text-sm">
                  Configure how you receive notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "New Orders", description: "Get notified when a new order is placed", enabled: true },
              { name: "Low Stock Alerts", description: "Alert when product stock is low", enabled: true },
              { name: "Payment Received", description: "Notify when payment is confirmed", enabled: true },
              { name: "Customer Messages", description: "Alert for new customer inquiries", enabled: false },
            ].map((notification) => (
              <div
                key={notification.name}
                className="flex items-center justify-between rounded-lg border border-border/60 p-4"
              >
                <div>
                  <span className="font-sans text-sm font-medium text-foreground">
                    {notification.name}
                  </span>
                  <p className="font-sans text-xs text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked={notification.enabled}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-card after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security settings */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Security
                </CardTitle>
                <CardDescription className="font-sans text-sm">
                  Protect your marketplace from fraud
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "VPN Detection", description: "Block orders from VPN/Proxy users", enabled: true },
              { name: "Email Verification", description: "Require email verification for purchases", enabled: false },
              { name: "Rate Limiting", description: "Limit purchase attempts per user", enabled: true },
            ].map((security) => (
              <div
                key={security.name}
                className="flex items-center justify-between rounded-lg border border-border/60 p-4"
              >
                <div>
                  <span className="font-sans text-sm font-medium text-foreground">
                    {security.name}
                  </span>
                  <p className="font-sans text-xs text-muted-foreground">
                    {security.description}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked={security.enabled}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-card after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
