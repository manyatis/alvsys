// This service is disabled until subscription models are added to the schema
// import { PrismaClient } from '@/generated/prisma';
// const prisma = new PrismaClient();

// Define the subscription tiers since they're not in the schema
export enum SubscriptionTierType {
  FREE = 'FREE',
  INDIE = 'INDIE', 
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface SubscriptionTierData {
  tier: SubscriptionTierType;
  projectLimit: number;
  dailyCardProcessLimit: number;
}

export class SubscriptionService {
  // Default tiers
  static readonly TIERS: Record<SubscriptionTierType, SubscriptionTierData> = {
    [SubscriptionTierType.FREE]: {
      tier: SubscriptionTierType.FREE,
      projectLimit: 1,
      dailyCardProcessLimit: 5,
    },
    [SubscriptionTierType.INDIE]: {
      tier: SubscriptionTierType.INDIE,
      projectLimit: 10,
      dailyCardProcessLimit: 50,
    },
    [SubscriptionTierType.PROFESSIONAL]: {
      tier: SubscriptionTierType.PROFESSIONAL,
      projectLimit: -1, // unlimited
      dailyCardProcessLimit: -1, // unlimited
    },
  };

  /**
   * Initialize default subscription tiers (stubbed)
   */
  static async initializeDefaultTiers(): Promise<void> {
    console.log('Subscription service is stubbed - skipping tier initialization');
  }

  /**
   * Create a subscription tier if it doesn't already exist (stubbed)
   */
  static async createSubscriptionTierIfNotExists(
    tierData: SubscriptionTierData
  ): Promise<void> {
    console.log('Subscription tier creation not implemented:', tierData);
  }

  /**
   * Get a subscription tier by type (stubbed)
   */
  static async getSubscriptionTier(tierType: SubscriptionTierType) {
    return null; // TODO: Implement when subscription models are added
  }

  /**
   * Assign a subscription tier to a user (stubbed)
   */
  static async assignSubscriptionToUser(
    userId: string,
    tierType: SubscriptionTierType,
    stripeSubscriptionId?: string
  ): Promise<void> {
    console.log('Subscription assignment not implemented:', { userId, tierType, stripeSubscriptionId });
  }

  /**
   * Get user's current subscription info (returns default FREE tier)
   */
  static async getUserSubscriptionInfo(userId: string) {
    return {
      userId,
      tier: this.TIERS[SubscriptionTierType.FREE],
      stripeSubscriptionId: null,
      status: 'active',
      currentPeriodEnd: null,
    };
  }

  /**
   * Check if user can create more projects (always returns true for now)
   */
  static async canUserCreateProject(userId: string): Promise<boolean> {
    return true; // Default to allowing all users to create projects
  }

  /**
   * Get current project usage for user (returns 0)
   */
  static async getUserProjectCount(userId: string): Promise<number> {
    return 0; // TODO: Implement when subscription enforcement is needed
  }

  /**
   * Check if user can process more cards today (always returns true for now)
   */
  static async canUserProcessCard(userId: string): Promise<boolean> {
    return true; // Default to allowing all users to process cards
  }

  /**
   * Get current daily card usage for user (returns 0)
   */
  static async getUserDailyCardUsage(userId: string): Promise<number> {
    return 0; // TODO: Implement when subscription enforcement is needed
  }

  /**
   * Upgrade user subscription (stubbed)
   */
  static async upgradeUserSubscription(
    userId: string,
    newTierType: SubscriptionTierType,
    stripeSubscriptionId: string
  ): Promise<void> {
    console.log('Subscription upgrade not implemented:', { userId, newTierType, stripeSubscriptionId });
  }

  /**
   * Downgrade user subscription (stubbed)
   */
  static async downgradeUserSubscription(
    userId: string,
    newTierType: SubscriptionTierType
  ): Promise<void> {
    console.log('Subscription downgrade not implemented:', { userId, newTierType });
  }

  /**
   * Cancel user subscription (stubbed)
   */
  static async cancelUserSubscription(userId: string): Promise<void> {
    console.log('Subscription cancellation not implemented:', userId);
  }
}