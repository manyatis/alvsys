import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@/generated/prisma'
import { authOptions } from '@/lib/auth'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET /api/cards - Get all cards for a project with optional status filter
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Build the where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: { projectId: string; status?: any } = {
      projectId: projectId,
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status
    }

    const cards = await prisma.card.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agentDeveloperInstructions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cards - Create a new card
export async function POST(request: NextRequest) {
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
      projectId,
      isAiAllowedTask = true,
      agentInstructions = [],
    } = body

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and projectId are required' },
        { status: 400 }
      )
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } },
        ],
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 })
    }

    const card = await prisma.card.create({
      data: {
        title,
        description,
        acceptanceCriteria,
        projectId,
        createdById: user.id,
        isAiAllowedTask,
        agentDeveloperInstructions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: agentInstructions.map((instruction: any) => ({
            type: instruction.type,
            branchName: instruction.branchName,
            createNewBranch: instruction.createNewBranch || false,
            webResearchPrompt: instruction.webResearchPrompt,
            codeResearchPrompt: instruction.codeResearchPrompt,
            architecturePrompt: instruction.architecturePrompt,
            instructions: instruction.instructions,
          })),
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agentDeveloperInstructions: true,
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}