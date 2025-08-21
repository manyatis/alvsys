const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create subscription plans
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
      isActive: true
    },
    {
      planId: 'pro',
      name: 'Pro',
      priceCents: 500, // $5
      billingPeriod: 'month',
      features: [
        'Self hosting available',
        'Hosted unlimited projects free',
        'Full collaboration tooling',
        'Advanced sprint planning',
        'Team management',
        'Priority support',
        'Advanced analytics'
      ],
      description: 'For professional developers and small teams',
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