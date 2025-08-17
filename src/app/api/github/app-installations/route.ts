import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/lib/api-auth';
import { GitHubService } from '@/lib/github';

// GET /api/github/app-installations - Get GitHub App installations (using App authentication)
export async function GET(request: NextRequest) {
  try {
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Try to get all installations using the GitHub App credentials
    try {
      const appGithubService = new GitHubService();
      const installations = await appGithubService.getInstallations();
      
      // Get repositories for each installation
      const installationsWithRepos = await Promise.all(
        installations.map(async (installation) => {
          try {
            const installationService = await GitHubService.createForInstallation(installation.id.toString());
            const repos = await installationService.getInstallationRepositories(installation.id.toString());
            
            return {
              id: installation.id,
              account: {
                login: (installation.account as { login?: string })?.login || 'Unknown',
                type: (installation.account as { type?: string })?.type || 'User',
                avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
              },
              repository_selection: installation.repository_selection,
              repositories: repos.repositories || [],
            };
          } catch (error) {
            console.error(`Error getting repos for installation ${installation.id}:`, error);
            return {
              id: installation.id,
              account: {
                login: (installation.account as { login?: string })?.login || 'Unknown',
                type: (installation.account as { type?: string })?.type || 'User',
                avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
              },
              repository_selection: installation.repository_selection,
              repositories: [],
              error: 'Failed to load repositories',
            };
          }
        })
      );

      return NextResponse.json({
        installations: installationsWithRepos,
        usingAppAuth: true,
      });
    } catch (error) {
      console.error('Error getting app installations:', error);
      
      return NextResponse.json({
        installations: [],
        needsAppInstallation: true,
        error: 'Failed to get GitHub App installations. Make sure the app is properly configured.',
        installUrl: `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero'}/installations/new`,
      });
    }
  } catch (error) {
    console.error('Error in GitHub app installations endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}