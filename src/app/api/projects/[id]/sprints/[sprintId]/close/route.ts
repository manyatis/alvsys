import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CardStatus } from '@/types/card';

export async function POST(
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

    // Get the current sprint
    const currentSprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        cards: {
          where: {
            status: { not: CardStatus.COMPLETED }
          }
        }
      }
    });

    if (!currentSprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    if (!currentSprint.isActive) {
      return NextResponse.json({ error: 'Sprint is not active' }, { status: 400 });
    }

    // Find the next sprint (by creation date)
    const nextSprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        createdAt: { gt: currentSprint.createdAt },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Close the current sprint
      await tx.sprint.update({
        where: { id: sprintId },
        data: { 
          isActive: false,
          endDate: new Date(),
        },
      });

      // If there are incomplete cards and a next sprint exists, move them
      if (currentSprint.cards.length > 0 && nextSprint) {
        await tx.card.updateMany({
          where: {
            sprintId,
            status: { not: CardStatus.COMPLETED },
          },
          data: { sprintId: nextSprint.id },
        });
      }

      // Activate the next sprint if it exists
      if (nextSprint) {
        await tx.sprint.update({
          where: { id: nextSprint.id },
          data: { 
            isActive: true,
            startDate: new Date(),
          },
        });
      }

      return {
        closedSprint: currentSprint,
        activatedSprint: nextSprint,
        movedCardsCount: currentSprint.cards.length,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error closing sprint:', error);
    return NextResponse.json(
      { error: 'Failed to close sprint' },
      { status: 500 }
    );
  }
}