const DISCORD_API_BASE = "https://discord.com/api/v10"
const MANAGE_GUILD_BIT = BigInt(0x20)

type DiscordGuild = {
  id: string
  name: string
  icon: string | null
  permissions: string
}

export function hasManageGuildPermission(permissions: string) {
  try {
    const perms = BigInt(permissions)
    return (perms & MANAGE_GUILD_BIT) === MANAGE_GUILD_BIT
  } catch {
    return false
  }
}

export async function fetchManagedGuilds(userAccessToken: string): Promise<DiscordGuild[]> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch guilds (${response.status})`)
  }

  const guilds = (await response.json()) as DiscordGuild[]
  return guilds.filter((g) => hasManageGuildPermission(g.permissions))
}

export function buildBotInviteUrl(guildId?: string) {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || ""
  const permissions = process.env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS || "268823632"
  const base = new URL("https://discord.com/oauth2/authorize")

  base.searchParams.set("client_id", clientId)
  base.searchParams.set("scope", "bot applications.commands")
  base.searchParams.set("permissions", permissions)

  if (guildId) {
    base.searchParams.set("guild_id", guildId)
    base.searchParams.set("disable_guild_select", "true")
  }

  return base.toString()
}

export async function checkBotInstalledInGuild(guildId: string) {
  const botToken = process.env.DISCORD_TOKEN
  const botUserId = process.env.DISCORD_BOT_USER_ID || process.env.DISCORD_CLIENT_ID

  if (!botToken || !botUserId) return false

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${botUserId}`, {
    headers: {
      Authorization: `Bot ${botToken}`,
    },
    cache: "no-store",
  })

  return response.ok
}
