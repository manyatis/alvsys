import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateHybridAuth, createApiErrorResponse } from '@/lib/api-auth'

// GET /api/issues/[id] - Get a specific issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request)
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    const issue = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      include: {
        assignee: {
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
        agentInstructions: true,
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

    // Check if user has access to the project
    const hasAccess = await prisma.project.findFirst({
      where: {
        id: issue.projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } },
        ],
      },
    })

    if (!hasAccess) {
      return createApiErrorResponse('Access denied', 403)
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
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request)
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const {
      title,
      description,
      acceptanceCriteria,
      status,
      priority,
      storyPoints,
      isAiAllowedTask,
      agentInstructions,
      sprintId,
    } = body

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
    if (storyPoints !== undefined) updateData.storyPoints = storyPoints
    if (isAiAllowedTask !== undefined) updateData.isAiAllowedTask = isAiAllowedTask
    if (sprintId !== undefined) updateData.sprintId = sprintId

    // Handle agent instructions update
    if (agentInstructions !== undefined) {
      // Delete existing instructions and create new ones
      await prisma.agentDeveloperInstructions.deleteMany({
        where: { cardId: resolvedParams.id },
      })

      updateData.agentInstructions = {
        create: agentInstructions.map((instruction: Record<string, unknown>) => ({
          instructionType: instruction.instructionType,
          branchName: instruction.branchName,
          createBranch: instruction.createBranch || false,
          webResearchPrompt: instruction.webResearchPrompt,
          codeResearchPrompt: instruction.codeResearchPrompt,
          architectureGuidelines: instruction.architectureGuidelines,
          generalInstructions: instruction.generalInstructions,
        })),
      }
    }

    const updatedIssue = await prisma.card.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        assignee: {
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
        agentInstructions: true,
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
    // Validate authentication (API key or session)
    const user = await validateHybridAuth(request)
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
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