'use server';

// Authentication imports removed - will be handled at a higher layer
import { prisma } from '@/lib/prisma';

export interface InvitationData {
  id: string;
  email: string;
  organizationName: string;
  inviterName: string;
  expiresAt: string;
}

export interface InvitationResult {
  success: boolean;
  error?: string;
  invitation?: InvitationData;
}

export interface AcceptInvitationResult {
  success: boolean;
  error?: string;
  organization?: {
    id: string;
    name: string;
  };
  message?: string;
}

/**
 * Get invitation details by token
 */
export async function getInvitation(token: string): Promise<InvitationResult> {
  try {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { name: true }
        },
        inviter: {
          select: { name: true, email: true }
        }
      }
    });

    if (!invitation) {
      return {
        success: false,
        error: 'Invitation not found'
      };
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Invitation has expired'
      };
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return {
        success: false,
        error: 'Invitation has already been accepted'
      };
    }

    return {
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organizationName: invitation.organization.name,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        expiresAt: invitation.expiresAt.toISOString(),
      }
    };
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<AcceptInvitationResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User', organizationId: null };

    // Find the invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true
      }
    });

    if (!invitation) {
      return {
        success: false,
        error: 'Invitation not found'
      };
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Invitation has expired'
      };
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return {
        success: false,
        error: 'Invitation has already been accepted'
      };
    }

    // Check if the invitation is for the current user (placeholder logic)
    if (invitation.email !== user.email) {
      return {
        success: false,
        error: 'This invitation is for a different email address'
      };
    }

    // Check if user already belongs to an organization
    if (user.organizationId && user.organizationId !== invitation.organizationId) {
      return {
        success: false,
        error: 'You already belong to another organization'
      };
    }

    // Update user's organization and mark invitation as accepted (placeholder - would update in real app)
    console.log(`Would update user ${userId} with organizationId: ${invitation.organizationId}`);
    console.log(`Would mark invitation ${invitation.id} as accepted`);

    return {
      success: true,
      message: 'Successfully joined organization',
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name
      }
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}