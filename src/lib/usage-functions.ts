'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { UsageService } from '@/services/usage-service';
import { prisma } from './prisma';


export interface UsageStatus {
  tier: 'FREE';
  usage: {
    canCreateCard: boolean;
    canCreateProject: boolean;
    dailyCardsUsed: number;
    dailyCardsLimit: number;
    projectsUsed: number;
    projectsLimit: number;
    resetTime: Date | null;
  };
  isAtCardLimit: boolean;
  isAtProjectLimit: boolean;
}

export interface UsageResult {
  success: boolean;
  error?: string;
  usage?: UsageStatus;
}

/**
 * Get user's current usage status
 */
export async function getUserUsage(): Promise<UsageResult> {
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
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Get usage summary
    const usageStats = await UsageService.getUserUsageStats(user.id);
    
    // Transform to expected format
    const usageStatus: UsageStatus = {
      tier: 'FREE' as const,
      usage: {
        canCreateCard: !(await UsageService.hasReachedDailyCardLimit(user.id)),
        canCreateProject: !(await UsageService.hasReachedProjectLimit(user.id)),
        dailyCardsUsed: usageStats.dailyCardProcessingCount,
        dailyCardsLimit: 5, // Default for FREE tier
        projectsUsed: usageStats.totalProjectCount,
        projectsLimit: 1, // Default for FREE tier
        resetTime: usageStats.lastResetDate,
      },
      isAtCardLimit: await UsageService.hasReachedDailyCardLimit(user.id),
      isAtProjectLimit: await UsageService.hasReachedProjectLimit(user.id),
    };

    return {
      success: true,
      usage: usageStatus
    };
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}