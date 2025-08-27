import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Complete GitHub installation after user authentication
 * This endpoint is called after a user signs in following a GitHub app installation
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/api/auth/signin?callbackUrl=/projects', request.url)
      );
    }

    const cookieStore = cookies();
    const installationCookie = cookieStore.get('github_installation_pending');

    if (!installationCookie?.value) {
      // No pending installation - redirect to projects with info message
      return NextResponse.redirect(
        new URL('/projects?github_installation=no_pending', request.url)
      );
    }

    try {
      const installationData = JSON.parse(installationCookie.value);
      const { installationId, state, timestamp } = installationData;

      // Check if the installation data is not too old (10 minutes)
      const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
      if (timestamp < tenMinutesAgo) {
        // Clear expired cookie
        cookieStore.delete('github_installation_pending');
        return NextResponse.redirect(
          new URL('/projects?github_installation=expired', request.url)
        );
      }

      console.log('Completing GitHub installation for authenticated user:', {
        userId: session.user.id,
        installationId,
        state,
      });

      // Link the installation to the now-authenticated user
      await linkInstallationToUser(installationId, session.user.id, state);

      // Clear the pending installation cookie
      cookieStore.delete('github_installation_pending');

      // Redirect to projects with success message
      return NextResponse.redirect(
        new URL(`/projects?github_installation=success&installation_id=${installationId}`, request.url)
      );
    } catch (error) {
      console.error('Error parsing installation cookie:', error);
      cookieStore.delete('github_installation_pending');
      return NextResponse.redirect(
        new URL('/projects?github_installation=error&error=invalid_data', request.url)
      );
    }
  } catch (error) {
    console.error('Error completing GitHub installation:', error);
    return NextResponse.redirect(
      new URL('/projects?github_installation=error&error=completion_failed', request.url)
    );
  }
}

/**
 * Link a GitHub installation to a user account
 */
async function linkInstallationToUser(installationId: string, userId: string, state: string | null) {
  console.log('Completing installation link for user:', { installationId, userId, state });
  
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
    });

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
        githubAccountLogin: installation.account.login,
        githubAccountType: installation.account.type,
        repositorySelection: installation.repository_selection,
        targetType: installation.target_type,
        permissions: installation.permissions,
        events: installation.events || [],
        userId,
        isActive: true
      }
    });
    
    console.log(`Installation ${installationId} completed for user ${userId}`);
  } catch (error) {
    console.error('Error completing installation link:', error);
    throw error;
  }
}