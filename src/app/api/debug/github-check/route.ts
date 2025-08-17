import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/lib/api-auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/debug/github-check - Check GitHub integration status
export async function GET(request: NextRequest) {
  try {
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Check GitHub OAuth account
    const githubAccount = await prisma.account.findFirst({
      where: {
        userId: validation.userId!,
        provider: 'github',
      },
      select: {
        providerAccountId: true,
        access_token: true,
        scope: true,
      }
    });

    if (!githubAccount) {
      return NextResponse.json({
        status: 'error',
        message: 'No GitHub account connected. Please sign in with GitHub.',
        debug: {
          hasGitHubOAuth: false,
          hasAccessToken: false,
        }
      });
    }

    // Try to get user info from GitHub
    let githubUser = null;
    let installationsError = null;
    
    if (githubAccount.access_token) {
      try {
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${githubAccount.access_token}`,
            'Accept': 'application/vnd.github+json',
          }
        });
        
        if (userResponse.ok) {
          githubUser = await userResponse.json();
        }

        // Try to get installations
        const installResponse = await fetch('https://api.github.com/user/installations', {
          headers: {
            'Authorization': `Bearer ${githubAccount.access_token}`,
            'Accept': 'application/vnd.github+json',
          }
        });

        if (!installResponse.ok) {
          const errorText = await installResponse.text();
          installationsError = {
            status: installResponse.status,
            message: errorText
          };
        }
      } catch (error) {
        console.error('Error checking GitHub:', error);
      }
    }

    return NextResponse.json({
      status: 'success',
      github: {
        hasOAuth: true,
        hasAccessToken: !!githubAccount.access_token,
        scope: githubAccount.scope,
        user: githubUser ? {
          login: githubUser.login,
          id: githubUser.id,
        } : null,
        installationsError,
      },
      appConfig: {
        appId: process.env.GITHUB_APP_ID ? 'Configured' : 'Missing',
        appName: process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'Not set',
        appUrl: `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero'}`,
      },
      helpUrl: `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero'}/installations/new`,
    });
  } catch (error) {
    console.error('Error in GitHub check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}