'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CardService } from '@/services/card-service';
import { Card } from '@/types/card';

export interface CardsResult {
  success: boolean;
  error?: string;
  cards?: Card[];
}

/**
 * Get cards for a project
 */
export async function getProjectCards(projectId: string): Promise<CardsResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Get all cards for the project
    const cards = await CardService.getCardsByProject(projectId, user.id);

    return {
      success: true,
      cards
    };
  } catch (error) {
    console.error('Error fetching cards:', error);
    return {
      success: false,
      error: 'Failed to fetch cards'
    };
  }
}

export interface SyncCardResult {
  success: boolean;
  error?: string;
  card?: Card;
}

/**
 * Sync card to GitHub
 */
export async function syncCardToGitHub(cardId: string): Promise<SyncCardResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, organizationId: true }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Import GitHubFunctions here to avoid circular dependency
    const { GitHubFunctions } = await import('@/lib/github-functions');
    const result = await GitHubFunctions.syncCardToGitHub(cardId, user.id);

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true,
      card: result.card
    };
  } catch (error) {
    console.error('Error syncing card to GitHub:', error);
    return {
      success: false,
      error: 'Failed to sync card to GitHub'
    };
  }
}

/**
 * Disable GitHub sync for card
 */
export async function disableCardGitHubSync(cardId: string): Promise<SyncCardResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, organizationId: true }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Import GitHubFunctions here to avoid circular dependency
    const { GitHubFunctions } = await import('@/lib/github-functions');
    const result = await GitHubFunctions.disableCardSync(cardId, user.id);

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error disabling GitHub sync for card:', error);
    return {
      success: false,
      error: 'Failed to disable GitHub sync for card'
    };
  }
}