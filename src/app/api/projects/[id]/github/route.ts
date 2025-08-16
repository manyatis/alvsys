import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';
import { ProjectGitHubService } from '@/services/github-sync-service';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/github - Get GitHub integration status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: validation.userId! },
          { users: { some: { userId: validation.userId! } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get sync status
    const syncStatus = await ProjectGitHubService.getSyncStatus(projectId);

    return NextResponse.json({ syncStatus });
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
    
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Check project ownership (only owners can link repositories)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: validation.userId!,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or insufficient permissions' }, { status: 404 });
    }

    const body = await request.json();
    const { repoName, installationId } = body;

    if (!repoName || !installationId) {
      return NextResponse.json(
        { error: 'Repository name and installation ID are required' },
        { status: 400 }
      );
    }

    // Link the repository
    const result = await ProjectGitHubService.linkRepository(projectId, repoName, installationId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Get updated sync status
    const syncStatus = await ProjectGitHubService.getSyncStatus(projectId);

    return NextResponse.json({
      message: 'Repository linked successfully',
      syncStatus,
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
    
    // Validate API access
    const validation = await validateApiAccess(request);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Check project ownership (only owners can unlink repositories)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: validation.userId!,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or insufficient permissions' }, { status: 404 });
    }

    // Unlink the repository
    const result = await ProjectGitHubService.unlinkRepository(projectId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
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