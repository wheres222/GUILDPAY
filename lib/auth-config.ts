const envTrim = (value?: string) => (value || "").trim()

export function isDiscordOAuthConfigured() {
  const clientId = envTrim(process.env.AUTH_DISCORD_ID || process.env.DISCORD_CLIENT_ID)
  const clientSecret = envTrim(process.env.AUTH_DISCORD_SECRET || process.env.DISCORD_CLIENT_SECRET)
  const authSecret = envTrim(process.env.AUTH_SECRET)

  return Boolean(clientId && clientSecret && authSecret)
}
