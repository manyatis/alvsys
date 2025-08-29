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

interface ComplaintWithEmbedding {
  id: string;
  content: string;
  title: string | null;
  embedding: number[] | null;
}

interface ComplaintData {
  id: string;
  content: string;
  title: string | null;
  source: string;
  sourceUrl: string;
  embedding: number[] | null;
}

// Cluster complaints using pgvector similarity
async function clusterComplaints(): Promise<Map<string, ComplaintWithEmbedding[]>> {
  const clusters = new Map<string, ComplaintWithEmbedding[]>();
  const SIMILARITY_THRESHOLD = 0.75; // Cosine similarity threshold
  
  // Get all complaints with embeddings that don't have categories yet
  // Use raw SQL due to Prisma limitations with vector types
  const complaints = await prisma.$queryRaw<ComplaintData[]>`
    SELECT id, content, title, source, source_url as "sourceUrl", embedding
    FROM "UserComplaint"
    WHERE category_id IS NULL 
      AND embedding IS NOT NULL
    ORDER BY scraped_at DESC
    LIMIT 100
  `;

  console.log(`Clustering ${complaints.length} complaints with embeddings...`);

  for (const complaint of complaints) {
    // Find similar complaints already processed using pgvector cosine similarity
    const similarComplaints = await prisma.$queryRaw`
      SELECT id, 1 - (embedding <=> ${complaint.embedding}::vector) as similarity
      FROM "UserComplaint" 
      WHERE "categoryId" IS NOT NULL 
        AND embedding IS NOT NULL
        AND id != ${complaint.id}
        AND 1 - (embedding <=> ${complaint.embedding}::vector) > ${SIMILARITY_THRESHOLD}
      ORDER BY embedding <=> ${complaint.embedding}::vector
      LIMIT 1
    ` as Array<{id: string, similarity: number}>;

    if (similarComplaints.length > 0) {
      // Get the category of the most similar complaint
      const similarComplaint = await prisma.userComplaint.findUnique({
        where: { id: similarComplaints[0].id },
        select: { categoryId: true }
      });

      if (similarComplaint?.categoryId) {
        // Add to existing category
        await prisma.userComplaint.update({
          where: { id: complaint.id },
          data: { categoryId: similarComplaint.categoryId }
        });

        // Update category complaint count
        await prisma.complaintCategory.update({
          where: { id: similarComplaint.categoryId },
          data: {
            complaintCount: {
              increment: 1
            }
          }
        });

        // Add to clusters map for response
        const clusterId = similarComplaint.categoryId;
        if (!clusters.has(clusterId)) {
          clusters.set(clusterId, []);
        }
        clusters.get(clusterId)!.push(complaint);
        continue;
      }
    }

    // No similar complaint found - create new cluster
    const clusterId = `new_cluster_${clusters.size + 1}`;
    clusters.set(clusterId, [complaint]);
  }
  
  return clusters;
}

// Generate category name and description from complaints
async function generateCategoryInfo(complaints: ComplaintWithEmbedding[]): Promise<{ name: string; description: string }> {
  const sampleComplaints = complaints.slice(0, 5).map(c => ({
    title: c.title,
    content: c.content.slice(0, 200)
  }));
  
  const prompt = `Analyze these customer complaints and generate a category name and description.

Complaints:
${JSON.stringify(sampleComplaints, null, 2)}

Return a JSON object with:
- name: A short, descriptive category name (3-5 words)
- description: A brief description of the common theme (1-2 sentences)

Example format:
{"name": "Delivery Service Issues", "description": "Complaints about late deliveries, damaged packages, and poor courier service."}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    
    const result = response.choices[0]?.message?.content;
    if (result) {
      return JSON.parse(result);
    }
  } catch (error) {
    console.error('Error generating category info:', error);
  }
  
  return {
    name: "Uncategorized Complaints",
    description: "Various customer complaints and issues"
  };
}

export async function POST() {
  try {
    console.log('Starting categorization process...');
    
    // First, generate embeddings for complaints that don't have them
    const complaintsWithoutEmbeddings = await prisma.$queryRaw<{id: string, title: string | null, content: string}[]>`
      SELECT id, title, content
      FROM "UserComplaint"
      WHERE embedding IS NULL
      LIMIT 50
    `;
    
    console.log(`Generating embeddings for ${complaintsWithoutEmbeddings.length} complaints...`);
    
    // Generate embeddings
    for (const complaint of complaintsWithoutEmbeddings) {
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
      }
      
      // Small delay to respect OpenAI rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('Clustering complaints using vector similarity...');
    
    // Cluster complaints using pgvector
    const clusters = await clusterComplaints();
    
    // Create categories for new clusters
    const newCategories = [];
    for (const [clusterId, clusterComplaints] of clusters.entries()) {
      // Skip clusters that are existing categories (already processed)
      if (!clusterId.startsWith('new_cluster_')) continue;
      
      if (clusterComplaints.length < 2) continue; // Skip tiny clusters
      
      // Generate category info
      const categoryInfo = await generateCategoryInfo(clusterComplaints);
      
      // Calculate center embedding (average of all embeddings)
      const embeddings = clusterComplaints
        .map(c => c.embedding)
        .filter(e => e != null);
      
      if (embeddings.length === 0) continue;
      
      // Calculate centroid
      const centerEmbedding = new Array(1536).fill(0);
      for (const embedding of embeddings) {
        for (let i = 0; i < 1536; i++) {
          centerEmbedding[i] += embedding[i] / embeddings.length;
        }
      }
      
      // Create category with proper vector type
      const category = await prisma.$queryRaw`
        INSERT INTO "ComplaintCategory" (id, name, description, "complaintCount", "centerEmbedding", "createdAt", "updatedAt")
        VALUES (${`cmek_${Date.now()}_${Math.random().toString(36).slice(2)}`}, ${categoryInfo.name}, ${categoryInfo.description}, ${clusterComplaints.length}, ${`[${centerEmbedding.join(',')}]`}::vector, NOW(), NOW())
        RETURNING id, name, description, "complaintCount"
      ` as Array<{id: string, name: string, description: string, complaintCount: number}>;
      
      if (category.length > 0) {
        const newCategory = category[0];
        
        // Update complaints with new category
        await prisma.userComplaint.updateMany({
          where: {
            id: {
              in: clusterComplaints.map(c => c.id)
            }
          },
          data: {
            categoryId: newCategory.id
          }
        });
        
        newCategories.push(newCategory);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed embeddings for ${complaintsWithoutEmbeddings.length} complaints. Created ${newCategories.length} new categories.`,
      categories: newCategories
    });
  } catch (error) {
    console.error('Error in categorization:', error);
    return NextResponse.json(
      { error: 'Failed to categorize complaints' },
      { status: 500 }
    );
  }
}

// GET categories with complaint counts
export async function GET() {
  try {
    const categories = await prisma.complaintCategory.findMany({
      include: {
        _count: {
          select: { complaints: true }
        }
      },
      orderBy: {
        complaintCount: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        complaintCount: c._count.complaints,
        viabilityScore: c.viabilityScore,
        businessIdeas: c.businessIdeas
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}