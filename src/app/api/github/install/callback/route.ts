import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * GitHub App installation callback handler
 * Handles callbacks from GitHub app installation without going through OAuth
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');
    const state = searchParams.get('state'); // This might contain project ID or user state

    console.log('GitHub App installation callback:', {
      installationId,
      setupAction,
      state,
      headers: Object.fromEntries(request.headers.entries()),
    });

    // Handle cancellation
    if (setupAction === 'cancel') {
      return NextResponse.redirect(
        new URL('/projects?github_installation=cancelled', request.url)
      );
    }

    // Validate installation
    if (!installationId || setupAction !== 'install') {
      console.error('Invalid installation callback:', { installationId, setupAction });
      return NextResponse.redirect(
        new URL('/projects?github_installation=error&error=invalid_callback', request.url)
      );
    }

    // Try to get current session
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      // User is authenticated - directly link the installation
      try {
        await linkInstallationToUser(installationId, session.user.id, state);
        return NextResponse.redirect(
          new URL(`/projects?github_installation=success&installation_id=${installationId}`, request.url)
        );
      } catch (error) {
        console.error('Error linking installation to user:', error);
        return NextResponse.redirect(
          new URL('/projects?github_installation=error&error=link_failed', request.url)
        );
      }
    } else {
      // User is not authenticated - store installation temporarily and redirect to login
      const cookieStore = await cookies();
      
      // Store installation in a secure cookie that expires in 10 minutes
      const installationData = JSON.stringify({
        installationId,
        state,
        timestamp: Date.now(),
      });
      
      cookieStore.set('github_installation_pending', installationData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
      });

      // Redirect to sign in with a callback to complete the installation
      return NextResponse.redirect(
        new URL('/api/auth/signin?callbackUrl=/api/github/install/complete', request.url)
      );
    }
  } catch (error) {
    console.error('Error in GitHub installation callback:', error);
    return NextResponse.redirect(
      new URL('/projects?github_installation=error&error=unexpected_error', request.url)
    );
  }
}

/**
 * Link a GitHub installation to a user account
 */
async function linkInstallationToUser(installationId: string, userId: string, state: string | null) {
  console.log('Linking installation to user:', { installationId, userId, state });
  
  try {
    // First, get installation details from GitHub
    const { GitHubService } = await import('@/lib/github');
    const githubService = await GitHubService.createForInstallation(installationId);
    
    // Get installation details
    const { data: installation } = await githubService.octokit.rest.apps.getInstallation({
      installation_id: parseInt(installationId, 10),
    });

    console.log('GitHub installation details:', {
      id: installation.id,
      account: installation.account,
      repositorySelection: installation.repository_selection,
      permissions: installation.permissions,
    });

    if (!installation.account) {
      throw new Error('Installation account is missing');
    }

    // Handle account login for both user and organization accounts
    const accountLogin = 'login' in installation.account ? installation.account.login : installation.account.name;
    const accountType = installation.target_type;

    // Store the installation in the database
    await prisma.gitHubInstallation.upsert({
      where: { githubInstallationId: installationId },
      update: { 
        userId,
        isActive: true,
        updatedAt: new Date()
      },
      create: { 
        githubInstallationId: installationId,
        githubAccountId: installation.account.id.toString(),
        githubAccountLogin: accountLogin,
        githubAccountType: accountType,
        repositorySelection: installation.repository_selection,
        targetType: installation.target_type,
        permissions: installation.permissions,
        events: installation.events || [],
        userId,
        isActive: true
      }
    });
    
    console.log(`Installation ${installationId} successfully linked to user ${userId}`);
  } catch (error) {
    console.error('Error linking installation to user:', error);
    throw error;
  }
}