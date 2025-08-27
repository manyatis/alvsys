#!/usr/bin/env node

/**
 * Apply vector schema after Prisma migrations
 * Run this after `npx prisma migrate reset` or `npx prisma migrate deploy`
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function applyVectorSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Applying vector schema...');
    
    const schemaPath = path.join(__dirname, '../prisma/vector-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement separately
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
    
    console.log('✅ Vector schema applied successfully');
    
  } catch (error) {
    console.error('❌ Error applying vector schema:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyVectorSchema();