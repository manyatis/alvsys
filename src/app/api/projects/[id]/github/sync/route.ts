import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';
import { GitHubSyncService } from '@/services/github-sync-service';

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
      syncComments = true,
      syncLabels = true,
    } = body;

    // Create sync service using installation token
    const syncService = await GitHubSyncService.createForProject(projectId);
    
    if (!syncService) {
      return NextResponse.json(
        { 
          error: 'GitHub sync not configured for this project. Please ensure the GitHub App is installed and the project is linked to a repository.',
          needsAppInstallation: true 
        },
        { status: 400 }
      );
    }

    // Perform sync
    const result = await syncService.syncProject({
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