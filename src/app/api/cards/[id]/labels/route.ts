import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const cardId = resolvedParams.id;
    const { labelId } = await request.json();

    if (!labelId) {
      return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });
    }

    // Check if user has access to this card through project ownership/membership
    const card = await prisma.card.findUnique({
      where: { id: cardId },
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

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasAccess = card.project.ownerId === user.id || 
                     card.project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify the label exists and belongs to the same project
    const label = await prisma.label.findUnique({
      where: { id: labelId }
    });

    if (!label || label.projectId !== card.projectId) {
      return NextResponse.json({ error: 'Label not found or does not belong to this project' }, { status: 404 });
    }

    // Check if the card already has this label
    const existingCardLabel = await prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId,
          labelId
        }
      }
    });

    if (existingCardLabel) {
      return NextResponse.json({ error: 'Label already assigned to this card' }, { status: 409 });
    }

    // Create the card-label relationship
    const cardLabel = await prisma.cardLabel.create({
      data: {
        cardId,
        labelId
      },
      include: {
        label: true
      }
    });

    return NextResponse.json(cardLabel);
  } catch (error) {
    console.error('Error assigning label to card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const cardId = resolvedParams.id;
    
    // Get labelId from query parameters
    const url = new URL(request.url);
    const labelId = url.searchParams.get('labelId');

    if (!labelId) {
      return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });
    }

    // Check if user has access to this card
    const card = await prisma.card.findUnique({
      where: { id: cardId },
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

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasAccess = card.project.ownerId === user.id || 
                     card.project.users.some(pu => pu.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Remove the card-label relationship
    await prisma.cardLabel.deleteMany({
      where: {
        cardId,
        labelId
      }
    });

    return NextResponse.json({ message: 'Label removed from card successfully' });
  } catch (error) {
    console.error('Error removing label from card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}