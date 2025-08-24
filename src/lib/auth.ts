import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AppleProvider from "next-auth/providers/apple"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

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
  // Allow account linking
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        // Fetch full user data including subscription info
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            organizationId: true,
            plan: true,
          }
        });
        
        if (fullUser) {
          const extendedUser = session.user as {
            id?: string;
            subscriptionTier?: string;
            subscriptionStatus?: string | null;
            organizationId?: string | null;
            plan?: string;
          };
          extendedUser.id = fullUser.id;
          extendedUser.subscriptionTier = fullUser.subscriptionTier;
          extendedUser.subscriptionStatus = fullUser.subscriptionStatus;
          extendedUser.organizationId = fullUser.organizationId;
          extendedUser.plan = fullUser.plan;
        }
      }
      return session
    },
    async signIn({ user }) { // account, profile unused
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