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
        '1 Cloud Project',
        'Unlimited Self-Hosted',
        'Full MCP Access',
        'GitHub Integration',
        'Community Support'
      ],
      description: 'Free self hosting or 1 project cloud hosting',
      isActive: true
    },
    {
      planId: 'pro',
      name: 'Pro',
      priceCents: 500, // $5
      billingPeriod: 'month',
      features: [
        'Unlimited Cloud Projects',
        'Team Collaboration',
        'Advanced MCP Features',
        'Priority Support',
        'Advanced Analytics'
      ],
      description: 'Unlimited cloud hosting, collaboration tooling, priority support',
      isActive: true
    },
    {
      planId: 'enterprise',
      name: 'Enterprise',
      priceCents: 9900, // $99
      billingPeriod: 'month',
      features: [
        'Everything in Pro',
        'Custom AI Agent Integrations',
        'Dedicated Account Manager',
        'SLA Guarantees',
        'Enterprise Security'
      ],
      description: 'Advanced features, custom integrations, dedicated support',
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