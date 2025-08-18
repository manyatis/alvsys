import { prisma } from './prisma';
import { CardService } from '../services/card-service';
import { UsageService } from '../services/usage-service';
import { CardStatus } from '../types/card';
import type { Card } from '../types/card';

export interface NextReadyCardResult {
  card: {
    id: string;
    title: string;
    description: string | null;
    acceptanceCriteria: string | null;
    status: string;
    priority: number;
    projectId: string;
    isAiAllowedTask: boolean;
    agentInstructions: unknown[];
    project: unknown;
    assignee: unknown;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  message?: string;
  instruction?: string;
}

export interface UpdateCardStatusResult {
  message: string;
  card: {
    id: string;
    status: string;
    title: string;
  };
  instruction?: string;
  nextCard?: {
    id: string;
    title: string;
    description: string | null;
    acceptanceCriteria: string | null;
    status: string;
    priority: number;
    projectId: string;
    isAiAllowedTask: boolean;
    agentInstructions: unknown[];
    project: unknown;
    assignee: unknown;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class AIService {
  static async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true }
    });

    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    return project;
  }

  static async getReadyCards(projectId: string): Promise<Card[]> {
    return CardService.getAiReadyCards(projectId);
  }

  static async getNextReadyCard(projectId: string): Promise<NextReadyCardResult> {
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
      },
    });

    if (!nextCard) {
      return {
        card: null,
        message: 'No ready tasks available. Continue polling for new tasks every 1 minute. Do not stop - keep checking for new work.',
        instruction: 'Wait 60 seconds, then call next_ready API again. Repeat indefinitely until tasks become available.'
      };
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
        createdAt: nextCard.createdAt,
        updatedAt: nextCard.updatedAt,
      }
    };
  }

  static async updateCardStatus(
    cardId: string, 
    status: CardStatus, 
    projectId: string, 
    comment?: string,
    userId?: string
  ): Promise<UpdateCardStatusResult> {
    // Verify card belongs to the specified project for privacy
    const cardToUpdate = await prisma.card.findFirst({
      where: { id: cardId, projectId }
    });
    
    if (!cardToUpdate) {
      throw new Error('Card not found in specified project');
    }

    const updatedCard = await CardService.updateCardStatus(cardId, status);
    
    // Add comment if provided
    if (comment && userId) {
      await prisma.comment.create({
        data: {
          cardId,
          content: comment,
          authorId: userId,
          isAiComment: true,
        },
      });
    }
    
    // Increment usage when AI completes tasks (READY_FOR_REVIEW or COMPLETED)
    if (userId && (status === 'READY_FOR_REVIEW' || status === 'COMPLETED')) {
      await UsageService.incrementCardUsage(userId);
    }

    // Check if the card was moved to READY_FOR_REVIEW or COMPLETED, then fetch next task
    let autoNextCard = null;
    if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
      autoNextCard = await prisma.card.findFirst({
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
        },
      });
    }

    const response: UpdateCardStatusResult = {
      message: 'Card status updated successfully',
      card: {
        id: updatedCard.id,
        status: updatedCard.status,
        title: updatedCard.title,
      },
    };

    // Include next card in response if found
    if (autoNextCard) {
      response.nextCard = {
        id: autoNextCard.id,
        title: autoNextCard.title,
        description: autoNextCard.description,
        acceptanceCriteria: autoNextCard.acceptanceCriteria,
        status: autoNextCard.status,
        priority: autoNextCard.priority,
        projectId: autoNextCard.projectId,
        isAiAllowedTask: autoNextCard.isAiAllowedTask,
        agentInstructions: autoNextCard.agentInstructions,
        project: autoNextCard.project,
        assignee: autoNextCard.assignee,
        createdAt: autoNextCard.createdAt,
        updatedAt: autoNextCard.updatedAt,
      };
    } else if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
      response.message = 'Card status updated successfully. No more ready tasks available. Continue polling for new tasks every 1 minute.';
      response.instruction = 'Wait 60 seconds, then call next_ready API again. Do not stop - keep checking for new work.';
    }

    return response;
  }

  static async getCardDetails(cardId: string, projectId: string) {
    // Verify card belongs to the specified project for privacy
    const card = await prisma.card.findFirst({
      where: { id: cardId, projectId },
      include: {
        project: true,
        agentInstructions: true,
        assignee: true,
      }
    });
    
    if (!card) {
      throw new Error('Card not found in specified project');
    }

    return {
      card: {
        id: card.id,
        title: card.title,
        description: card.description,
        acceptanceCriteria: card.acceptanceCriteria,
        status: card.status,
        projectId: card.projectId,
        isAiAllowedTask: card.isAiAllowedTask,
        agentInstructions: card.agentInstructions,
        project: card.project,
        assignee: card.assignee,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      },
    };
  }

  static async logAIActivity(
    cardId: string,
    userId: string,
    action: string,
    details: Record<string, unknown>,
    apiEndpoint: string
  ) {
    return prisma.aIWorkLog.create({
      data: {
        cardId,
        userId,
        action,
        details: JSON.parse(JSON.stringify(details)), // Convert to JSON-compatible format
        apiEndpoint
      },
    });
  }
}