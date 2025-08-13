import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Check user has access to the project
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all sprints for the project
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { cards: true }
        }
      }
    });

    return NextResponse.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { name, startDate, endDate } = body;

    // Check user has access to the project
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if there's already an active sprint
    const activeSprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        isActive: true,
      },
    });

    // Create the new sprint
    const sprint = await prisma.sprint.create({
      data: {
        name,
        projectId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default: 2 weeks from now
        isActive: !activeSprint, // Make active if no other active sprint
      },
    });

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Error creating sprint:', error);
    return NextResponse.json(
      { error: 'Failed to create sprint' },
      { status: 500 }
    );
  }
}