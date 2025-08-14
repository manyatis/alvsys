// This service is disabled until usage tracking models are added to the schema
// import { PrismaClient } from '@/generated/prisma';
import { SubscriptionTierType } from '@/services/subscription-service';

// const prisma = new PrismaClient();

export interface UsageLimits {
  dailyCardProcessLimit: number;
  projectLimit: number;
}

export class UsageService {
  /**
   * Get usage limits for a subscription tier (stubbed)
   */
  static getUsageLimits(tierType: SubscriptionTierType): UsageLimits {
    switch (tierType) {
      case SubscriptionTierType.FREE:
        return { dailyCardProcessLimit: 5, projectLimit: 1 };
      case SubscriptionTierType.COLLABORATIVE:
        return { dailyCardProcessLimit: 50, projectLimit: 10 };
      case SubscriptionTierType.ENTERPRISE:
        return { dailyCardProcessLimit: -1, projectLimit: -1 }; // unlimited
      default:
        return { dailyCardProcessLimit: 5, projectLimit: 1 };
    }
  }

  /**
   * Get or create usage tracking for a user (stubbed)
   */
  static async getOrCreateUsageTracking(userId: string) {
    console.log('Usage tracking not implemented for user:', userId);
    return null;
  }

  /**
   * Check if user has reached daily card processing limit (always returns false)
   */
  static async hasReachedDailyCardLimit(userId: string): Promise<boolean> {
    console.log('Daily card limit check not implemented for user:', userId);
    return false; // Always allow for now
  }

  /**
   * Check if user has reached project limit (always returns false)
   */
  static async hasReachedProjectLimit(userId: string): Promise<boolean> {
    console.log('Project limit check not implemented for user:', userId);
    return false; // Always allow for now
  }

  /**
   * Increment card usage for a user (stubbed)
   */
  static async incrementCardUsage(userId: string): Promise<void> {
    console.log('Card usage increment not implemented for user:', userId);
  }

  /**
   * Get current card usage for today (returns 0)
   */
  static async getDailyCardUsage(userId: string): Promise<number> {
    console.log('Daily card usage check not implemented for user:', userId);
    return 0;
  }

  /**
   * Get total project count for user (returns 0)
   */
  static async getProjectCount(userId: string): Promise<number> {
    console.log('Project count check not implemented for user:', userId);
    return 0;
  }

  /**
   * Reset daily usage counters (stubbed)
   */
  static async resetDailyUsage(): Promise<void> {
    console.log('Daily usage reset not implemented');
  }

  /**
   * Get usage statistics for a user (returns empty stats)
   */
  static async getUserUsageStats(userId: string) {
    console.log('Usage stats not implemented for user:', userId);
    return {
      dailyCardProcessingCount: 0,
      totalProjectCount: 0,
      lastResetDate: new Date(),
    };
  }
}