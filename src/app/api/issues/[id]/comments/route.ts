import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateHybridAuth, createApiErrorResponse } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request);
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const resolvedParams = await params;
    const issueId = resolvedParams.id;

    // Check if user has access to this issue through project ownership/membership
    const issue = await prisma.card.findUnique({
      where: { id: issueId },
      include: {
        project: {
          include: {
            owner: true,
            users: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Check if user has access to this issue
    const hasAccess = issue.project.ownerId === user.id || 
                     issue.project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch comments for the issue
    const comments = await prisma.comment.findMany({
      where: { cardId: issueId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request);
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401);
    }

    const resolvedParams = await params;
    const issueId = resolvedParams.id;
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if user has access to this issue
    const issue = await prisma.card.findUnique({
      where: { id: issueId },
      include: {
        project: {
          include: {
            owner: true,
            users: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // User is already validated above, no need to fetch again

    const hasAccess = issue.project.ownerId === user.id || 
                     issue.project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        cardId: issueId,
        content: content.trim(),
        authorId: user.id,
        isAiComment: false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}