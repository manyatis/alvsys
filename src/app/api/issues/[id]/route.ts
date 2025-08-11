import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/issues/[id] - Get a specific issue
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

    const issue = await prisma.card.findUnique({
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
        labels: {
          include: {
            label: true
          }
        },
      },
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Error fetching issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/issues/[id] - Update an issue
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
      effortPoints,
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

    // Check if issue exists and user has access
    const existingIssue = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!existingIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const hasAccess = existingIssue.project.ownerId === user.id || 
                     existingIssue.project.users.some(pu => pu.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update issue and agent instructions
    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (acceptanceCriteria !== undefined) updateData.acceptanceCriteria = acceptanceCriteria
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (effortPoints !== undefined) updateData.effortPoints = effortPoints
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

    const updatedIssue = await prisma.card.update({
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
        labels: {
          include: {
            label: true
          }
        },
      },
    })

    return NextResponse.json(updatedIssue)
  } catch (error) {
    console.error('Error updating issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/issues/[id] - Delete an issue
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

    // Check if issue exists and user has access
    const existingIssue = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!existingIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const hasAccess = existingIssue.project.ownerId === user.id || 
                     existingIssue.project.users.some(pu => pu.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.card.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ message: 'Issue deleted successfully' })
  } catch (error) {
    console.error('Error deleting issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}