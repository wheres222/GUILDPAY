import { getApiBaseUrl } from "@/lib/backend-api"
import { isDiscordOAuthConfigured } from "@/lib/auth-config"

export type ReadinessState = {
  oauthConfigured: boolean
  apiBaseConfigured: boolean
  apiReachable: boolean
  apiHealthStatus: number | null
  inviteConfigured: boolean
  notes: string[]
}

export async function computeReadiness(): Promise<ReadinessState> {
  const notes: string[] = []
  const oauthConfigured = isDiscordOAuthConfigured()
  const apiBase = getApiBaseUrl()
  const apiBaseConfigured = Boolean(apiBase)
  const inviteConfigured = Boolean(process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim())

  let apiReachable = false
  let apiHealthStatus: number | null = null

  if (apiBaseConfigured) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`${apiBase}/health`, { cache: "no-store", signal: controller.signal })
      clearTimeout(timeout)
      apiHealthStatus = res.status
      apiReachable = res.ok
    } catch {
      apiReachable = false
      apiHealthStatus = null
    }
  }

  if (!oauthConfigured) {
    notes.push("Discord OAuth env values are missing or invalid.")
  }

  if (!apiReachable) {
    notes.push("Backend API is not reachable at the configured NEXT_PUBLIC_API_BASE_URL.")
  }

  if (!inviteConfigured) {
    notes.push("Discord invite URL is not configured.")
  }

  return {
    oauthConfigured,
    apiBaseConfigured,
    apiReachable,
    apiHealthStatus,
    inviteConfigured,
    notes,
  }
}
