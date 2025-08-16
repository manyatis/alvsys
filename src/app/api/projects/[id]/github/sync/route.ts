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
    try {
      const syncService = await GitHubSyncService.createForProject(projectId);
      
      if (!syncService) {
        return NextResponse.json(
          { 
            error: 'GitHub sync not configured for this project. Please ensure the GitHub App is installed and the project is linked to a repository.',
            needsAppInstallation: true,
            debugInfo: {
              hasInstallationId: !!project.githubInstallationId,
              hasRepoName: !!project.githubRepoName,
              installationId: project.githubInstallationId,
              repoName: project.githubRepoName,
            }
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
    } catch (error: any) {
      console.error('Error during GitHub sync:', error);
      
      // Provide detailed error information
      const errorResponse: any = {
        error: 'Failed to sync with GitHub',
        details: error.message,
      };

      // Check for specific error types
      if (error.message?.includes('404') || error.status === 404) {
        errorResponse.error = 'GitHub App installation not found';
        errorResponse.suggestion = 'The GitHub App may have been uninstalled. Please reinstall the app and re-link your repository.';
        errorResponse.debugInfo = {
          installationId: project.githubInstallationId,
          repoName: project.githubRepoName,
        };
      } else if (error.message?.includes('401') || error.status === 401) {
        errorResponse.error = 'GitHub App authentication failed';
        errorResponse.suggestion = 'Check that your GitHub App credentials are correctly configured.';
      } else if (error.message?.includes('credentials not configured')) {
        errorResponse.error = 'GitHub App not configured';
        errorResponse.suggestion = 'Please ensure GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY environment variables are set.';
      }

      return NextResponse.json(errorResponse, { status: 500 });
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