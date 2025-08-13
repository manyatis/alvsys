import { PrismaClient, SubscriptionTierType } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface SubscriptionTierData {
  tier: SubscriptionTierType;
  projectLimit: number;
  dailyCardProcessLimit: number;
}

// Default tier configurations
const DEFAULT_TIER_CONFIGS: SubscriptionTierData[] = [
  {
    tier: SubscriptionTierType.FREE,
    projectLimit: 1,
    dailyCardProcessLimit: 20,
  },
  {
    tier: SubscriptionTierType.INDIE,
    projectLimit: 5,
    dailyCardProcessLimit: 100,
  },
  {
    tier: SubscriptionTierType.PROFESSIONAL,
    projectLimit: 25,
    dailyCardProcessLimit: 500,
  },
];

export class SubscriptionService {
  /**
   * Create all subscription tiers if they don't exist
   */
  static async createDefaultSubscriptionTiers(): Promise<void> {
    for (const tierConfig of DEFAULT_TIER_CONFIGS) {
      await this.createSubscriptionTierIfNotExists(tierConfig);
    }
  }

  /**
   * Create a subscription tier if it doesn't already exist
   */
  static async createSubscriptionTierIfNotExists(
    tierData: SubscriptionTierData
  ): Promise<void> {
    const existingTier = await prisma.subscriptionTier.findUnique({
      where: { tier: tierData.tier },
    });

    if (!existingTier) {
      await prisma.subscriptionTier.create({
        data: {
          tier: tierData.tier,
          projectLimit: tierData.projectLimit,
          dailyCardProcessLimit: tierData.dailyCardProcessLimit,
        },
      });
      console.log(`Created subscription tier: ${tierData.tier}`);
    } else {
      console.log(`Subscription tier already exists: ${tierData.tier}`);
    }
  }

  /**
   * Get a subscription tier by type
   */
  static async getSubscriptionTier(tierType: SubscriptionTierType) {
    return await prisma.subscriptionTier.findUnique({
      where: { tier: tierType },
    });
  }

  /**
   * Assign a subscription tier to a user
   */
  static async assignSubscriptionToUser(
    userId: string,
    tierType: SubscriptionTierType,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ): Promise<void> {
    // Ensure the tier exists
    await this.createSubscriptionTierIfNotExists(
      DEFAULT_TIER_CONFIGS.find(config => config.tier === tierType)!
    );

    // Get the subscription tier
    const subscriptionTier = await this.getSubscriptionTier(tierType);
    if (!subscriptionTier) {
      throw new Error(`Subscription tier ${tierType} not found`);
    }

    // Check if user already has a subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptionInformation: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.subscriptionInformation) {
      // Update existing subscription
      await prisma.subscriptionInformation.update({
        where: { id: user.subscriptionInformation.id },
        data: {
          subscriptionTierId: subscriptionTier.id,
          stripeCustomerId: stripeCustomerId || user.subscriptionInformation.stripeCustomerId,
          stripeSubscriptionId: stripeSubscriptionId || user.subscriptionInformation.stripeSubscriptionId,
        },
      });
      console.log(`Updated subscription for user ${userId} to ${tierType}`);
    } else {
      // Create new subscription information
      const subscriptionInfo = await prisma.subscriptionInformation.create({
        data: {
          subscriptionTierId: subscriptionTier.id,
          stripeCustomerId,
          stripeSubscriptionId,
        },
      });

      // Link to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionInformationId: subscriptionInfo.id,
        },
      });
      console.log(`Created new subscription for user ${userId} with tier ${tierType}`);
    }
  }

  /**
   * Assign PROFESSIONAL subscription to a user
   */
  static async assignProfessionalSubscription(
    userId: string,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ): Promise<void> {
    await this.assignSubscriptionToUser(
      userId,
      SubscriptionTierType.PROFESSIONAL,
      stripeCustomerId,
      stripeSubscriptionId
    );
  }

  /**
   * Get user's current subscription information
   */
  static async getUserSubscriptionInfo(userId: string) {
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

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return {
      user,
      subscription: user.subscriptionInformation,
      tier: user.subscriptionInformation?.subscriptionTier || null,
    };
  }

  /**
   * Initialize subscription system - creates all default tiers
   */
  static async initializeSubscriptionSystem(): Promise<void> {
    console.log('Initializing subscription system...');
    await this.createDefaultSubscriptionTiers();
    console.log('Subscription system initialized successfully');
  }

  /**
   * Upgrade user to a higher tier
   */
  static async upgradeUserSubscription(
    userId: string,
    newTierType: SubscriptionTierType,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ): Promise<void> {
    const currentInfo = await this.getUserSubscriptionInfo(userId);
    const currentTier = currentInfo.tier?.tier || SubscriptionTierType.FREE;

    // Validate upgrade is to a higher tier (basic validation)
    const tierOrder = [SubscriptionTierType.FREE, SubscriptionTierType.INDIE, SubscriptionTierType.PROFESSIONAL];
    const currentIndex = tierOrder.indexOf(currentTier);
    const newIndex = tierOrder.indexOf(newTierType);

    if (newIndex <= currentIndex) {
      console.warn(`User ${userId} already has tier ${currentTier}, not upgrading to ${newTierType}`);
      return;
    }

    await this.assignSubscriptionToUser(userId, newTierType, stripeCustomerId, stripeSubscriptionId);
    console.log(`Upgraded user ${userId} from ${currentTier} to ${newTierType}`);
  }

  /**
   * Downgrade user to a lower tier
   */
  static async downgradeUserSubscription(
    userId: string,
    newTierType: SubscriptionTierType
  ): Promise<void> {
    const currentInfo = await this.getUserSubscriptionInfo(userId);
    const currentTier = currentInfo.tier?.tier || SubscriptionTierType.FREE;

    // Validate downgrade is to a lower tier
    const tierOrder = [SubscriptionTierType.FREE, SubscriptionTierType.INDIE, SubscriptionTierType.PROFESSIONAL];
    const currentIndex = tierOrder.indexOf(currentTier);
    const newIndex = tierOrder.indexOf(newTierType);

    if (newIndex >= currentIndex) {
      console.warn(`User ${userId} has tier ${currentTier}, not downgrading to ${newTierType}`);
      return;
    }

    // Remove Stripe information on downgrade (assuming they cancelled)
    await this.assignSubscriptionToUser(userId, newTierType);
    console.log(`Downgraded user ${userId} from ${currentTier} to ${newTierType}`);
  }

  /**
   * Cancel user subscription (downgrade to FREE)
   */
  static async cancelUserSubscription(userId: string): Promise<void> {
    await this.downgradeUserSubscription(userId, SubscriptionTierType.FREE);
  }
}