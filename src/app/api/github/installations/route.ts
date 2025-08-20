import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
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

    // Get user's GitHub account (if connected via OAuth)
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

    try {
      // First, try to get installations using the user's OAuth token
      const userGithubService = new GitHubService(undefined, githubAccount.access_token);
      let installations;
      
      try {
        installations = await userGithubService.getInstallations();
      } catch (error) {
        // If user token doesn't have GitHub App access, return empty installations
        // This forces the UI to show the "install GitHub App" message
        console.error('Error getting installations:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStatus = (error as { status?: number }).status;
        
        // If it's a 403, the user needs to authorize the app
        if (errorStatus === 403) {
          return NextResponse.json({
            installations: [],
            needsAppInstallation: true,
            needsAuthorization: true,
            authorizationUrl: `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero'}/installations/new`,
            error: 'GitHub App requires authorization. Please authorize the app to access your installations.',
          });
        }
        
        return NextResponse.json({
          installations: [],
          needsAppInstallation: true,
          error: errorMessage,
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