import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MCP Authentication Middleware
 * Implements Bearer token authentication for MCP server access
 * Following industry best practices for API authentication
 */

export interface McpAuthResult {
  authenticated: boolean;
  userId?: string;
  error?: string;
}

/**
 * Generate a secure API token for MCP access
 * Uses crypto.randomBytes for cryptographically secure random generation
 */
export function generateMcpToken(): string {
  // Generate 32 bytes of random data and encode as base64url
  // This provides 256 bits of entropy, which is industry standard for secure tokens
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Hash a token for secure storage
 * Uses SHA-256 for one-way hashing
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify MCP Bearer token from request headers
 * Checks the Authorization header for a valid Bearer token
 */
export async function verifyMcpAuth(request: NextRequest): Promise<McpAuthResult> {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return {
        authenticated: false,
        error: 'No Authorization header provided'
      };
    }
    
    // Check for Bearer token format
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!bearerMatch) {
      return {
        authenticated: false,
        error: 'Invalid Authorization header format. Expected: Bearer <token>'
      };
    }
    
    const token = bearerMatch[1];
    
    // Hash the token for database lookup
    const hashedToken = hashToken(token);
    
    // Look up the token in the database
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        hashedKey: hashedToken,
        isActive: true
      },
      include: {
        user: true
      }
    });
    
    if (!apiKey) {
      return {
        authenticated: false,
        error: 'Invalid or inactive API token'
      };
    }
    
    // Check if token has expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return {
        authenticated: false,
        error: 'API token has expired'
      };
    }
    
    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() }
    });
    
    return {
      authenticated: true,
      userId: apiKey.userId
    };
  } catch (error) {
    console.error('MCP auth verification error:', error);
    return {
      authenticated: false,
      error: 'Authentication verification failed'
    };
  }
}

/**
 * Create a new API key for a user
 */
interface ApiKeyRecord {
  id: string;
  userId: string;
  name: string;
  hashedKey: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

export async function createMcpApiKey(
  userId: string,
  name: string,
  expiresInDays?: number
): Promise<{ token: string; apiKey: ApiKeyRecord }> {
  // Generate the raw token
  const token = generateMcpToken();
  const hashedToken = hashToken(token);
  
  // Calculate expiration date if specified
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  // Store the hashed token in the database
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      hashedKey: hashedToken,
      isActive: true,
      expiresAt,
      createdAt: new Date(),
      lastUsedAt: null
    }
  });
  
  // Return the raw token (only shown once) and the API key record
  return { token, apiKey };
}

/**
 * Revoke an API key
 */
export async function revokeMcpApiKey(apiKeyId: string, userId: string): Promise<boolean> {
  try {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId
      }
    });
    
    if (!apiKey) {
      return false;
    }
    
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false }
    });
    
    return true;
  } catch (error) {
    console.error('Error revoking API key:', error);
    return false;
  }
}

/**
 * List all API keys for a user (without exposing the actual tokens)
 */
export async function listMcpApiKeys(userId: string) {
  return await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
}