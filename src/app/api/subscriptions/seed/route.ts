import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
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

    return NextResponse.json({
      success: true,
      message: 'Successfully updated pricing plans',
      plans: plans.map(p => ({ name: p.name, price: `$${p.priceCents/100}/${p.billingPeriod}`, active: p.isActive }))
    });
    
  } catch (error) {
    console.error('Error updating pricing plans:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing plans' },
      { status: 500 }
    );
  }
}