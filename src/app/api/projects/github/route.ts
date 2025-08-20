import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { GitHubFunctions } from '@/lib/github-functions';

const prisma = new PrismaClient();

// POST /api/projects/github - Create a project from a GitHub repository
export async function POST(request: NextRequest) {
  try {
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
    const { repoName, repoDescription, installationId, syncIssues = true } = body;

    if (!repoName || !installationId) {
      return NextResponse.json(
        { error: 'Repository name and installation ID are required' },
        { status: 400 }
      );
    }

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.createProjectFromRepository(
      repoName,
      repoDescription,
      installationId,
      syncIssues,
      user.id
    );

    if (!result.success) {
      const status = result.error?.includes('already exists') ? 400 :
                    result.error?.includes('not connected') ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      project: result.project,
      message: result.message,
    });
  } catch (error) {
    console.error('Error creating project from GitHub:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}