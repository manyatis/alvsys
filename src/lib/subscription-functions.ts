'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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
export async function createStripeSession(planId: string): Promise<CreateStripeSessionResult> {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Validate required fields
    if (!planId) {
      return {
        success: false,
        error: 'Missing required field: planId'
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        stripeCustomerId: true, 
        subscriptionId: true,
        subscriptionStatus: true
      }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check if user already has an active subscription
    if (user.subscriptionId && user.subscriptionStatus === 'active') {
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

    console.debug(`🔄 Creating Stripe subscription for ${user.email}: ${subscriptionPlan.name} plan`);

    // Create or get existing Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      console.debug('👤 Creating Stripe customer...');
      const customer = await getStripe().customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id.toString(),
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId }
      });
      
      console.debug('✅ Stripe customer created:', stripeCustomerId);
    }

    // For now, we'll use a test price ID. In production, you would create prices in Stripe dashboard
    // and store them in the subscriptionPlan.stripePriceId field
    let stripePriceId = subscriptionPlan.stripePriceId;
    
    if (!stripePriceId) {
      // Create a price on the fly for testing (you'd normally do this once in Stripe dashboard)
      console.debug('💰 Creating Stripe price...');
      
      // First, create or get the product
      const product = await getStripe().products.create({
        name: `VibeHero ${subscriptionPlan.name} Plan`,
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
      
      // Update subscription plan with Stripe IDs
      await prisma.subscriptionPlan.update({
        where: { id: subscriptionPlan.id },
        data: { 
          stripePriceId,
          stripeProductId: product.id
        }
      });
      
      console.debug('✅ Stripe price created:', stripePriceId);
    }

    // Create Stripe Checkout Session for subscription
    console.debug('📋 Creating Stripe Checkout Session...');
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{
        price: stripePriceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXTAUTH_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscribe/cancel`,
      metadata: {
        userId: user.id.toString(),
        planId: subscriptionPlan.planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id.toString(),
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
        planId: 'free',
        name: 'Individual',
        priceCents: 0,
        billingPeriod: 'forever',
        features: [
          'Unlimited projects',
          'Unlimited AI-powered cards',
          'Issue tracking',
          'Sprint management',
          'Basic reporting',
          'Community support'
        ],
        description: 'Perfect for individual developers and small personal projects',
        stripePriceId: null,
        stripeProductId: null,
        isActive: true
      },
      {
        planId: 'collaborative',
        name: 'Collaborative',
        priceCents: 4000, // $40/month
        billingPeriod: 'month',
        features: [
          'Everything in Individual',
          'Team collaboration tools',
          'Advanced sprint planning',
          'Custom workflows',
          'Priority support',
          'Advanced analytics'
        ],
        description: 'For small teams working together on projects',
        stripePriceId: null,
        stripeProductId: null,
        isActive: false // Disabled for now
      },
      {
        planId: 'enterprise',
        name: 'Enterprise',
        priceCents: 10000, // $100/month
        billingPeriod: 'month',
        features: [
          'Everything in Collaborative',
          'Enterprise security',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantees',
          'On-premise deployment options'
        ],
        description: 'For large organizations with advanced needs',
        stripePriceId: null,
        stripeProductId: null,
        isActive: false // Disabled for now
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