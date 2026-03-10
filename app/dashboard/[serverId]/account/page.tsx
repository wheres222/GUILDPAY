"use client"

import { Save, User, Shield, Key, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DiscordIcon } from "@/components/discord-icon"

export default function AccountPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Account
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Profile
                  </CardTitle>
                  <CardDescription className="font-sans text-sm">
                    Your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  U
                </div>
                <Button variant="outline" size="sm" className="border-border/60">
                  Change Avatar
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue="CryptoTrader"
                    className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="user@example.com"
                    className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 font-sans text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected accounts */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Connected Accounts
                  </CardTitle>
                  <CardDescription className="font-sans text-sm">
                    Manage your connected services
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2]/10">
                    <DiscordIcon className="h-5 w-5 text-[#5865F2]" />
                  </div>
                  <div>
                    <span className="font-sans text-sm font-medium text-foreground">
                      Discord
                    </span>
                    <p className="font-sans text-xs text-muted-foreground">
                      Connected as CryptoTrader#1234
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 font-sans text-xs font-medium text-green-600">
                  Connected
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
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
                    Protect your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div>
                  <span className="font-sans text-sm font-medium text-foreground">
                    Two-Factor Authentication
                  </span>
                  <p className="font-sans text-xs text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-border/60">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div>
                  <span className="font-sans text-sm font-medium text-foreground">
                    API Keys
                  </span>
                  <p className="font-sans text-xs text-muted-foreground">
                    Manage API keys for integrations
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-border/60">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account info */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-sans text-sm text-muted-foreground">Plan</span>
                <span className="font-sans text-sm font-medium text-foreground">Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-sm text-muted-foreground">Member since</span>
                <span className="font-sans text-sm font-medium text-foreground">Jan 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-sm text-muted-foreground">Servers</span>
                <span className="font-sans text-sm font-medium text-foreground">3 active</span>
              </div>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold text-destructive"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 font-sans text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
