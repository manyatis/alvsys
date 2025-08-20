import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { GitHubSyncService } from '@/services/github-sync-service';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/cards/[id]/github - Sync specific card to GitHub
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: cardId } = await params;
    
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get card and check access
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        project: {
          OR: [
            { ownerId: user.id },
            { users: { some: { userId: user.id } } },
          ],
        },
      },
      include: {
        project: true,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Create sync service
    const syncService = await GitHubSyncService.createForProject(card.projectId);
    if (!syncService) {
      return NextResponse.json(
        { error: 'Project not linked to GitHub or sync service unavailable' },
        { status: 400 }
      );
    }

    // Sync card to GitHub
    const result = await syncService.syncCardToGitHub(cardId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Get updated card
    const updatedCard = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        githubSync: true,
      },
    });

    return NextResponse.json({
      message: 'Card synced to GitHub successfully',
      card: updatedCard,
    });
  } catch (error) {
    console.error('Error syncing card to GitHub:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id]/github - Disable GitHub sync for specific card
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: cardId } = await params;
    
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get card and check access
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        project: {
          OR: [
            { ownerId: user.id },
            { users: { some: { userId: user.id } } },
          ],
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Disable GitHub sync for this card
    await prisma.card.update({
      where: { id: cardId },
      data: {
        githubSyncEnabled: false,
        githubIssueId: null,
        githubIssueUrl: null,
        githubLastSyncAt: null,
      },
    });

    // Remove sync record if exists
    await prisma.gitHubIssueSync.deleteMany({
      where: { cardId },
    });

    return NextResponse.json({
      message: 'GitHub sync disabled for card',
    });
  } catch (error) {
    console.error('Error disabling GitHub sync for card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}