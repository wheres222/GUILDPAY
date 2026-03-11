export function isDiscordOAuthConfigured() {
  const clientId = process.env.AUTH_DISCORD_ID || process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.AUTH_DISCORD_SECRET || process.env.DISCORD_CLIENT_SECRET
  const authSecret = process.env.AUTH_SECRET

  return Boolean(clientId && clientSecret && authSecret)
}
