import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AppleProvider from "next-auth/providers/apple"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@/generated/prisma"
import { SubscriptionService } from "@/services/subscription-service"

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
      // Check if this is a new user and assign PROFESSIONAL subscription
      if (user?.id) {
        try {
          // Initialize subscription system if needed
          await SubscriptionService.initializeSubscriptionSystem()
          
          // Assign PROFESSIONAL subscription to the user
          await SubscriptionService.assignProfessionalSubscription(user.id)
          
          console.log(`Assigned PROFESSIONAL subscription to user: ${user.id}`)
        } catch (error) {
          console.error('Error assigning subscription to user:', error)
          // Don't block sign-in if subscription assignment fails
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/',
  },
}