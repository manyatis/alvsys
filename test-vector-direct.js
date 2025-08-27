#!/usr/bin/env node

/**
 * Direct Vector Sync Test - No API, direct service call
 */

require('dotenv').config();

async function testVectorSyncDirect() {
  console.log('🧪 Testing Vector Sync Service Directly\n');

  try {
    // Import compiled service
    const { VectorSyncService } = require('./dist/services/vector-sync-service-prisma.js');
    const vectorService = new VectorSyncService();

    console.log('✅ VectorSyncService imported successfully');

    // Get first project from database
    const { prisma } = require('./dist/lib/prisma.js');
    const project = await prisma.project.findFirst({
      select: { id: true, name: true },
    });

    if (!project) {
      console.log('❌ No projects found in database');
      return;
    }

    console.log(`🚀 Testing sync for project: "${project.name}" (${project.id})\n`);

    // Sync the project
    const result = await vectorService.syncProjectCards(project.id);

    if (result.success) {
      console.log('✅ Vector sync completed successfully!');
      console.log(`   Cards embedded: ${result.synced.cardsEmbedded}`);
      console.log(`   Comments embedded: ${result.synced.commentsEmbedded}`);
      console.log(`   Cards skipped: ${result.synced.cardsSkipped}`);
      console.log(`   Comments skipped: ${result.synced.commentsSkipped}\n`);

      // Test search if we have embeddings
      if (result.synced.cardsEmbedded > 0) {
        console.log('🔍 Testing search functionality...');
        
        const searchResults = await vectorService.searchSimilarMemory(
          'user interface',
          project.id,
          0.3, // Low threshold for testing
          5
        );

        console.log(`   Found ${searchResults.length} similar items:`);
        searchResults.forEach((item, idx) => {
          console.log(`   ${idx + 1}. [${item.content_type}] ${item.content.substring(0, 50)}... (${item.similarity.toFixed(3)})`);
        });
      }

      // Get stats
      const stats = await vectorService.getProjectStats(project.id);
      console.log(`\n📊 Vector Database Stats:`);
      console.log(`   Cards embedded: ${stats.cardsEmbedded}`);
      console.log(`   Comments embedded: ${stats.commentsEmbedded}`);
      console.log(`   Total embeddings: ${stats.totalEmbeddings}`);

    } else {
      console.log(`❌ Vector sync failed: ${result.error}`);
    }

    await prisma.$disconnect();
    console.log('\n🎉 Vector sync test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testVectorSyncDirect();