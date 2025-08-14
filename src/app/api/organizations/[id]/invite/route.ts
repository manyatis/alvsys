import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = params.id;
    
    // Verify user has access to this organization
    const userOrganization = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        organizationId: true 
      }
    });

    if (!userOrganization || userOrganization.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { email } = inviteSchema.parse(body);

    // Check if user already exists and is in the organization
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, organizationId: true }
    });

    if (existingUser) {
      if (existingUser.organizationId === organizationId) {
        return NextResponse.json({ 
          error: 'User is already a member of this organization' 
        }, { status: 400 });
      } else if (existingUser.organizationId) {
        return NextResponse.json({ 
          error: 'User is already a member of another organization' 
        }, { status: 400 });
      } else {
        // User exists but has no organization - add them to this one
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { organizationId }
        });

        return NextResponse.json({ 
          message: 'User successfully added to organization',
          user: { email }
        });
      }
    }

    // Create an invitation record with 7-day expiry
    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        organizationId,
        invitedBy: userOrganization.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      include: {
        organization: {
          select: { name: true }
        }
      }
    });

    // In a production app, you would send an email here with the invitation link
    // For now, we'll return the invitation details
    return NextResponse.json({ 
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organization: invitation.organization.name,
        expiresAt: invitation.expiresAt,
        invitationLink: `/invite/${invitation.token}` // This would be the acceptance link
      }
    });

  } catch (error) {
    console.error('Error inviting user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}