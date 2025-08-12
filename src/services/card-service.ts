import { PrismaClient } from '@/generated/prisma'
import { Card, CreateCardRequest, UpdateCardRequest, CardStatus } from '@/types/card'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

//if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export class CardService {
  /**
   * Get all cards for a project with optional status filter
   */
  static async getCardsByProject(projectId: string, userId: string, status?: CardStatus): Promise<Card[]> {
    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } },
        ],
      },
    })

    if (!project) {
      throw new Error('Project not found or access denied')
    }

    // Build the where clause
    const whereClause: Record<string, unknown> = { projectId }
    
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
        assignee: {
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

    return cards as Card[]
  }

  /**
   * Get a specific card by ID
   */
  static async getCardById(cardId: string): Promise<Card | null> {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
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

    return card as Card | null
  }

  /**
   * Create a new card
   */
  static async createCard(request: CreateCardRequest, userId: string): Promise<Card> {
    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: request.projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } },
        ],
      },
    })

    if (!project) {
      throw new Error('Project not found or access denied')
    }

    const card = await prisma.card.create({
      data: {
        title: request.title,
        description: request.description,
        acceptanceCriteria: request.acceptanceCriteria,
        projectId: request.projectId,
        createdById: userId,
        isAiAllowedTask: request.isAiAllowedTask ?? true,
        agentDeveloperInstructions: {
          create: request.agentInstructions?.map((instruction) => ({
            type: instruction.type,
            branchName: instruction.branchName,
            createNewBranch: instruction.createNewBranch || false,
            webResearchPrompt: instruction.webResearchPrompt,
            codeResearchPrompt: instruction.codeResearchPrompt,
            architecturePrompt: instruction.architecturePrompt,
            instructions: instruction.instructions,
          })) || [],
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
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agentDeveloperInstructions: true,
      },
    })

    return card as Card
  }

  /**
   * Update an existing card
   */
  static async updateCard(cardId: string, request: UpdateCardRequest, userId: string): Promise<Card> {
    // Check if card exists and user has access
    const existingCard = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!existingCard) {
      throw new Error('Card not found')
    }

    const hasAccess = existingCard.project.ownerId === userId || 
                     existingCard.project.users.some(pu => pu.userId === userId)

    if (!hasAccess) {
      throw new Error('Access denied')
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    if (request.title !== undefined) updateData.title = request.title
    if (request.description !== undefined) updateData.description = request.description
    if (request.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = request.acceptanceCriteria
    if (request.status !== undefined) updateData.status = request.status
    if (request.isAiAllowedTask !== undefined) updateData.isAiAllowedTask = request.isAiAllowedTask

    // Handle agent instructions update
    if (request.agentInstructions !== undefined) {
      // Delete existing instructions and create new ones
      await prisma.agentDeveloperInstruction.deleteMany({
        where: { cardId },
      })

      updateData.agentDeveloperInstructions = {
        create: request.agentInstructions.map((instruction) => ({
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
      where: { id: cardId },
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

    return updatedCard as Card
  }

  /**
   * Delete a card
   */
  static async deleteCard(cardId: string, userId: string): Promise<void> {
    // Check if card exists and user has access
    const existingCard = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        project: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!existingCard) {
      throw new Error('Card not found')
    }

    const hasAccess = existingCard.project.ownerId === userId || 
                     existingCard.project.users.some(pu => pu.userId === userId)

    if (!hasAccess) {
      throw new Error('Access denied')
    }

    await prisma.card.delete({
      where: { id: cardId },
    })
  }

  /**
   * Update card status (useful for AI agents)
   */
  static async updateCardStatus(cardId: string, status: CardStatus): Promise<Card> {
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: { status },
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

    return updatedCard as Card
  }

  /**
   * Get cards that are AI-allowed and ready for processing
   */
  static async getAiReadyCards(projectId?: string): Promise<Card[]> {
    const whereClause: Record<string, unknown> = {
      isAiAllowedTask: true,
      status: {
        in: [CardStatus.READY, CardStatus.IN_PROGRESS],
      },
    }

    if (projectId) {
      whereClause.projectId = projectId
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
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        agentDeveloperInstructions: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return cards as Card[]
  }

  /**
   * Generate a branch name based on card title
   */
  static generateBranchName(cardTitle: string, cardId?: string): string {
    const sanitized = cardTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)

    const suffix = cardId ? `-${cardId.substring(0, 8)}` : ''
    return `feature/${sanitized}${suffix}`
  }
}