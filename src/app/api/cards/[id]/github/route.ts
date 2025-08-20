import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GitHubFunctions } from '@/lib/github-functions';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/cards/[id]/github - Sync specific card to GitHub
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: cardId } = await params;
    
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.syncCardToGitHub(cardId, user.id);

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404 : 
                    result.error?.includes('not linked') ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      message: 'Card synced to GitHub successfully',
      card: result.card,
    });
  } catch (error) {
    console.error('Error syncing card to GitHub:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id]/github - Disable GitHub sync for specific card
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: cardId } = await params;
    
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use the consolidated GitHub functions
    const result = await GitHubFunctions.disableCardSync(cardId, user.id);

    if (!result.success) {
      const status = result.error?.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      message: 'GitHub sync disabled for card',
    });
  } catch (error) {
    console.error('Error disabling GitHub sync for card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}