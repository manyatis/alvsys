import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UsageService } from '@/services/usage-service'
import { validateHybridAuthForProject, createApiErrorResponse } from '@/lib/api-auth'

// GET /api/issues - Get all issues for a project with optional status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate authentication (API key or session)
    const user = await validateHybridAuthForProject(request, projectId)
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    const status = searchParams.get('status')

    // Build the where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: { projectId: string; status?: any; sprintId?: string | null } = {
      projectId: projectId,
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status
    }

    // Check if we should filter by active sprint
    const showOnlyActiveSprint = searchParams.get('activeSprint') === 'true'
    
    if (showOnlyActiveSprint) {
      // Find the active sprint for this project
      const activeSprint = await prisma.sprint.findFirst({
        where: {
          projectId,
          isActive: true,
        },
      })
      
      // If there's an active sprint, filter cards by it
      // Otherwise, show cards with no sprint assigned (backlog)
      if (activeSprint) {
        whereClause.sprintId = activeSprint.id
      } else {
        whereClause.sprintId = null
      }
    }

    const issues = await prisma.card.findMany({
      where: whereClause,
      include: {
        // createdBy removed from schema
        // createdBy: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //   },
        // },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agentInstructions: true,
        labels: {
          include: {
            label: true
          }
        },
        sprint: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(issues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/issues - Create a new issue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      acceptanceCriteria,
      projectId,
      priority = 3,
      storyPoints = 5,
      isAiAllowedTask = true,
      agentInstructions = [],
      status,
      sprintId,
    } = body

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and projectId are required' },
        { status: 400 }
      )
    }

    // Validate authentication (API key or session)
    const user = await validateHybridAuthForProject(request, projectId)
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    // Check usage limits before creating card
    const hasReachedLimit = await UsageService.hasReachedDailyCardLimit(user.id)
    if (hasReachedLimit) {
      const usageStats = await UsageService.getUserUsageStats(user.id)
      return NextResponse.json({ 
        error: 'Daily card limit reached', 
        usageLimit: {
          used: usageStats.dailyCardProcessingCount,
          limit: 5, // Default limit for now since service is stubbed
          resetTime: usageStats.lastResetDate,
        }
      }, { status: 429 })
    }

    const issue = await prisma.card.create({
      data: {
        title,
        description,
        acceptanceCriteria,
        projectId,
        priority,
        storyPoints,
        // createdById removed from schema - not setting on creation
        isAiAllowedTask,
        status,
        sprintId,
        agentInstructions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: agentInstructions.map((instruction: any) => ({
            instructionType: instruction.instructionType,
            branchName: instruction.branchName,
            createBranch: instruction.createBranch || false,
            webResearchPrompt: instruction.webResearchPrompt,
            codeResearchPrompt: instruction.codeResearchPrompt,
            architectureGuidelines: instruction.architectureGuidelines,
            generalInstructions: instruction.generalInstructions,
          })),
        },
      },
      include: {
        // createdBy removed from schema
        // createdBy: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //   },
        // },
        agentInstructions: true,
      },
    })

    // Increment usage after successful card creation
    await UsageService.incrementCardUsage(user.id)

    return NextResponse.json(issue, { status: 201 })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}