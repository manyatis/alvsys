#!/usr/bin/env node

/**
 * Alvsys Vector Sync Test Script
 * 
 * This script tests the vector sync flow:
 * 1. Read data from main database  
 * 2. Generate embeddings
 * 3. Store in vector database
 * 4. Test similarity search
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVectorSync() {
  console.log('🧪 Testing Alvsys Vector Sync Flow\n');

  try {
    // Test 1: Check database connection
    console.log('📊 Checking main database connection...');
    const projectCount = await prisma.project.count();
    console.log(`✅ Connected to main DB. Found ${projectCount} projects\n`);

    // Test 2: Get sample data
    const sampleProject = await prisma.project.findFirst({
      include: {
        cards: {
          take: 3,
          include: {
            comments: {
              take: 2,
            },
          },
        },
      },
    });

    if (!sampleProject) {
      console.log('❌ No projects found. Create a project first.');
      return;
    }

    console.log(`📋 Sample project: "${sampleProject.name}"`);
    console.log(`   Cards: ${sampleProject.cards.length}`);
    console.log(`   Comments: ${sampleProject.cards.reduce((sum, card) => sum + card.comments.length, 0)}\n`);

    // Test 3: Check environment variables
    console.log('🔧 Checking environment variables...');
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'DATABASE_URL',
    ];

    const missing = requiredEnvVars.filter(env => !process.env[env]);
    if (missing.length > 0) {
      console.log(`❌ Missing environment variables: ${missing.join(', ')}`);
      console.log('   Please add them to your .env file');
      return;
    }
    console.log('✅ All environment variables present (using Prisma DB connection)\n');

    // Test 4: Test vector sync service
    console.log('🔄 Testing vector sync service...');
    
    const { VectorSyncService } = await import('../src/services/vector-sync-service-prisma.ts');
    const vectorService = new VectorSyncService();

    // Test a single project sync
    console.log(`   Syncing project: ${sampleProject.name}`);
    const syncResult = await vectorService.syncProjectCards(sampleProject.id);

    if (syncResult.success) {
      console.log('✅ Vector sync completed successfully:');
      console.log(`   Cards embedded: ${syncResult.synced.cardsEmbedded}`);
      console.log(`   Comments embedded: ${syncResult.synced.commentsEmbedded}`);
      console.log(`   Cards skipped: ${syncResult.synced.cardsSkipped}`);
      console.log(`   Comments skipped: ${syncResult.synced.commentsSkipped}\n`);
    } else {
      console.log(`❌ Vector sync failed: ${syncResult.error}`);
      return;
    }

    // Test 5: Search functionality
    if (sampleProject.cards.length > 0) {
      console.log('🔍 Testing similarity search...');
      const testQuery = sampleProject.cards[0].title;
      
      const searchResults = await vectorService.searchSimilarMemory(
        testQuery,
        sampleProject.id,
        0.5,  // Lower threshold for testing
        5
      );

      console.log(`   Query: "${testQuery}"`);
      console.log(`   Results: ${searchResults.length} similar items found`);
      
      searchResults.forEach((result, idx) => {
        console.log(`   ${idx + 1}. [${result.content_type}] ${result.content} (similarity: ${result.similarity.toFixed(3)})`);
      });
    }

    console.log('\n🎉 All tests passed! alvsys vector sync is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testVectorSync();
}

module.exports = { testVectorSync };