import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GitHubFunctions } from '@/lib/github-functions';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/github/reset-sync - Reset the GitHub sync timestamp for debugging
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

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.resetProjectSync(projectId, user.id);

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404 : 
                    result.error?.includes('not linked') ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      message: 'GitHub sync reset successfully. Next sync will process all issues.',
    });
  } catch (error) {
    console.error('Error resetting GitHub sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}