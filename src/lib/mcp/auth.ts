import { PrismaClient } from '@/generated/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

const prisma = new PrismaClient();

export interface MCPUser {
  id: string;
  email: string | null;
  name: string | null;
  organizationId: string | null;
}

/**
 * MCP Authentication Handler
 * Note: This is a basic implementation. In production, you'd want to implement
 * proper MCP authentication mechanisms such as:
 * - Bearer tokens
 * - Client certificates
 * - OAuth2 flows
 * - Custom authentication protocols
 */
export class MCPAuthHandler {
  private static instance: MCPAuthHandler;
  private currentUser: MCPUser | null = null;

  private constructor() {}

  public static getInstance(): MCPAuthHandler {
    if (!MCPAuthHandler.instance) {
      MCPAuthHandler.instance = new MCPAuthHandler();
    }
    return MCPAuthHandler.instance;
  }

  /**
   * Authenticate using session-based auth (for web context)
   * This is primarily for testing and development
   */
  async authenticateWithSession(): Promise<MCPUser> {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'No valid session found'
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          organizationId: true,
        }
      });

      if (!user) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'User not found'
        );
      }

      this.currentUser = user;
      return user;
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Authentication failed: ${error}`
      );
    }
  }

  /**
   * Authenticate using Bearer token (for API context)
   * This could be used with API keys or JWT tokens
   */
  async authenticateWithToken(token: string): Promise<MCPUser> {
    try {
      // For now, treat tokens as API keys for backward compatibility
      if (!token.startsWith('vhk_')) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Invalid token format'
        );
      }

      const userKey = await prisma.aPIKey.findFirst({
        where: {
          key: token,
          isActive: true,
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

      if (!userKey) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Invalid or inactive token'
        );
      }

      // Update last used timestamp
      await prisma.aPIKey.update({
        where: { id: userKey.id },
        data: { lastUsedAt: new Date() }
      });

      this.currentUser = userKey.user;
      return userKey.user;
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Token authentication failed: ${error}`
      );
    }
  }

  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): MCPUser | null {
    return this.currentUser;
  }

  /**
   * Require authenticated user or throw error
   */
  requireAuth(): MCPUser {
    if (!this.currentUser) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Authentication required'
      );
    }
    return this.currentUser;
  }

  /**
   * Check if user has access to a project
   */
  async checkProjectAccess(projectId: string): Promise<boolean> {
    const user = this.requireAuth();

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } }
        ]
      }
    });

    return !!project;
  }

  /**
   * Check if user has access to an issue
   */
  async checkIssueAccess(issueId: string): Promise<boolean> {
    const user = this.requireAuth();

    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        project: {
          OR: [
            { ownerId: user.id },
            { users: { some: { userId: user.id } } }
          ]
        }
      }
    });

    return !!issue;
  }

  /**
   * Clear current user (logout)
   */
  clearAuth(): void {
    this.currentUser = null;
  }
}

/**
 * Factory function to get auth handler instance
 */
export function getMCPAuth(): MCPAuthHandler {
  return MCPAuthHandler.getInstance();
}