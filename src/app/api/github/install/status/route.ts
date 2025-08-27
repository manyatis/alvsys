import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * Get GitHub installation status for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        hasPendingInstallation: false,
      });
    }

    const cookieStore = cookies();
    const installationCookie = cookieStore.get('github_installation_pending');
    
    let hasPendingInstallation = false;
    let pendingInstallation = null;

    if (installationCookie?.value) {
      try {
        const installationData = JSON.parse(installationCookie.value);
        const { timestamp } = installationData;
        
        // Check if not expired (10 minutes)
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        if (timestamp >= tenMinutesAgo) {
          hasPendingInstallation = true;
          pendingInstallation = {
            installationId: installationData.installationId,
            state: installationData.state,
          };
        } else {
          // Clear expired cookie
          cookieStore.delete('github_installation_pending');
        }
      } catch (error) {
        console.error('Error parsing installation cookie:', error);
        cookieStore.delete('github_installation_pending');
      }
    }

    return NextResponse.json({
      authenticated: true,
      userId: session.user.id,
      hasPendingInstallation,
      pendingInstallation,
    });
  } catch (error) {
    console.error('Error getting installation status:', error);
    return NextResponse.json(
      { error: 'Failed to get installation status' },
      { status: 500 }
    );
  }
}