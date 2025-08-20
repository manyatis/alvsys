import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GitHubFunctions } from '@/lib/github-functions';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/github/sync - Trigger full project sync
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
    const {
      syncComments = true,
      syncLabels = true,
    } = body;

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.syncProject(
      projectId, 
      user.id, 
      { syncComments, syncLabels }
    );

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404 : 
                    result.error?.includes('not configured') ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      message: 'Sync completed successfully',
      result: result.result,
    });
  } catch (error) {
    console.error('Error syncing project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}