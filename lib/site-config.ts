const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || ""
const permissions = process.env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS || "268823632"

const defaultInviteUrl = clientId
  ? `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=${permissions}`
  : "https://discord.com/oauth2/authorize"

export const siteConfig = {
  appName: "Guild Pay",
  discordInviteUrl: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || defaultInviteUrl,
  docsUrl: "/docs",
}
