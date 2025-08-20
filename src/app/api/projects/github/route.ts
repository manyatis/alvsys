import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { GitHubService } from '@/lib/github';
import { GitHubSyncService } from '@/services/github-sync-service';

const prisma = new PrismaClient();

// POST /api/projects/github - Create a project from a GitHub repository
export async function POST(request: NextRequest) {
  try {
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { repoName, repoDescription, installationId, syncIssues = true } = body;

    if (!repoName || !installationId) {
      return NextResponse.json(
        { error: 'Repository name and installation ID are required' },
        { status: 400 }
      );
    }

    // Get the GitHub repository details
    const githubAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'github',
      },
    });

    if (!githubAccount?.access_token) {
      return NextResponse.json(
        { error: 'GitHub account not connected' },
        { status: 400 }
      );
    }

    const githubService = new GitHubService(undefined, githubAccount.access_token);
    
    // Check if a project already exists for this repository
    const existingProject = await prisma.project.findFirst({
      where: {
        githubRepoName: repoName,
        ownerId: user.id,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: `Project already exists for repository ${repoName}` },
        { status: 400 }
      );
    }

    // Get repository details
    const repoDetails = await githubService.getRepositoryByName(repoName);
    
    // Create organization first (using repo owner name)
    const repoOwner = repoName.split('/')[0];
    let organization = await prisma.organization.findFirst({
      where: {
        slug: repoOwner.toLowerCase(),
      },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: repoOwner,
          slug: repoOwner.toLowerCase(),
          description: `GitHub organization for ${repoOwner}`,
        },
      });
    }

    // Create the project with GitHub integration
    const project = await prisma.project.create({
      data: {
        name: repoDetails.name,
        description: repoDescription || repoDetails.description || `Project synced from GitHub repository ${repoName}`,
        ownerId: user.id,
        organizationId: organization.id,
        githubRepoId: repoDetails.id.toString(),
        githubRepoName: repoName,
        githubRepoUrl: repoDetails.html_url,
        githubInstallationId: installationId,
        githubSyncEnabled: syncIssues,
        githubLastSyncAt: null,
      },
      include: {
        organization: true,
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    // Add user to project
    await prisma.projectUser.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'owner',
      },
    });

    // If sync is enabled, perform initial sync
    if (syncIssues) {
      try {
        // Use the user's GitHub service for syncing (since we're using OAuth, not GitHub App)
        const userGithubService = new GitHubService(undefined, githubAccount.access_token);
        const syncService = new GitHubSyncService(userGithubService, project);
        
        const syncResult = await syncService.syncProject({
          syncComments: true,
          syncLabels: true,
        });

        console.log('Sync result:', syncResult);

        // Only update last sync time if sync was successful
        if (syncResult.success) {
          await prisma.project.update({
            where: { id: project.id },
            data: { githubLastSyncAt: new Date() },
          });
        }
      } catch (syncError) {
        console.error('Initial sync failed:', syncError);
        // Don't fail project creation if sync fails
      }
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        organization: project.organization,
        _count: project._count,
        createdAt: project.createdAt,
        githubRepoName: project.githubRepoName,
        githubRepoUrl: project.githubRepoUrl,
        githubSyncEnabled: project.githubSyncEnabled,
        githubLastSyncAt: project.githubLastSyncAt,
      },
      message: syncIssues ? 'Project created and GitHub issues synced' : 'Project created without sync',
    });
  } catch (error) {
    console.error('Error creating project from GitHub:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}