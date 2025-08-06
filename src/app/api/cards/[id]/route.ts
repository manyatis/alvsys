import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@/generated/prisma'
import { authOptions } from '@/lib/auth'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET /api/cards/[id] - Get a specific card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const card = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        agentDeveloperInstructions: true,
      },
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error fetching card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/cards/[id] - Update a card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      acceptanceCriteria,
      status,
      priority,
      isAiAllowedTask,
      agentInstructions,
    } = body

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if card exists and user has access
    const existingCard = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const hasAccess = existingCard.project.ownerId === user.id || 
                     existingCard.project.users.some(pu => pu.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update card and agent instructions
    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (acceptanceCriteria !== undefined) updateData.acceptanceCriteria = acceptanceCriteria
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (isAiAllowedTask !== undefined) updateData.isAiAllowedTask = isAiAllowedTask

    // Handle agent instructions update
    if (agentInstructions !== undefined) {
      // Delete existing instructions and create new ones
      await prisma.agentDeveloperInstruction.deleteMany({
        where: { cardId: resolvedParams.id },
      })

      updateData.agentDeveloperInstructions = {
        create: agentInstructions.map((instruction: Record<string, unknown>) => ({
          type: instruction.type,
          branchName: instruction.branchName,
          createNewBranch: instruction.createNewBranch || false,
          webResearchPrompt: instruction.webResearchPrompt,
          codeResearchPrompt: instruction.codeResearchPrompt,
          architecturePrompt: instruction.architecturePrompt,
          instructions: instruction.instructions,
        })),
      }
    }

    const updatedCard = await prisma.card.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        agentDeveloperInstructions: true,
      },
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cards/[id] - Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if card exists and user has access
    const existingCard = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const hasAccess = existingCard.project.ownerId === user.id || 
                     existingCard.project.users.some(pu => pu.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.card.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ message: 'Card deleted successfully' })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}