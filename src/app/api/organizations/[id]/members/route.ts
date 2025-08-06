import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/organizations/[id]/members - Get organization members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to this organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: resolvedParams.id,
        OR: [
          { id: user.organizationId || undefined },
          {
            projects: {
              some: {
                OR: [
                  { ownerId: user.id },
                  { users: { some: { userId: user.id } } }
                ]
              }
            }
          }
        ]
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    // Get all members of the organization
    const members = await prisma.user.findMany({
      where: {
        organizationId: resolvedParams.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}