"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/discord-icon"

export function DiscordSignInButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <Button
      size="lg"
      className="w-full bg-[#5865F2] font-sans font-medium text-white hover:bg-[#4752c4]"
      onClick={() => signIn("discord", { redirectTo: callbackUrl })}
    >
      <DiscordIcon className="mr-2 h-5 w-5" />
      Continue with Discord
    </Button>
  )
}
