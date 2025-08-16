import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';
import { GitHubService } from '@/lib/github';

const prisma = new PrismaClient();

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
}

// GET /api/github/installations - Get GitHub installations for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Get user's GitHub account (if connected via OAuth)
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

    try {
      // First, try to get installations using the user's OAuth token
      const userGithubService = new GitHubService(undefined, githubAccount.access_token);
      let installations;
      
      try {
        installations = await userGithubService.getInstallations();
      } catch (error) {
        // If user token doesn't have GitHub App access, return empty installations
        // This forces the UI to show the "install GitHub App" message
        console.log('User token not authorized for GitHub App - no installations found');
        
        return NextResponse.json({
          installations: [],
          needsAppInstallation: true,
        });
      }
      
      // For each installation, get accessible repositories
      const installationsWithRepos = await Promise.all(
        installations.map(async (installation) => {
          try {
            const repos = await userGithubService.getInstallationRepositories(installation.id.toString());
            return {
              id: installation.id,
              account: {
                login: (installation.account as { login?: string })?.login || 'Unknown',
                type: (installation.account as { type?: string })?.type || 'User',
                avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
              },
              repository_selection: installation.repository_selection,
              permissions: installation.permissions,
              repositories: repos.repositories.map((repo: GitHubRepo) => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                private: repo.private,
                html_url: repo.html_url,
                default_branch: repo.default_branch,
              })),
            };
          } catch (error) {
            console.error(`Error getting repositories for installation ${installation.id}:`, error);
            return {
              id: installation.id,
              account: {
                login: (installation.account as { login?: string })?.login || 'Unknown',
                type: (installation.account as { type?: string })?.type || 'User',
                avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
              },
              repository_selection: installation.repository_selection,
              permissions: installation.permissions,
              repositories: [],
              error: 'Failed to load repositories',
            };
          }
        })
      );

      return NextResponse.json({
        installations: installationsWithRepos,
      });
    } catch (error) {
      console.error('Error getting GitHub installations:', error);
      return NextResponse.json(
        { error: 'Failed to get GitHub installations' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GitHub installations endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}