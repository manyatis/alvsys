import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api/errors';

export interface GetNextReadyTaskParams {
  projectId: string;
  userId?: string; // Optional for logging purposes
}

export class AiAPI {
  static async getNextReadyTask(params: GetNextReadyTaskParams) {
    const { projectId, userId } = params;

    if (!projectId) {
      throw ApiError.badRequest('projectId is required for next_ready');
    }

    // Get the highest priority READY card that is AI-allowed
    const nextCard = await prisma.card.findFirst({
      where: {
        projectId,
        status: 'READY',
        isAiAllowedTask: true,
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        project: true,
        agentInstructions: true,
        assignee: true,
        labels: {
          include: {
            label: true
          }
        },
      },
    });

    if (!nextCard) {
      return {
        message: 'No ready tasks available. Continue polling for new tasks every 1 minute. Do not stop - keep checking for new work.',
        card: null,
        instruction: 'Wait 60 seconds, then call next_ready API again. Repeat indefinitely until tasks become available.'
      };
    }

    // Log AI activity if userId is provided
    if (userId) {
      try {
        await prisma.aIWorkLog.create({
          data: {
            cardId: nextCard.id,
            userId,
            action: 'get_next_ready_card',
            details: { projectId, title: nextCard.title },
            apiEndpoint: '/api/ai/issues'
          },
        });
      } catch (error) {
        // Don't fail if logging fails
        console.error('Failed to log AI activity:', error);
      }
    }

    return {
      card: {
        id: nextCard.id,
        title: nextCard.title,
        description: nextCard.description,
        acceptanceCriteria: nextCard.acceptanceCriteria,
        status: nextCard.status,
        priority: nextCard.priority,
        projectId: nextCard.projectId,
        isAiAllowedTask: nextCard.isAiAllowedTask,
        agentInstructions: nextCard.agentInstructions,
        project: nextCard.project,
        assignee: nextCard.assignee,
        labels: nextCard.labels,
        createdAt: nextCard.createdAt,
        updatedAt: nextCard.updatedAt,
      },
    };
  }

  static async updateCardStatus(params: {
    cardId: string;
    status: string;
    projectId: string;
    assigneeId?: string;
    userId?: string;
  }) {
    const { cardId, status, projectId, assigneeId, userId } = params;

    // Verify the card exists and belongs to the project
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        projectId,
      },
    });

    if (!card) {
      throw ApiError.notFound('Card not found in the specified project');
    }

    // Update the card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        status,
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        project: true,
        agentInstructions: true,
        assignee: true,
      },
    });

    // Log AI activity if userId is provided
    if (userId) {
      try {
        await prisma.aIWorkLog.create({
          data: {
            cardId,
            userId,
            action: 'update_card_status',
            details: { 
              oldStatus: card.status, 
              newStatus: status,
              projectId,
            },
            apiEndpoint: '/api/ai/issues'
          },
        });
      } catch (error) {
        console.error('Failed to log AI activity:', error);
      }
    }

    // If the card is marked as ready for review or completed, return the next ready card
    let nextCard = null;
    if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
      const result = await this.getNextReadyTask({ projectId, userId });
      nextCard = result.card;
    }

    return {
      updatedCard,
      nextCard,
    };
  }
}