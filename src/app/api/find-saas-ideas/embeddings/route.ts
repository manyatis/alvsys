import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embedding for text
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // Limit text length
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

export async function POST() {
  try {
    console.log('Starting embedding generation process...');
    
    // Find complaints that don't have embeddings
    const complaintsWithoutEmbeddings = await prisma.$queryRaw`
      SELECT id, title, content
      FROM "UserComplaint"
      WHERE embedding IS NULL
      LIMIT 50
    ` as Array<{id: string, title: string | null, content: string}>;
    
    console.log(`Generating embeddings for ${complaintsWithoutEmbeddings.length} complaints...`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    // Generate embeddings
    for (const complaint of complaintsWithoutEmbeddings) {
      try {
        const text = `${complaint.title || ''} ${complaint.content}`.trim();
        const embedding = await generateEmbedding(text);
        
        if (embedding.length > 0) {
          // Convert to proper format for pgvector
          const vectorString = `[${embedding.join(',')}]`;
          
          // Update complaint with embedding using raw SQL for proper vector type
          await prisma.$executeRaw`
            UPDATE "UserComplaint" 
            SET embedding = ${vectorString}::vector 
            WHERE id = ${complaint.id}
          `;
          processedCount++;
        } else {
          errorCount++;
        }
        
        // Small delay to respect OpenAI rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing embedding for complaint ${complaint.id}:`, error);
        errorCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Generated embeddings for ${processedCount} complaints. ${errorCount} errors.`,
      processed: processedCount,
      errors: errorCount,
      totalFound: complaintsWithoutEmbeddings.length
    });
  } catch (error) {
    console.error('Error in embedding generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

// GET status of embedding progress
export async function GET() {
  try {
    const totalComplaints = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "UserComplaint"
    ` as Array<{count: bigint}>;
    
    const complaintsWithEmbeddings = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "UserComplaint" WHERE embedding IS NOT NULL
    ` as Array<{count: bigint}>;
    
    const total = Number(totalComplaints[0]?.count || 0);
    const withEmbeddings = Number(complaintsWithEmbeddings[0]?.count || 0);
    const remaining = total - withEmbeddings;
    
    return NextResponse.json({
      success: true,
      status: {
        total,
        withEmbeddings,
        remaining,
        progress: total > 0 ? Math.round((withEmbeddings / total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching embedding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch embedding status' },
      { status: 500 }
    );
  }
}