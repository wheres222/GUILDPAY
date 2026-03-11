import { auth } from "@/auth"
import { apiFetch } from "@/lib/backend-api"

type SetupResponse = {
  success: boolean
  guildId: string
  sellerId: string
  plan: {
    label: string
    feeRate: number
    monthlyPriceUsd: number
  }
}

export async function resolveDashboardContext(discordGuildId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      session,
      sellerId: null as string | null,
      guildId: null as string | null,
      error: "Not authenticated. Sign in with Discord to load live data.",
    }
  }

  try {
    const setup = await apiFetch<SetupResponse>("/setup", {
      method: "POST",
      body: JSON.stringify({
        discordGuildId,
        guildName: `Guild ${discordGuildId}`,
        discordUserId: session.user.id,
      }),
    })

    return {
      session,
      sellerId: setup.sellerId,
      guildId: setup.guildId,
      error: null as string | null,
    }
  } catch {
    return {
      session,
      sellerId: null as string | null,
      guildId: null as string | null,
      error: "Could not reach backend API. Check NEXT_PUBLIC_API_BASE_URL.",
    }
  }
}
