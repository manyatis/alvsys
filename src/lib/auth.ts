import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AppleProvider from "next-auth/providers/apple"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@/generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

//if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        (session.user as typeof session.user & { id: string }).id = user.id
      }
      return session
    },
    async signIn({ user }) {
      // New users automatically get FREE tier via database defaults
      // No need to explicitly assign - Prisma schema defaults handle this
      if (user?.id) {
        console.log(`User signed in: ${user.id} (will default to FREE tier)`)
      }
      return true
    },
  },
  pages: {
    signIn: '/',
  },
}