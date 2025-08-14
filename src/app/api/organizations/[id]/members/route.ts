import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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
      select: { organizationId: true }
    });

    if (!userOrganization || userOrganization.organizationId !== organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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

    return NextResponse.json({ 
      members,
      pendingInvitations 
    });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}