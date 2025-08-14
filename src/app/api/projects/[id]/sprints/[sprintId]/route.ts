import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sprintId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, sprintId } = await params;
    const body = await request.json();
    const { name, startDate, endDate, isActive } = body;

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

    // If setting this sprint as active, deactivate others
    if (isActive) {
      await prisma.sprint.updateMany({
        where: {
          projectId,
          id: { not: sprintId },
        },
        data: { isActive: false },
      });
    }

    // Update the sprint
    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        name,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        isActive,
      },
    });

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Error updating sprint:', error);
    return NextResponse.json(
      { error: 'Failed to update sprint' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sprintId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, sprintId } = await params;

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

    // Delete the sprint (cards will have sprintId set to null due to optional relation)
    await prisma.sprint.delete({
      where: { id: sprintId },
    });

    return NextResponse.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json(
      { error: 'Failed to delete sprint' },
      { status: 500 }
    );
  }
}