import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomizeClient } from "./customize-client"

export default async function StorefrontPage({ params }: { params: Promise<{ serverId: string }> }) {
  await params

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Storefront
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize your store branding and preview how your bot&apos;s panels look in Discord.
          </p>
        </div>
        <div className="flex gap-2">
          <Button disabled className="bg-primary text-primary-foreground">
            <Save className="mr-2 h-4 w-4" />
            Publish (soon)
          </Button>
        </div>
      </div>

      <CustomizeClient />
    </div>
  )
}
