import { NextRequest } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface ApiUser {
  id: string;
  email: string | null;
  name: string | null;
  organizationId: string | null;
}

export async function validateApiKey(request: NextRequest): Promise<ApiUser | null> {
  try {
    // Check for API key in Authorization header
    const authHeader = request.headers.get('authorization');
    let apiKey: string | null = null;

    if (authHeader) {
      // Support both "Bearer <key>" and "ApiKey <key>" formats
      if (authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7);
      } else if (authHeader.startsWith('ApiKey ')) {
        apiKey = authHeader.substring(7);
      } else {
        apiKey = authHeader;
      }
    }

    // Also check for API key in x-api-key header
    if (!apiKey) {
      apiKey = request.headers.get('x-api-key');
    }

    // Check query parameter as fallback (less secure, but sometimes needed)
    if (!apiKey) {
      const url = new URL(request.url);
      apiKey = url.searchParams.get('api_key');
    }

    if (!apiKey || !apiKey.startsWith('vhk_')) {
      return null;
    }

    // Get all active user keys
    const userKeys = await prisma.userKey.findMany({
      where: { 
        isActive: true,
        keyPrefix: apiKey.substring(0, 12) // Quick filter by prefix
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            organizationId: true,
          }
        }
      }
    });

    // Verify the full key hash
    for (const userKey of userKeys) {
      const isValid = await bcrypt.compare(apiKey, userKey.keyHash);
      if (isValid) {
        // Update last used timestamp
        await prisma.userKey.update({
          where: { id: userKey.id },
          data: { lastUsed: new Date() }
        });

        return userKey.user;
      }
    }

    return null;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

export async function validateApiKeyForProject(
  request: NextRequest,
  projectId: string
): Promise<ApiUser | null> {
  const user = await validateApiKey(request);
  
  if (!user) {
    return null;
  }

  // Check if user has access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.id }, // User owns the project
        { 
          users: {
            some: { userId: user.id } // User is a member of the project
          }
        }
      ]
    }
  });

  if (!project) {
    return null;
  }

  return user;
}

export function createApiErrorResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({ 
      error: message,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Hybrid authentication that supports both API key and session-based auth
 * Tries API key first, then falls back to session auth
 */
export async function validateHybridAuth(request: NextRequest): Promise<ApiUser | null> {
  // First try API key authentication
  const apiUser = await validateApiKey(request);
  if (apiUser) {
    return apiUser;
  }

  // Fall back to session authentication
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('@/lib/auth');
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  // Convert session user to ApiUser format
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      organizationId: true,
    }
  });

  return user;
}

/**
 * Hybrid authentication with project access validation
 */
export async function validateHybridAuthForProject(
  request: NextRequest,
  projectId: string
): Promise<ApiUser | null> {
  const user = await validateHybridAuth(request);
  
  if (!user) {
    return null;
  }

  // Check if user has access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.id }, // User owns the project
        { 
          users: {
            some: { userId: user.id } // User is a member of the project
          }
        }
      ]
    }
  });

  if (!project) {
    return null;
  }

  return user;
}