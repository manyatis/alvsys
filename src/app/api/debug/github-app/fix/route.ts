import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';
import { getGitHubApp } from '@/lib/github';

const prisma = new PrismaClient();

// POST /api/debug/github-app/fix - Fix GitHub App installation issues
export async function POST(request: NextRequest) {
  try {
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, action } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
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

    const result: any = {
      projectId,
      action,
      success: false,
      changes: [],
    };

    switch (action) {
      case 'clear_installation':
        // Clear the installation ID to allow re-linking
        await prisma.project.update({
          where: { id: projectId },
          data: {
            githubInstallationId: null,
            githubRepoName: null,
            githubRepoUrl: null,
            githubSyncEnabled: false,
            githubLastSyncAt: null,
          },
        });
        
        // Delete all sync records
        const deletedSyncs = await prisma.gitHubIssueSync.deleteMany({
          where: { projectId },
        });
        
        result.success = true;
        result.changes.push('Cleared GitHub installation ID');
        result.changes.push('Cleared repository information');
        result.changes.push(`Deleted ${deletedSyncs.count} sync records`);
        result.message = 'GitHub integration has been reset. You can now re-link the repository.';
        break;

      case 'validate_installation':
        // Validate if the current installation ID is valid
        if (!project.githubInstallationId) {
          result.error = 'No GitHub installation ID found for this project';
          break;
        }

        try {
          const githubApp = getGitHubApp();
          const { data: installation } = await githubApp.rest.apps.getInstallation({
            installation_id: parseInt(project.githubInstallationId),
          });
          
          result.success = true;
          result.installation = {
            id: installation.id,
            account: installation.account.login,
            type: installation.account.type,
            createdAt: installation.created_at,
            updatedAt: installation.updated_at,
          };
          result.message = 'Installation is valid';
        } catch (error: any) {
          result.error = `Installation validation failed: ${error.message}`;
          if (error.status === 404) {
            result.suggestion = 'The GitHub App may have been uninstalled. Clear the installation and re-link.';
          }
        }
        break;

      case 'list_available_installations':
        // List all installations the app has access to
        try {
          const githubApp = getGitHubApp();
          const { data: installations } = await githubApp.rest.apps.listInstallations();
          
          result.success = true;
          result.installations = installations.map((inst: any) => ({
            id: inst.id,
            account: inst.account.login,
            type: inst.account.type,
            createdAt: inst.created_at,
          }));
          result.message = `Found ${installations.length} installation(s)`;
        } catch (error: any) {
          result.error = `Failed to list installations: ${error.message}`;
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fix endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}