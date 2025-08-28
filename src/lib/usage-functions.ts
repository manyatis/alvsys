'use server';

// Authentication imports removed - will be handled at a higher layer
import { UsageService } from '@/services/usage-service';
// import { prisma } from './prisma';


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
export async function getUserUsage(userId: string): Promise<UsageResult> {
  try {

    // Get usage summary
    const usageStats = await UsageService.getUserUsageStats(userId);
    
    // Transform to expected format
    const usageStatus: UsageStatus = {
      tier: 'FREE' as const,
      usage: {
        canCreateCard: !(await UsageService.hasReachedDailyCardLimit(userId)),
        canCreateProject: !(await UsageService.hasReachedProjectLimit(userId)),
        dailyCardsUsed: usageStats.dailyCardProcessingCount,
        dailyCardsLimit: 5, // Default for FREE tier
        projectsUsed: usageStats.totalProjectCount,
        projectsLimit: 1, // Default for FREE tier
        resetTime: usageStats.lastResetDate,
      },
      isAtCardLimit: await UsageService.hasReachedDailyCardLimit(userId),
      isAtProjectLimit: await UsageService.hasReachedProjectLimit(userId),
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