import { NextRequest, NextResponse } from 'next/server'
import { validateHybridAuth, createApiErrorResponse } from '@/lib/api-auth'
import { IssuesAPI } from '@/lib/api/issues'
import { handleApiError } from '@/lib/api/errors'
import { prisma } from '@/lib/prisma'

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

    // Get the issue to find its project
    const issueWithProject = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      select: { projectId: true }
    })

    if (!issueWithProject) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const hasAccess = await prisma.project.findFirst({
      where: {
        id: issueWithProject.projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } },
        ],
      },
    })

    if (!hasAccess) {
      return createApiErrorResponse('Access denied', 403)
    }

    const issue = await IssuesAPI.getIssueById(resolvedParams.id, issueWithProject.projectId)
    return NextResponse.json(issue)
  } catch (error) {
    const { data, status } = handleApiError(error)
    return NextResponse.json(data, { status })
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

    // Get the issue to find its project
    const issueWithProject = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      select: { projectId: true }
    })

    if (!issueWithProject) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const hasAccess = await prisma.project.findFirst({
      where: {
        id: issueWithProject.projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } },
        ],
      },
    })

    if (!hasAccess) {
      return createApiErrorResponse('Access denied', 403)
    }

    const body = await request.json()
    
    // Handle agent instructions update separately if provided
    if (body.agentInstructions !== undefined) {
      // Delete existing instructions and create new ones
      await prisma.agentDeveloperInstructions.deleteMany({
        where: { cardId: resolvedParams.id },
      })

      await prisma.card.update({
        where: { id: resolvedParams.id },
        data: {
          agentInstructions: {
            create: body.agentInstructions.map((instruction: Record<string, unknown>) => ({
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
      })
    }

    // Update the issue with other fields
    const { agentInstructions, ...updateParams } = body
    const updatedIssue = await IssuesAPI.updateIssue(
      resolvedParams.id, 
      issueWithProject.projectId,
      updateParams
    )

    return NextResponse.json(updatedIssue)
  } catch (error) {
    const { data, status } = handleApiError(error)
    return NextResponse.json(data, { status })
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

    // Get the issue to find its project
    const issueWithProject = await prisma.card.findUnique({
      where: { id: resolvedParams.id },
      select: { projectId: true }
    })

    if (!issueWithProject) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const hasAccess = await prisma.project.findFirst({
      where: {
        id: issueWithProject.projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } },
        ],
      },
    })

    if (!hasAccess) {
      return createApiErrorResponse('Access denied', 403)
    }

    await IssuesAPI.deleteIssue(resolvedParams.id, issueWithProject.projectId)
    return NextResponse.json({ message: 'Issue deleted successfully' })
  } catch (error) {
    const { data, status } = handleApiError(error)
    return NextResponse.json(data, { status })
  }
}