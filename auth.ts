import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
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
  },
})
