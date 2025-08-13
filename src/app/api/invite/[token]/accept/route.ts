import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const params = await context.params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to accept an invitation' },
        { status: 401 }
      );
    }

    // Find the invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: params.token },
      include: {
        organization: true
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 400 }
      );
    }

    // Check if the invitation is for the current user
    if (invitation.email !== session.user.email) {
      return NextResponse.json(
        { error: 'This invitation is for a different email address' },
        { status: 403 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already belongs to an organization
    if (user.organizationId && user.organizationId !== invitation.organizationId) {
      return NextResponse.json(
        { error: 'You already belong to another organization' },
        { status: 400 }
      );
    }

    // Update user's organization and mark invitation as accepted
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { organizationId: invitation.organizationId }
      }),
      prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() }
      })
    ]);

    return NextResponse.json({
      message: 'Successfully joined organization',
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}