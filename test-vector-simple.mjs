#!/usr/bin/env node

/**
 * Simple Vector Sync Test using ES modules
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function testVectorSyncSimple() {
  console.log('🧪 Simple Vector Sync Test\n');

  try {
    // Test 1: Check connection and projects
    const projectCount = await prisma.project.count();
    console.log(`📊 Found ${projectCount} projects in database`);

    const project = await prisma.project.findFirst({
      include: {
        cards: {
          take: 3,
          include: {
            comments: { take: 2 }
          }
        }
      }
    });

    if (!project) {
      console.log('❌ No projects found');
      return;
    }

    console.log(`🚀 Testing with project: "${project.name}"`);
    console.log(`   Cards: ${project.cards.length}`);
    console.log(`   Comments: ${project.cards.reduce((sum, card) => sum + card.comments.length, 0)}\n`);

    // Test 2: Check environment
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasDB = !!process.env.DATABASE_URL;
    const vectorSyncEnabled = process.env.ENABLE_VECTOR_SYNC === 'true';

    console.log('🔧 Environment check:');
    console.log(`   OpenAI API Key: ${hasOpenAI ? '✅' : '❌'}`);
    console.log(`   Database URL: ${hasDB ? '✅' : '❌'}`);
    console.log(`   Vector Sync Enabled: ${vectorSyncEnabled ? '✅' : '❌'}\n`);

    if (!hasOpenAI || !hasDB) {
      console.log('❌ Missing required environment variables');
      return;
    }

    // Test 3: Check if vector tables exist
    console.log('🗄️ Checking vector tables...');
    
    const cardEmbeddingsCount = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count 
      FROM information_schema.tables 
      WHERE table_name = 'card_embeddings'
    `;
    
    const commentEmbeddingsCount = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count 
      FROM information_schema.tables 
      WHERE table_name = 'comment_embeddings'
    `;

    const tablesExist = cardEmbeddingsCount[0]?.count > 0 && commentEmbeddingsCount[0]?.count > 0;
    console.log(`   Vector tables exist: ${tablesExist ? '✅' : '❌'}`);

    if (!tablesExist) {
      console.log('❌ Vector tables not found. Run vector schema deployment first.');
      return;
    }

    // Test 4: Check existing embeddings
    const existingCardEmbeddings = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM card_embeddings WHERE project_id = ${project.id}
    `;
    
    const existingCommentEmbeddings = await prisma.$queryRaw`  
      SELECT COUNT(*)::int as count FROM comment_embeddings WHERE project_id = ${project.id}
    `;

    console.log(`   Existing card embeddings: ${existingCardEmbeddings[0]?.count || 0}`);
    console.log(`   Existing comment embeddings: ${existingCommentEmbeddings[0]?.count || 0}\n`);

    console.log('✅ All basic checks passed! Vector sync environment is ready.');
    console.log('\n📝 Next steps:');
    console.log('   1. Use the MCP tools to trigger vector sync');
    console.log('   2. Or call the API endpoint with proper authentication');
    console.log('   3. Monitor the logs for sync progress\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testVectorSyncSimple();