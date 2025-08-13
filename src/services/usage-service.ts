import { PrismaClient, SubscriptionTierType } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface UsageLimits {
  maxDailyCards: number;
  maxProjects: number;
}

export interface UsageStatus {
  canCreateCard: boolean;
  canCreateProject: boolean;
  dailyCardsUsed: number;
  dailyCardsLimit: number;
  projectsUsed: number;
  projectsLimit: number;
  resetTime: Date;
}

// Define usage limits per subscription tier
const TIER_LIMITS: Record<SubscriptionTierType, UsageLimits> = {
  FREE: {
    maxDailyCards: 20,
    maxProjects: 1,
  },
  INDIE: {
    maxDailyCards: 100,
    maxProjects: 5,
  },
  PROFESSIONAL: {
    maxDailyCards: 500,
    maxProjects: 25,
  },
};

export class UsageService {
  /**
   * Get or create usage tracking record for a user
   */
  static async getOrCreateUsageTracking(userId: string) {
    let usageTracking = await prisma.userUsageTracking.findUnique({
      where: { userId },
    });

    if (!usageTracking) {
      usageTracking = await prisma.userUsageTracking.create({
        data: {
          userId,
          dailyCardsCreated: 0,
          dailyProjectsCreated: 0,
          lastResetDate: new Date(),
        },
      });
    }

    return usageTracking;
  }

  /**
   * Get usage limits for a user based on their subscription tier
   */
  static async getUserLimits(userId: string): Promise<UsageLimits> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptionInformation: {
          include: {
            subscriptionTier: true,
          },
        },
      },
    });

    const tierType = user?.subscriptionInformation?.subscriptionTier?.tier || SubscriptionTierType.FREE;
    return TIER_LIMITS[tierType];
  }

  /**
   * Check if it's a new day and reset counters if needed
   */
  static async checkAndResetDailyUsage(userId: string) {
    const usageTracking = await this.getOrCreateUsageTracking(userId);
    const today = new Date();
    const lastResetDate = new Date(usageTracking.lastResetDate);

    // Check if it's a new day (comparing dates without time)
    const isNewDay = today.toDateString() !== lastResetDate.toDateString();

    if (isNewDay) {
      await prisma.userUsageTracking.update({
        where: { userId },
        data: {
          dailyCardsCreated: 0,
          dailyProjectsCreated: 0,
          lastResetDate: today,
        },
      });
      return true;
    }

    return false;
  }

  /**
   * Get current usage status for a user
   */
  static async getUserUsageStatus(userId: string): Promise<UsageStatus> {
    // Reset daily usage if needed
    await this.checkAndResetDailyUsage(userId);

    const usageTracking = await this.getOrCreateUsageTracking(userId);
    const limits = await this.getUserLimits(userId);

    // Get current project count
    const projectCount = await prisma.project.count({
      where: { ownerId: userId },
    });

    // Calculate next reset time (start of next day)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      canCreateCard: usageTracking.dailyCardsCreated < limits.maxDailyCards,
      canCreateProject: projectCount < limits.maxProjects,
      dailyCardsUsed: usageTracking.dailyCardsCreated,
      dailyCardsLimit: limits.maxDailyCards,
      projectsUsed: projectCount,
      projectsLimit: limits.maxProjects,
      resetTime: tomorrow,
    };
  }

  /**
   * Increment daily card creation count
   */
  static async incrementCardUsage(userId: string): Promise<boolean> {
    await this.checkAndResetDailyUsage(userId);
    
    const usageStatus = await this.getUserUsageStatus(userId);
    
    if (!usageStatus.canCreateCard) {
      return false;
    }

    await prisma.userUsageTracking.update({
      where: { userId },
      data: {
        dailyCardsCreated: {
          increment: 1,
        },
      },
    });

    return true;
  }

  /**
   * Check if user can create a project
   */
  static async canCreateProject(userId: string): Promise<boolean> {
    const usageStatus = await this.getUserUsageStatus(userId);
    return usageStatus.canCreateProject;
  }

  /**
   * Increment project creation count (handled by project count, not usage tracking)
   */
  static async validateProjectCreation(userId: string): Promise<boolean> {
    return await this.canCreateProject(userId);
  }

  /**
   * Get usage summary for display in UI
   */
  static async getUsageSummary(userId: string) {
    const usageStatus = await this.getUserUsageStatus(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptionInformation: {
          include: {
            subscriptionTier: true,
          },
        },
      },
    });

    const tierType = user?.subscriptionInformation?.subscriptionTier?.tier || SubscriptionTierType.FREE;

    return {
      tier: tierType,
      usage: usageStatus,
      isAtCardLimit: !usageStatus.canCreateCard,
      isAtProjectLimit: !usageStatus.canCreateProject,
    };
  }
}