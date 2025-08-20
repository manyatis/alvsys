import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email: string
  organizationId?: string
}

/**
 * Get authenticated user from middleware headers (for server components)
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userEmail = headersList.get('x-user-email')
  const orgId = headersList.get('x-user-org-id')

  if (!userId || !userEmail) {
    return null
  }

  return {
    id: userId,
    email: userEmail,
    organizationId: orgId || undefined
  }
}

/**
 * Get authenticated user from request headers (for API routes)
 */
export function getAuthenticatedUserFromRequest(request: NextRequest): AuthenticatedUser | null {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')
  const orgId = request.headers.get('x-user-org-id')

  if (!userId || !userEmail) {
    return null
  }

  return {
    id: userId,
    email: userEmail,
    organizationId: orgId || undefined
  }
}

/**
 * Verify user has access to a project
 */
export async function verifyProjectAccess(userId: string, projectId: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma')
  
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { users: { some: { userId } } }
      ]
    }
  })

  return !!project
}

/**
 * Get user's accessible projects
 */
export async function getUserAccessibleProjects(userId: string) {
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { users: { some: { userId } } }
      ]
    },
    include: {
      organization: {
        select: { id: true, name: true }
      },
      owner: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { cards: true }
      }
    }
  })
}