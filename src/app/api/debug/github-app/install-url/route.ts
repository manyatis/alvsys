import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/lib/api-auth';
import { getGitHubApp } from '@/lib/github';

// GET /api/debug/github-app/install-url - Get the GitHub App installation URL
export async function GET(request: NextRequest) {
  try {
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    const appId = process.env.GITHUB_APP_ID;
    
    if (!appId) {
      return NextResponse.json({ 
        error: 'GitHub App ID not configured',
        suggestion: 'Please set GITHUB_APP_ID environment variable'
      }, { status: 500 });
    }

    // Try to get the app slug from the GitHub API
    let appSlug = null;
    let appName = null;
    
    try {
      const githubApp = getGitHubApp();
      const { data: appInfo } = await githubApp.rest.apps.getAuthenticated();
      appSlug = appInfo.slug;
      appName = appInfo.name;
    } catch (error: any) {
      console.error('Failed to get app info:', error);
    }

    const response: any = {
      appId,
      appName,
      appSlug,
      urls: {}
    };

    if (appSlug) {
      // Use the actual app slug for installation URLs
      response.urls = {
        // Install for the current user
        userInstall: `https://github.com/apps/${appSlug}/installations/new`,
        // Install for an organization (replace ORG_NAME)
        orgInstall: `https://github.com/apps/${appSlug}/installations/new?target_type=Organization`,
        // View app page
        appPage: `https://github.com/apps/${appSlug}`,
        // Settings page (for existing installations)
        settingsPage: `https://github.com/settings/installations`,
      };
      response.success = true;
    } else {
      // Fallback: construct URL using app ID (less reliable)
      response.urls = {
        notice: 'Could not determine app slug. These URLs may not work correctly.',
        settingsPage: `https://github.com/settings/installations`,
        suggestion: 'Check your GitHub App settings for the correct app name/slug',
      };
      response.success = false;
    }

    // Add helpful instructions
    response.instructions = {
      newInstallation: [
        `1. Go to ${response.urls.userInstall || 'GitHub App installation page'}`,
        '2. Select the account or organization where your repositories are located',
        '3. Choose "All repositories" or select specific repositories',
        '4. Click "Install" to complete the installation',
        '5. Return to VibeHero and refresh the GitHub integration page',
      ],
      existingInstallation: [
        `1. Go to ${response.urls.settingsPage}`,
        '2. Find the VibeHero installation',
        '3. Check if it\'s suspended or needs reconfiguration',
        '4. Update repository access if needed',
        '5. Return to VibeHero and try syncing again',
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Install URL endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}