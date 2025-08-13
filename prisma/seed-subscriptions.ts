import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding subscription plans...');

  // Delete existing plans
  await prisma.subscriptionPlan.deleteMany({});

  // Create subscription plans
  const plans = [
    {
      planId: 'free',
      name: 'Free',
      priceCents: 0,
      billingPeriod: 'month',
      features: [
        '1 Project',
        '20 AI tasks per day',
        'Basic API access',
        'Community support'
      ],
      description: 'Perfect for getting started',
      isActive: true
    },
    {
      planId: 'indie',
      name: 'Indie',
      priceCents: 1000, // $10.00
      billingPeriod: 'month',
      features: [
        '1 Project',
        'Unlimited AI tasks',
        'Priority API access',
        'Email support'
      ],
      description: 'For independent developers',
      isActive: true
    },
    {
      planId: 'professional',
      name: 'Professional',
      priceCents: 9900, // $99.00
      billingPeriod: 'month',
      features: [
        'Unlimited projects',
        'Unlimited AI tasks',
        'Advanced analytics',
        'Priority support'
      ],
      description: 'For teams and agencies',
      isActive: false // Coming soon
    }
  ];

  for (const plan of plans) {
    const created = await prisma.subscriptionPlan.create({
      data: plan
    });
    console.log(`✅ Created plan: ${created.name} ($${created.priceCents / 100})`);
  }

  console.log('🎉 Subscription plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding subscription plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });