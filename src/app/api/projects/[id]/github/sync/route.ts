import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';
import { GitHubSyncService } from '@/services/github-sync-service';
import { GitHubService } from '@/lib/github';
import { SyncDirection, ConflictResolution } from '@/generated/prisma';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/github/sync - Trigger full project sync
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: validation.userId! },
          { users: { some: { userId: validation.userId! } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      direction = 'BIDIRECTIONAL',
      conflictResolution = 'MANUAL',
      syncComments = true,
      syncLabels = true,
    } = body;

    // Validate direction and conflict resolution
    if (!Object.values(SyncDirection).includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid sync direction' },
        { status: 400 }
      );
    }

    if (!Object.values(ConflictResolution).includes(conflictResolution)) {
      return NextResponse.json(
        { error: 'Invalid conflict resolution strategy' },
        { status: 400 }
      );
    }

    // Get user's GitHub account for OAuth token
    const githubAccount = await prisma.account.findFirst({
      where: {
        userId: validation.userId!,
        provider: 'github',
      },
    });

    if (!githubAccount?.access_token) {
      return NextResponse.json(
        { error: 'GitHub account not connected' },
        { status: 400 }
      );
    }

    // Create sync service using user's OAuth token
    const githubService = new GitHubService(undefined, githubAccount.access_token);
    const syncService = new GitHubSyncService(githubService, project);

    // Perform sync
    const result = await syncService.syncProject({
      direction,
      conflictResolution,
      syncComments,
      syncLabels,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Sync completed successfully',
      result,
    });
  } catch (error) {
    console.error('Error syncing project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}