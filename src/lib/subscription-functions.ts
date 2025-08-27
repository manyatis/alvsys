'use server';

// Authentication imports removed - will be handled at a higher layer
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe-server';

export interface SubscriptionPlan {
  id: string;
  planId: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  features: string[];
  description: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  isActive: boolean;
}

export interface SubscriptionPlansResult {
  success: boolean;
  error?: string;
  plans?: SubscriptionPlan[];
}

export interface CreateStripeSessionResult {
  success: boolean;
  error?: string;
  sessionId?: string;
  sessionUrl?: string;
  planId?: string;
  planName?: string;
  message?: string;
}

export interface SeedPlansResult {
  success: boolean;
  error?: string;
  message?: string;
  plans?: Array<{
    name: string;
    price: string;
    active: boolean;
  }>;
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlansResult> {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: {
        priceCents: 'asc'
      }
    });

    return {
      success: true,
      plans: plans.map(plan => ({
        ...plan,
        id: plan.id.toString()
      }))
    };
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return {
      success: false,
      error: 'Failed to fetch subscription plans'
    };
  }
}

/**
 * Create Stripe checkout session for subscription
 */
export async function createStripeSession(
  planId: string,
  userId: string,
  userEmail: string,
  userName?: string | null,
  stripeCustomerId?: string | null,
  subscriptionId?: string | null,
  subscriptionStatus?: string | null
): Promise<CreateStripeSessionResult> {
  try {

    // Validate required fields
    if (!planId) {
      return {
        success: false,
        error: 'Missing required field: planId'
      };
    }

    // Check if user already has an active subscription
    if (subscriptionId && subscriptionStatus === 'active') {
      return {
        success: false,
        error: 'User already has an active subscription'
      };
    }

    // Get subscription plan details
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { planId }
    });

    if (!subscriptionPlan || !subscriptionPlan.isActive) {
      return {
        success: false,
        error: 'Invalid or inactive subscription plan'
      };
    }

    console.debug(`🔄 Creating Stripe subscription for ${userEmail}: ${subscriptionPlan.name} plan`);

    // Create or get existing Stripe customer
    let customerIdToUse = stripeCustomerId;
    
    if (!customerIdToUse) {
      console.debug('👤 Creating Stripe customer...');
      const customer = await getStripe().customers.create({
        email: userEmail,
        name: userName || undefined,
        metadata: {
          userId: userId,
        }
      });
      
      customerIdToUse = customer.id;
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerIdToUse }
      });
      
      console.debug('✅ Stripe customer created:', customerIdToUse);
    }

    // For now, we'll use a test price ID. In production, you would create prices in Stripe dashboard
    // and store them in the subscriptionPlan.stripePriceId field
    let stripePriceId = subscriptionPlan.stripePriceId;
    
    if (!stripePriceId) {
      // Create a price on the fly for testing (you'd normally do this once in Stripe dashboard)
      console.debug('💰 Creating Stripe price...');
      
      // First, create or get the product
      const product = await getStripe().products.create({
        name: `MemoLab ${subscriptionPlan.name} Plan`,
        description: subscriptionPlan.description || undefined,
        metadata: {
          planId: subscriptionPlan.planId,
        }
      });

      const price = await getStripe().prices.create({
        unit_amount: subscriptionPlan.priceCents,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        product: product.id,
        metadata: {
          planId: subscriptionPlan.planId,
        }
      });
      
      stripePriceId = price.id;
      
      // Update subscription plan with Stripe IDs (placeholder - would update in real app)
      console.log(`Would update subscription plan ${subscriptionPlan.id} with Stripe IDs`);
      
      console.debug('✅ Stripe price created:', stripePriceId);
    }

    // Create Stripe Checkout Session for subscription
    console.debug('📋 Creating Stripe Checkout Session...');
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer: customerIdToUse,
      line_items: [{
        price: stripePriceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXTAUTH_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscribe/cancel`,
      metadata: {
        userId: userId,
        planId: subscriptionPlan.planId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: subscriptionPlan.planId,
        }
      }
    });

    console.debug('✅ Checkout Session created:', checkoutSession.id);

    return {
      success: true,
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url || '',
      planId: planId,
      planName: subscriptionPlan.name,
      message: 'Checkout session created successfully'
    };
  } catch (error) {
    console.error('❌ Stripe subscription creation error:', error);

    return {
      success: false,
      error: 'Failed to create subscription'
    };
  }
}

/**
 * Seed subscription plans (for development/setup)
 */
export async function seedSubscriptionPlans(): Promise<SeedPlansResult> {
  try {
    // Clear existing plans
    await prisma.subscriptionPlan.deleteMany({});
    
    // Create new pricing structure
    const plans = [
      {
        planId: 'hobby',
        name: 'Hobby',
        priceCents: 0,
        billingPeriod: 'forever',
        features: [
          'Self hosting available',
          'Hosted 1 project free',
          'AI-powered issue tracking',
          'Sprint management',
          'Basic reporting',
          'Community support'
        ],
        description: 'Perfect for individual developers and hobbyists',
        stripePriceId: null,
        stripeProductId: null,
        isActive: true
      },
      {
        planId: 'pro',
        name: 'Pro',
        priceCents: 500, // $5/month
        billingPeriod: 'month',
        features: [
          'Unlimited Cloud Projects',
          'Team Collaboration',
          'Advanced MCP Features',
          'Priority Support',
          'Advanced Analytics'
        ],
        description: 'Unlimited cloud hosting, collaboration tooling, priority support',
        stripePriceId: null,
        stripeProductId: null,
        isActive: true
      },
      {
        planId: 'enterprise',
        name: 'Enterprise',
        priceCents: 9900, // $99/month
        billingPeriod: 'month',
        features: [
          'Everything in Pro',
          'Custom AI Agent Integrations',
          'Dedicated Account Manager',
          'SLA Guarantees'
        ],
        description: 'Advanced features, custom integrations, dedicated support',
        stripePriceId: null,
        stripeProductId: null,
        isActive: true
      }
    ];

    for (const plan of plans) {
      await prisma.subscriptionPlan.create({
        data: plan
      });
    }

    return {
      success: true,
      message: 'Successfully updated pricing plans',
      plans: plans.map(p => ({ 
        name: p.name, 
        price: `$${p.priceCents/100}/${p.billingPeriod}`, 
        active: p.isActive 
      }))
    };
  } catch (error) {
    console.error('Error updating pricing plans:', error);
    return {
      success: false,
      error: 'Failed to update pricing plans'
    };
  }
}