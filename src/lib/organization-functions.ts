'use server';

// Authentication imports removed - will be handled at a higher layer
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
  inviter: {
    name: string | null;
    email: string;
  };
}

export interface OrganizationsResult {
  success: boolean;
  error?: string;
  organizations?: Organization[];
}

export interface InviteUserResult {
  success: boolean;
  error?: string;
  message?: string;
  invitation?: {
    id: string;
    email: string;
    organization: string;
    expiresAt: Date;
    invitationLink: string;
  };
  user?: {
    email: string;
  };
}

export interface OrganizationMembersResult {
  success: boolean;
  error?: string;
  members?: OrganizationMember[];
  pendingInvitations?: PendingInvitation[];
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId: string, userOrganizationId?: string | null): Promise<OrganizationsResult> {
  try {
    // Get all organizations where user has projects
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { id: userOrganizationId || undefined },
          {
            projects: {
              some: {
                OR: [
                  { ownerId: userId },
                  { users: { some: { userId: userId } } }
                ]
              }
            }
          }
        ]
      }
    });

    return {
      success: true,
      organizations
    };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

/**
 * Invite a user to an organization
 */
export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  inviterId: string,
  inviterName?: string | null
): Promise<InviteUserResult> {
  try {
    // Validate email
    try {
      inviteSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }
      throw error;
    }
    
    // Verify inviter has access to this organization
    const userOrganization = await prisma.user.findUnique({
      where: { id: inviterId },
      select: { organizationId: true }
    });

    if (!userOrganization || userOrganization.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Access denied'
      };
    }

    // Check if user already exists and is in the organization
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, organizationId: true }
    });

    if (existingUser) {
      if (existingUser.organizationId === organizationId) {
        return {
          success: false,
          error: 'User is already a member of this organization'
        };
      } else if (existingUser.organizationId) {
        return {
          success: false,
          error: 'User is already a member of another organization'
        };
      } else {
        // User exists but has no organization - add them to this one
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { organizationId }
        });

        return {
          success: true,
          message: 'User successfully added to organization',
          user: { email }
        };
      }
    }

    // Create an invitation record with 7-day expiry
    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        organizationId,
        invitedBy: inviterId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      include: {
        organization: {
          select: { name: true }
        }
      }
    });

    return {
      success: true,
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organization: invitation.organization.name,
        expiresAt: invitation.expiresAt,
        invitationLink: `/invite/${invitation.token}`
      }
    };
  } catch (error) {
    console.error('Error inviting user:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

/**
 * Get organization members and pending invitations
 */
export async function getOrganizationMembers(organizationId: string, userId: string): Promise<OrganizationMembersResult> {
  try {
    // Verify user has access to this organization
    const userOrganization = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true }
    });

    if (!userOrganization || userOrganization.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Access denied'
      };
    }

    // Fetch all members of the organization
    const members = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Also fetch pending invitations
    const pendingInvitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      members,
      pendingInvitations
    };
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}