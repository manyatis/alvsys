import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';

const prisma = new PrismaClient();

// GET /api/debug/github-status - Get GitHub integration status for debugging
export async function GET(request: NextRequest) {
  try {
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Get all projects with GitHub integration
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { githubRepoName: { not: null } },
          { githubInstallationId: { not: null } }
        ],
        users: {
          some: {
            userId: validation.userId!
          }
        }
      },
      select: {
        id: true,
        name: true,
        githubRepoName: true,
        githubInstallationId: true,
        githubSyncEnabled: true,
        githubLastSyncAt: true,
      }
    });

    // Check GitHub App configuration
    const appConfig = {
      appId: process.env.GITHUB_APP_ID ? 'Configured' : 'Missing',
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY ? 'Configured' : 'Missing',
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET ? 'Configured' : 'Missing',
      appName: process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'Not configured',
    };

    // Check GitHub OAuth configuration
    const oauthConfig = {
      clientId: process.env.GITHUB_ID ? 'Configured' : 'Missing',
      clientSecret: process.env.GITHUB_SECRET ? 'Configured' : 'Missing',
    };

    return NextResponse.json({
      githubApp: {
        config: appConfig,
        installUrl: `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero'}/installations/new`,
      },
      githubOAuth: oauthConfig,
      projects: projects.map(p => ({
        ...p,
        status: p.githubInstallationId ? 'Linked' : 'Not linked',
        needsRelink: p.githubInstallationId && !p.githubSyncEnabled,
      })),
      summary: {
        totalProjects: projects.length,
        linkedProjects: projects.filter(p => p.githubInstallationId).length,
        enabledProjects: projects.filter(p => p.githubSyncEnabled).length,
      }
    });
  } catch (error) {
    console.error('Error in GitHub status endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}