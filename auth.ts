import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"

const discordClientId = process.env.AUTH_DISCORD_ID || process.env.DISCORD_CLIENT_ID || ""
const discordClientSecret = process.env.AUTH_DISCORD_SECRET || process.env.DISCORD_CLIENT_SECRET || ""

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Discord({
      clientId: discordClientId,
      clientSecret: discordClientSecret,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) token.accessToken = account.access_token
      if (profile && "id" in profile) token.discordId = String(profile.id)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.discordId as string) || token.sub || ""
      }
      session.accessToken = token.accessToken as string | undefined
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/select-server`
    },
  },
})
