const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSubreddits() {
  const subreddits = [
    'mildlyinfuriating',
    'assholedesign',
    'crappydesign',
    'antiwork',
    'LateStageCapitalism',
    'CustomerService',
    'scams',
    'YouShouldKnow',
    'LifeProTips',
    'UnethicalLifeProTips',
    'personalfinance',
    'frugal',
    'BuyItForLife',
    'entrepreneur',
    'smallbusiness',
    'startups',
    'technology',
    'cars',
    'RealEstate',
    'landlord',
    'legaladvice',
    'foodservice',
    'Retconned',
    'walmart',
    'amazon',
    'Target',
    'Comcast',
    'verizon',
    'tmobile',
    'banking',
    'insurance',
    'TalesFromRetail',
    'TalesFromTheCustomer',
    'MaliciousCompliance',
    'ProRevenge',
    'petpeeves',
    'unpopularopinion',
    'rant',
    'offmychest',
    'Wellthatsucks'
  ];
  
  let added = 0;
  let skipped = 0;
  
  for (const subreddit of subreddits) {
    try {
      // Check if already exists
      const existing = await prisma.dataSource.findFirst({
        where: {
          config: {
            path: ['subreddit'],
            equals: subreddit
          }
        }
      });

      if (!existing) {
        await prisma.dataSource.create({
          data: {
            name: `Reddit - r/${subreddit}`,
            type: 'reddit',
            url: `https://reddit.com/r/${subreddit}`,
            config: { subreddit },
            isActive: true
          }
        });
        console.log(`✅ Added r/${subreddit}`);
        added++;
      } else {
        console.log(`⚠️ r/${subreddit} already exists`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error adding r/${subreddit}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Summary: Added ${added} new subreddits, skipped ${skipped} existing ones`);
  console.log(`📊 Total active data sources: ${await prisma.dataSource.count({ where: { isActive: true } })}`);
}

addSubreddits()
  .catch(console.error)
  .finally(() => prisma.$disconnect());