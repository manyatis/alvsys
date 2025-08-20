const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create subscription plans
  const plans = [
    {
      planId: 'free',
      name: 'Free',
      priceCents: 0,
      billingPeriod: 'month',
      features: [
        '1 Project',
        'Unlimited AI tasks',
        'Basic API access',
        'Community support'
      ],
      description: 'Perfect for getting started',
      isActive: true
    },
    {
      planId: 'indie',
      name: 'Indie',
      priceCents: 1000, // $10
      billingPeriod: 'month',
      features: [
        '3 Projects',
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
      priceCents: 9900, // $99
      billingPeriod: 'month',
      features: [
        'Unlimited projects',
        'Unlimited AI tasks',
        'Advanced analytics',
        'Priority support'
      ],
      description: 'For teams and agencies',
      isActive: true
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { planId: plan.planId },
      update: plan,
      create: plan
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });