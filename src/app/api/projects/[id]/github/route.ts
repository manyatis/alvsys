import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GitHubFunctions } from '@/lib/github-functions';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/github - Get GitHub integration status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    
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

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.getProjectGitHubStatus(projectId, user.id);

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ 
      syncStatus: {
        isLinked: result.isLinked,
        repositoryName: result.repositoryName,
        installationId: result.installationId,
        syncEnabled: result.syncEnabled,
        lastSyncAt: result.lastSyncAt,
      }
    });
  } catch (error) {
    console.error('Error getting GitHub status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/github/link - Link project to GitHub repository
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    
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
    const { repoName, installationId } = body;

    if (!repoName || !installationId) {
      return NextResponse.json(
        { error: 'Repository name and installation ID are required' },
        { status: 400 }
      );
    }

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.linkProjectToRepository(
      projectId, 
      repoName, 
      installationId, 
      user.id
    );

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    // Get updated sync status
    const statusResult = await GitHubFunctions.getProjectGitHubStatus(projectId, user.id);

    return NextResponse.json({
      message: 'Repository linked successfully',
      syncStatus: statusResult.success ? {
        isLinked: statusResult.isLinked,
        repositoryName: statusResult.repositoryName,
        installationId: statusResult.installationId,
        syncEnabled: statusResult.syncEnabled,
        lastSyncAt: statusResult.lastSyncAt,
      } : null,
    });
  } catch (error) {
    console.error('Error linking repository:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/github/link - Unlink project from GitHub repository
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    
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

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.unlinkProjectFromRepository(projectId, user.id);

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404 : 
                    result.error?.includes('insufficient permissions') ? 403 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      message: 'Repository unlinked successfully',
    });
  } catch (error) {
    console.error('Error unlinking repository:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}