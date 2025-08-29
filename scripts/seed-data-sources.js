const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDataSources() {
  const subreddits = ['vibecoding', 'claudecode', 'codex', 'saas'];
  
  for (const subreddit of subreddits) {
    try {
      const existing = await prisma.dataSource.findFirst({
        where: {
          config: {
            path: ['subreddit'],
            equals: subreddit
          }
        }
      });

      if (!existing) {
        const dataSource = await prisma.dataSource.create({
          data: {
            name: `Reddit - r/${subreddit}`,
            type: 'reddit',
            url: `https://reddit.com/r/${subreddit}`,
            config: { subreddit },
            isActive: true
          }
        });
        console.log(`✅ Created data source: ${dataSource.name}`);
      } else {
        console.log(`⚠️ Data source already exists: Reddit - r/${subreddit}`);
      }
    } catch (error) {
      console.error(`❌ Error creating r/${subreddit}:`, error.message);
    }
  }
  
  console.log('🎉 Data source seeding completed!');
}

seedDataSources()
  .catch(console.error)
  .finally(() => prisma.$disconnect());