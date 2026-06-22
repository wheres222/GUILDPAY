import Link from "next/link"
import { Eye, Image as ImageIcon, Layout, Palette, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DiscordMessage, type Embed, type ActionRow } from "@/components/discord-embed"
import { storefrontResponse, type PreviewProduct } from "@/lib/preview-embeds"

const SAMPLE_PRODUCTS: PreviewProduct[] = [
  {
    id: "p1",
    name: "Premium License Key",
    description: "Lifetime activation key, delivered instantly via DM.",
    price_amount: 4.99,
    price_currency: "USD",
    category: "Digital",
  },
  {
    id: "p2",
    name: "VIP Membership (30 days)",
    description: "Get the @VIP role with perks for a month.",
    price_amount: 9.99,
    price_currency: "USD",
    category: "Subscription",
  },
]

export default async function StorefrontPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const store = storefrontResponse(SAMPLE_PRODUCTS).data as {
    embeds?: Embed[]
    components?: ActionRow[]
    content?: string
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Storefront
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Branding UI is visible, but publishing custom storefront themes is not active in MVP backend yet.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled className="border-border/60">
            <Eye className="mr-2 h-4 w-4" />
            Preview (soon)
          </Button>
          <Button disabled className="bg-primary text-primary-foreground">
            <Save className="mr-2 h-4 w-4" />
            Publish (soon)
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Branding</CardTitle>
                  <CardDescription>Logo/banner customization hooks are prepared for Phase 2 backend.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" disabled className="w-full justify-start border-border/60">
                Upload logo (soon)
              </Button>
              <Button variant="outline" disabled className="w-full justify-start border-border/60">
                Upload banner (soon)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Theme</CardTitle>
                  <CardDescription>Theme editor will be enabled after storefront API contracts are finalized.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" disabled className="w-full justify-start border-border/60">
                Primary color editor (soon)
              </Button>
              <Button variant="outline" disabled className="w-full justify-start border-border/60">
                Background color editor (soon)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Layout className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Layout</CardTitle>
                  <CardDescription>Use product panels in Discord now; storefront templates come next.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="border-border/60">
                <Link href={`/dashboard/${serverId}/products`}>Go to Products & Panels</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Live preview</CardTitle>
                  <CardDescription>An example of the storefront embed your bot posts in Discord.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg">
                <DiscordMessage
                  embeds={store.embeds}
                  components={store.components}
                  content={store.content}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
