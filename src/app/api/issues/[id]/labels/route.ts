import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const issueId = resolvedParams.id;
    const { labelId } = await request.json();

    if (!labelId) {
      return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });
    }

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasAccess = issue.project.ownerId === user.id || 
                     issue.project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify the label exists and belongs to the same project
    const label = await prisma.label.findUnique({
      where: { id: labelId }
    });

    if (!label || label.projectId !== issue.projectId) {
      return NextResponse.json({ error: 'Label not found or does not belong to this project' }, { status: 404 });
    }

    // Check if the issue already has this label
    const existingIssueLabel = await prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId: issueId,
          labelId
        }
      }
    });

    if (existingIssueLabel) {
      return NextResponse.json({ error: 'Label already assigned to this issue' }, { status: 409 });
    }

    // Create the issue-label relationship
    const issueLabel = await prisma.cardLabel.create({
      data: {
        cardId: issueId,
        labelId
      },
      include: {
        label: true
      }
    });

    return NextResponse.json(issueLabel);
  } catch (error) {
    console.error('Error assigning label to issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const issueId = resolvedParams.id;
    
    // Get labelId from query parameters or request body
    let labelId: string;
    
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      labelId = url.searchParams.get('labelId') || '';
      
      // If not in query params, try to get from body
      if (!labelId) {
        try {
          const body = await request.json();
          labelId = body.labelId;
        } catch {
          // Ignore JSON parse errors for DELETE requests
        }
      }
    } else {
      const body = await request.json();
      labelId = body.labelId;
    }

    if (!labelId) {
      return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasAccess = issue.project.ownerId === user.id || 
                     issue.project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Remove the issue-label relationship
    await prisma.cardLabel.deleteMany({
      where: {
        cardId: issueId,
        labelId
      }
    });

    return NextResponse.json({ message: 'Label removed from issue successfully' });
  } catch (error) {
    console.error('Error removing label from issue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}