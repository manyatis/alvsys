import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';
import { getGitHubApp, GitHubService } from '@/lib/github';

const prisma = new PrismaClient();

// GET /api/debug/github-app - Debug GitHub App installation
export async function GET(request: NextRequest) {
  try {
    // Validate API access (only authenticated users can debug)
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGitHubAppId: !!process.env.GITHUB_APP_ID,
        hasGitHubPrivateKey: !!process.env.GITHUB_APP_PRIVATE_KEY,
        hasWebhookSecret: !!process.env.GITHUB_WEBHOOK_SECRET,
        githubAppId: process.env.GITHUB_APP_ID || 'NOT_SET',
      },
      appCredentials: {
        status: 'unknown',
        error: null,
        appInfo: null,
      },
      projects: [],
      installations: [],
    };

    // Check if GitHub App credentials are configured
    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
      debugInfo.appCredentials.status = 'missing';
      debugInfo.appCredentials.error = 'GitHub App credentials not configured';
    } else {
      try {
        // Try to get GitHub App instance
        const githubApp = getGitHubApp();
        
        // Get app info
        try {
          const { data: appInfo } = await githubApp.rest.apps.getAuthenticated();
          debugInfo.appCredentials.status = 'valid';
          debugInfo.appCredentials.appInfo = {
            id: appInfo.id,
            slug: appInfo.slug,
            name: appInfo.name,
            owner: appInfo.owner,
            description: appInfo.description,
            externalUrl: appInfo.external_url,
            htmlUrl: appInfo.html_url,
            createdAt: appInfo.created_at,
            updatedAt: appInfo.updated_at,
            permissions: appInfo.permissions,
            events: appInfo.events,
            installationsCount: appInfo.installations_count,
          };

          // Check if the app ID matches what we expect
          if (appInfo.id.toString() !== process.env.GITHUB_APP_ID) {
            debugInfo.appCredentials.warning = `App ID mismatch: Expected ${process.env.GITHUB_APP_ID}, got ${appInfo.id}`;
          }
        } catch (error: any) {
          debugInfo.appCredentials.status = 'invalid';
          debugInfo.appCredentials.error = `Failed to authenticate as GitHub App: ${error.message}`;
          if (error.status === 401) {
            debugInfo.appCredentials.hint = 'Check that your GITHUB_APP_PRIVATE_KEY is correct and properly formatted';
          }
        }

        // Get all installations
        try {
          const { data: installations } = await githubApp.rest.apps.listInstallations();
          debugInfo.installations = installations.map((inst: any) => ({
            id: inst.id,
            account: {
              login: inst.account.login,
              type: inst.account.type,
              id: inst.account.id,
            },
            repositorySelection: inst.repository_selection,
            createdAt: inst.created_at,
            updatedAt: inst.updated_at,
            permissions: inst.permissions,
            events: inst.events,
          }));
        } catch (error: any) {
          debugInfo.installations = [];
          debugInfo.installationsError = `Failed to list installations: ${error.message}`;
        }
      } catch (error: any) {
        debugInfo.appCredentials.status = 'error';
        debugInfo.appCredentials.error = `Failed to initialize GitHub App: ${error.message}`;
      }
    }

    // Get all projects with GitHub integration
    const projects = await prisma.project.findMany({
      where: {
        githubInstallationId: { not: null },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            cards: true,
            githubIssueSync: true,
          },
        },
      },
    });

    // Check each project's installation
    for (const project of projects) {
      const projectDebug: any = {
        id: project.id,
        name: project.name,
        owner: project.owner,
        github: {
          installationId: project.githubInstallationId,
          repoName: project.githubRepoName,
          repoUrl: project.githubRepoUrl,
          syncEnabled: project.githubSyncEnabled,
          lastSyncAt: project.githubLastSyncAt,
          totalCards: project._count.cards,
          syncedCards: project._count.githubIssueSync,
        },
        installationStatus: {
          status: 'unknown',
          error: null,
          accessible: false,
          repoAccess: false,
        },
      };

      if (project.githubInstallationId) {
        try {
          // Try to create an installation client
          const githubService = await GitHubService.createForInstallation(project.githubInstallationId);
          
          // Test if we can get installation info
          try {
            // This will use the installation token to verify it's valid
            const { data: installation } = await githubService.octokit.rest.apps.getInstallation({
              installation_id: parseInt(project.githubInstallationId),
            });
            
            projectDebug.installationStatus.status = 'valid';
            projectDebug.installationStatus.accessible = true;
            projectDebug.installationStatus.installationInfo = {
              id: installation.id,
              account: installation.account.login,
              repositorySelection: installation.repository_selection,
            };
          } catch (error: any) {
            projectDebug.installationStatus.status = 'invalid';
            projectDebug.installationStatus.error = `Installation not accessible: ${error.message}`;
            if (error.status === 404) {
              projectDebug.installationStatus.hint = 'Installation not found - it may have been uninstalled';
            }
          }

          // Test repository access if we have a repo name
          if (project.githubRepoName) {
            const [owner, repo] = project.githubRepoName.split('/');
            if (owner && repo) {
              try {
                await githubService.getRepository(owner, repo);
                projectDebug.installationStatus.repoAccess = true;
              } catch (error: any) {
                projectDebug.installationStatus.repoAccessError = `Cannot access repository: ${error.message}`;
              }
            }
          }
        } catch (error: any) {
          projectDebug.installationStatus.status = 'error';
          projectDebug.installationStatus.error = `Failed to create installation client: ${error.message}`;
          if (error.message.includes('404')) {
            projectDebug.installationStatus.hint = 'Installation ID is invalid or the app was uninstalled';
          }
        }
      }

      debugInfo.projects.push(projectDebug);
    }

    // Add summary
    debugInfo.summary = {
      totalProjects: projects.length,
      validInstallations: debugInfo.projects.filter((p: any) => p.installationStatus.status === 'valid').length,
      invalidInstallations: debugInfo.projects.filter((p: any) => p.installationStatus.status === 'invalid').length,
      recommendations: [],
    };

    // Add recommendations based on findings
    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
      debugInfo.summary.recommendations.push('Configure GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY environment variables');
    }
    
    if (debugInfo.appCredentials.status === 'invalid') {
      debugInfo.summary.recommendations.push('Verify your GitHub App private key is correctly formatted');
    }
    
    if (debugInfo.appCredentials.warning) {
      debugInfo.summary.recommendations.push(debugInfo.appCredentials.warning);
    }
    
    const invalidProjects = debugInfo.projects.filter((p: any) => p.installationStatus.status === 'invalid');
    if (invalidProjects.length > 0) {
      debugInfo.summary.recommendations.push(
        `${invalidProjects.length} project(s) have invalid installation IDs. Users may need to reinstall the GitHub App.`
      );
    }

    // Check for installation/app ID mismatches
    if (debugInfo.installations.length > 0 && debugInfo.projects.length > 0) {
      const projectInstallationIds = new Set(debugInfo.projects.map((p: any) => p.github.installationId));
      const validInstallationIds = new Set(debugInfo.installations.map((i: any) => i.id.toString()));
      
      const orphanedProjects = Array.from(projectInstallationIds).filter(id => id && !validInstallationIds.has(id));
      if (orphanedProjects.length > 0) {
        debugInfo.summary.recommendations.push(
          `Found ${orphanedProjects.length} project(s) with installation IDs that don't match any current installations: ${orphanedProjects.join(', ')}`
        );
      }
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}