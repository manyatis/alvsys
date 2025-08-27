#!/usr/bin/env node

/**
 * Manual Vector Sync Trigger Test
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function testVectorSync() {
  console.log('🚀 Manual Vector Sync Test\n');

  try {
    // Get a project to test with
    const project = await prisma.project.findFirst();
    
    if (!project) {
      console.log('❌ No projects found');
      return;
    }

    console.log(`📋 Testing vector sync for project: "${project.name}" (${project.id})\n`);

    // Simulate what happens when GitHub sync completes
    // Instead of importing the TypeScript service, let's call the API directly
    console.log('🔄 Triggering vector sync via API...');

    const response = await fetch('http://localhost:3000/api/vector-sync-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real app, we'd need proper authentication
        // For testing, the API should be accessible
      },
      body: JSON.stringify({
        action: 'sync-project',
        projectId: project.id
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Vector sync completed successfully!');
      console.log('📊 Sync Results:');
      console.log(JSON.stringify(result.result.synced, null, 2));
    } else {
      console.log('❌ Vector sync failed:');
      console.log(JSON.stringify(result, null, 2));
    }

    // Test search functionality if sync was successful
    if (response.ok && result.success) {
      console.log('\n🔍 Testing search functionality...');
      
      const searchResponse = await fetch('http://localhost:3000/api/vector-sync-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search',
          projectId: project.id,
          query: 'user interface bug',
          similarityThreshold: 0.3,
          limit: 5
        })
      });

      const searchResult = await searchResponse.json();
      
      if (searchResponse.ok && searchResult.success) {
        console.log(`   Found ${searchResult.results.length} similar items:`);
        searchResult.results.forEach((item, idx) => {
          console.log(`   ${idx + 1}. [${item.content_type}] ${item.content.substring(0, 60)}... (${item.similarity.toFixed(3)})`);
        });
      } else {
        console.log('   Search test failed:', searchResult.error);
      }
    }

    // Get final stats
    console.log('\n📊 Getting vector stats...');
    const statsResponse = await fetch(`http://localhost:3000/api/vector-sync?projectId=${project.id}`);
    const stats = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('   Vector Database Stats:', stats.vectorStats);
    } else {
      console.log('   Stats unavailable:', stats.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎉 Vector sync test completed!');
}

testVectorSync();