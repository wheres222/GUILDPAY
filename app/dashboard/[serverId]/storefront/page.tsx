"use client"

import { Save, Eye, Palette, Layout, Type, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StorefrontPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Storefront
          </h1>
          <p className="mt-1 font-sans text-sm font-normal text-muted-foreground">
            Customize your public storefront appearance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/60">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Publish Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* Branding */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Branding
                  </CardTitle>
                  <CardDescription className="font-sans text-sm">
                    Upload your logo and banner
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm" className="border-border/60">
                    Upload Logo
                  </Button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                  Banner Image
                </label>
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                  <div className="text-center">
                    <Image className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 font-sans text-sm text-muted-foreground">
                      Drag and drop or click to upload
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Theme
                  </CardTitle>
                  <CardDescription className="font-sans text-sm">
                    Customize your storefront colors
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#3B82F6"
                      className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                    />
                    <input
                      type="text"
                      defaultValue="#3B82F6"
                      className="flex-1 rounded-lg border border-border/60 bg-card px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      defaultValue="#0F172A"
                      className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                    />
                    <input
                      type="text"
                      defaultValue="#0F172A"
                      className="flex-1 rounded-lg border border-border/60 bg-card px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-foreground">
                  Theme Mode
                </label>
                <div className="flex gap-2">
                  {["Light", "Dark", "System"].map((mode) => (
                    <button
                      key={mode}
                      className={`rounded-lg border px-4 py-2 font-sans text-sm transition-colors ${
                        mode === "Dark"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Layout className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Layout
                  </CardTitle>
                  <CardDescription className="font-sans text-sm">
                    Choose how products are displayed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {["Grid", "List", "Compact"].map((layout) => (
                  <button
                    key={layout}
                    className={`rounded-lg border p-4 text-center transition-colors ${
                      layout === "Grid"
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="mx-auto mb-2 h-12 w-12 rounded bg-muted" />
                    <span className="font-sans text-sm font-medium text-foreground">
                      {layout}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-6 border-border/60">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-primary/20" />
                  <div className="h-4 w-24 rounded bg-white/20" />
                </div>
                <div className="mb-4 h-20 rounded bg-white/10" />
                <div className="space-y-2">
                  <div className="h-16 rounded bg-white/5" />
                  <div className="h-16 rounded bg-white/5" />
                  <div className="h-16 rounded bg-white/5" />
                </div>
              </div>
              <Button className="mt-4 w-full" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Open Full Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
