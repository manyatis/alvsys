import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateApiAccess } from '@/lib/api-auth';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/github/reset-sync - Reset the GitHub sync timestamp for debugging
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Reset the sync timestamp
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        githubLastSyncAt: null,
      },
    });

    // Also delete any existing sync records to start fresh
    await prisma.gitHubIssueSync.deleteMany({
      where: { projectId },
    });

    return NextResponse.json({
      message: 'GitHub sync timestamp reset successfully. Next sync will process all issues.',
    });
  } catch (error) {
    console.error('Error resetting GitHub sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}