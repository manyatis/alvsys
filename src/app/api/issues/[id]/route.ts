import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateHybridAuth, createApiErrorResponse } from '@/lib/api-auth'
import { GitHubSyncService } from '@/services/github-sync-service'

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
      assigneeId,
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
    if (assigneeId !== undefined) {
      // Handle assigneeId validation - null/empty string should set to null
      if (assigneeId === '' || assigneeId === null) {
        updateData.assigneeId = null;
      } else {
        // Verify the user exists before assigning
        const assigneeExists = await prisma.user.findUnique({
          where: { id: assigneeId },
          select: { id: true },
        });
        
        if (assigneeExists) {
          updateData.assigneeId = assigneeId;
        } else {
          console.warn(`Assignee ID ${assigneeId} not found, setting to null`);
          updateData.assigneeId = null;
        }
      }
    }

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
            githubSyncEnabled: true,
            githubRepoName: true,
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

    // If this card has GitHub sync enabled and relevant fields were updated, sync to GitHub
    const shouldSyncToGitHub = (
      (title !== undefined || description !== undefined || status !== undefined || assigneeId !== undefined) &&
      updatedIssue.project.githubSyncEnabled && 
      updatedIssue.githubSyncEnabled
    );
    
    if (shouldSyncToGitHub) {
      try {
        // Use the installation-based sync service
        const syncService = await GitHubSyncService.createForProject(updatedIssue.projectId);
        
        if (syncService) {
          await syncService.syncCardToGitHub(updatedIssue.id);
          console.log(`Synced card ${updatedIssue.id} changes to GitHub`);
        } else {
          console.log('GitHub sync service not available for project');
        }
      } catch (syncError) {
        console.error('Failed to sync changes to GitHub:', syncError);
        // Don't fail the card update if GitHub sync fails
      }
    }

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