import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GitHub App installation callback handler
 * This route is called after a user installs the GitHub App
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');
    const state = searchParams.get('state');

    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Redirect to sign in if not authenticated
      return NextResponse.redirect(new URL('/api/auth/signin?callbackUrl=/projects', request.url));
    }

    // Log the installation event
    console.log('GitHub App installation callback:', {
      installationId,
      setupAction,
      state,
      userId: session.user.id,
    });

    // If installation was successful, redirect to projects page with success message
    if (installationId && setupAction === 'install') {
      // Optionally, you could store the installation ID here
      // But typically, we'll fetch it when the user tries to use it
      
      // Redirect to projects page with success parameter
      return NextResponse.redirect(
        new URL(`/projects?github_installed=true&installation_id=${installationId}`, request.url)
      );
    }

    // If user cancelled or there was an error, redirect with appropriate message
    if (setupAction === 'cancel') {
      return NextResponse.redirect(
        new URL('/projects?github_installed=false&error=cancelled', request.url)
      );
    }

    // Default redirect to projects page
    return NextResponse.redirect(new URL('/projects', request.url));
  } catch (error) {
    console.error('Error handling GitHub installation callback:', error);
    return NextResponse.redirect(
      new URL('/projects?error=installation_failed', request.url)
    );
  }
}

/**
 * POST endpoint for GitHub App installation webhook
 * This is called by GitHub when the app is installed/uninstalled
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;
    const installation = body.installation;
    
    console.log('GitHub App webhook received:', {
      action,
      installationId: installation?.id,
      account: installation?.account?.login,
    });

    if (action === 'created') {
      // App was installed
      console.log('GitHub App installed:', {
        installationId: installation.id,
        account: installation.account.login,
        repositorySelection: installation.repository_selection,
      });
      
      // You could store installation details here if needed
      // But typically we fetch them on-demand
    } else if (action === 'deleted') {
      // App was uninstalled
      console.log('GitHub App uninstalled:', {
        installationId: installation.id,
        account: installation.account.login,
      });
      
      // Clean up any projects linked to this installation
      await prisma.project.updateMany({
        where: {
          githubInstallationId: installation.id.toString(),
        },
        data: {
          githubSyncEnabled: false,
          githubInstallationId: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling GitHub webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}