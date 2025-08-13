import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const params = await context.params;
  
  try {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: params.token },
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
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organizationName: invitation.organization.name,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        expiresAt: invitation.expiresAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}