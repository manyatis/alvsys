import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


interface ComplaintWithEmbedding {
  id: string;
  content: string;
  title: string | null;
  embedding: number[] | null;
}

// Cluster complaints using pgvector similarity
async function clusterComplaints(similarityThreshold: number = 0.65): Promise<Map<string, ComplaintWithEmbedding[]>> {
  const clusters = new Map<string, ComplaintWithEmbedding[]>();
  // Lower threshold = more lenient (more likely to create new categories)
  // Higher threshold = more strict (more likely to group into existing categories)
  // Range: 0.0 (everything is different) to 1.0 (only exact matches)
  const SIMILARITY_THRESHOLD = similarityThreshold;
  
  // Check existing categories first
  const existingCategories = await prisma.complaintCategory.count();
  console.log(`Found ${existingCategories} existing categories in database`);
  
  // Get all complaints with embeddings that don't have categories yet
  const complaints = await prisma.$queryRaw`
    SELECT id, title, content, embedding::text as embedding
    FROM "UserComplaint"
    WHERE "categoryId" IS NULL 
      AND embedding IS NOT NULL
    ORDER BY "scrapedAt" DESC
  ` as Array<{id: string, title: string | null, content: string, embedding: string}>;

  console.log(`Found ${complaints.length} uncategorized complaints with embeddings`);
  
  if (complaints.length === 0) {
    console.log('No uncategorized complaints found with embeddings');
    return clusters;
  }

  let processedCount = 0;
  let matchedToExisting = 0;
  let newClustersCreated = 0;

  for (const complaint of complaints) {
    processedCount++;
    // Parse the embedding string to array
    let embeddingArray;
    try {
      embeddingArray = JSON.parse(complaint.embedding.replace(/^\[/, '[').replace(/\]$/, ']'));
      console.log(`Complaint ${processedCount}: Embedding parsed, length: ${embeddingArray.length}, first 5 values: [${embeddingArray.slice(0, 5).join(', ')}...]`);
    } catch (parseError) {
      console.error(`Failed to parse embedding for complaint ${complaint.id}:`, parseError);
      console.log(`Raw embedding string (first 100 chars): ${complaint.embedding.substring(0, 100)}`);
      continue;
    }
    
    // First check if ANY complaints have categories at all
    const categorizedCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "UserComplaint" 
      WHERE "categoryId" IS NOT NULL AND embedding IS NOT NULL
    ` as Array<{count: bigint}>;
    
    if (processedCount === 1) {
      console.log(`Total complaints with categories and embeddings: ${categorizedCount[0].count}`);
    }
    
    // Find similar complaints already processed using pgvector cosine similarity
    // First, let's check the top similar complaint regardless of threshold to see scores
    const topSimilar = await prisma.$queryRaw`
      SELECT id, 1 - (embedding <=> ${`[${embeddingArray.join(',')}]`}::vector) as similarity
      FROM "UserComplaint" 
      WHERE "categoryId" IS NOT NULL 
        AND embedding IS NOT NULL
        AND id != ${complaint.id}
      ORDER BY embedding <=> ${`[${embeddingArray.join(',')}]`}::vector
      LIMIT 1
    ` as Array<{id: string, similarity: number}>;
    
    if (topSimilar.length > 0) {
      console.log(`  Top similarity score: ${topSimilar[0].similarity.toFixed(3)} (threshold: ${SIMILARITY_THRESHOLD})`);
    }
    
    // Now get matches above threshold
    const similarComplaints = await prisma.$queryRaw`
      SELECT id, 1 - (embedding <=> ${`[${embeddingArray.join(',')}]`}::vector) as similarity
      FROM "UserComplaint" 
      WHERE "categoryId" IS NOT NULL 
        AND embedding IS NOT NULL
        AND id != ${complaint.id}
        AND 1 - (embedding <=> ${`[${embeddingArray.join(',')}]`}::vector) > ${SIMILARITY_THRESHOLD}
      ORDER BY embedding <=> ${`[${embeddingArray.join(',')}]`}::vector
      LIMIT 1
    ` as Array<{id: string, similarity: number}>;

    console.log(`Complaint ${processedCount}/${complaints.length}: Found ${similarComplaints.length} similar above threshold`);

    if (similarComplaints.length > 0) {
      matchedToExisting++;
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
        clusters.get(clusterId)!.push({
          id: complaint.id,
          title: complaint.title,
          content: complaint.content,
          embedding: embeddingArray
        });
        continue;
      }
    }

    // No similar complaint found - create new cluster
    newClustersCreated++;
    const clusterId = `new_cluster_${clusters.size + 1}`;
    clusters.set(clusterId, [{
      id: complaint.id,
      title: complaint.title,
      content: complaint.content,
      embedding: embeddingArray
    }]);
  }
  
  console.log(`Clustering summary: ${processedCount} processed, ${matchedToExisting} matched to existing categories, ${newClustersCreated} new clusters created`);
  console.log(`Total clusters in map: ${clusters.size}`);
  
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

export async function POST(request: Request) {
  try {
    // Allow similarity threshold to be configured via request body
    const body = await request.json().catch(() => ({}));
    const similarityThreshold = body.similarityThreshold || 0.65;
    
    console.log(`Starting categorization process with similarity threshold: ${similarityThreshold}...`);
    
    // First, let's check how many complaints we have in total
    const totalComplaints = await prisma.userComplaint.count();
    
    const complaintsWithEmbeddingsResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "UserComplaint" WHERE embedding IS NOT NULL
    ` as Array<{count: bigint}>;
    const complaintsWithEmbeddings = Number(complaintsWithEmbeddingsResult[0].count);
    
    const categorizedComplaints = await prisma.userComplaint.count({
      where: { categoryId: { not: null } }
    });
    
    const uncategorizedWithEmbeddingsResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "UserComplaint" WHERE "categoryId" IS NULL AND embedding IS NOT NULL
    ` as Array<{count: bigint}>;
    const uncategorizedWithEmbeddings = Number(uncategorizedWithEmbeddingsResult[0].count);
    
    console.log(`Database status: ${totalComplaints} total complaints, ${complaintsWithEmbeddings} with embeddings, ${categorizedComplaints} categorized, ${uncategorizedWithEmbeddings} uncategorized with embeddings`);
    
    console.log('Clustering complaints using vector similarity...');
    
    // Cluster complaints using pgvector
    const clusters = await clusterComplaints(similarityThreshold);
    
    console.log(`Received ${clusters.size} clusters from clusterComplaints`);
    
    // Create categories for new clusters
    const newCategories = [];
    let skippedExisting = 0;
    let skippedSmall = 0;
    
    for (const [clusterId, clusterComplaints] of clusters.entries()) {
      // Skip clusters that are existing categories (already processed)
      if (!clusterId.startsWith('new_cluster_')) {
        skippedExisting++;
        console.log(`Skipping existing category cluster: ${clusterId}`);
        continue;
      }
      
      // Require at least 3 complaints to form a category to ensure significance
      if (clusterComplaints.length < 3) {
        skippedSmall++;
        console.log(`Skipping small cluster ${clusterId} with only ${clusterComplaints.length} complaint(s) (need at least 3)`);
        continue; // Skip clusters with fewer than 3 complaints
      }
      
      console.log(`Processing new cluster ${clusterId} with ${clusterComplaints.length} complaints`);
      
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
    
    console.log(`Summary: ${skippedExisting} existing categories skipped, ${skippedSmall} small clusters skipped, ${newCategories.length} new categories created`);
    
    return NextResponse.json({
      success: true,
      message: `Created ${newCategories.length} new categories.`,
      categories: newCategories,
      debug: {
        totalClusters: clusters.size,
        skippedExisting,
        skippedSmall,
        newCategoriesCreated: newCategories.length
      }
    });
  } catch (error) {
    console.error('Error in categorization:', error);
    return NextResponse.json(
      { error: 'Failed to categorize complaints' },
      { status: 500 }
    );
  }
}

// GET categories with complaint counts or specific category with complaints
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const includeComplaints = searchParams.get('includeComplaints');

    if (categoryId) {
      // Get specific category with its complaints
      const category = await prisma.complaintCategory.findUnique({
        where: { id: categoryId },
        include: {
          complaints: {
            select: {
              id: true,
              title: true,
              content: true,
              source: true,
              sourceUrl: true,
              author: true,
              subreddit: true,
              createdAt: true,
              scrapedAt: true
            },
            orderBy: {
              scrapedAt: 'desc'
            }
          }
        }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        category: {
          id: category.id,
          name: category.name,
          description: category.description,
          complaintCount: category.complaintCount,
          viabilityScore: category.viabilityScore,
          businessIdeas: category.businessIdeas,
          complaints: category.complaints
        }
      });
    }

    // Get all categories
    const categories = await prisma.complaintCategory.findMany({
      include: {
        _count: {
          select: { complaints: true }
        },
        ...(includeComplaints === 'true' && {
          complaints: {
            select: {
              id: true,
              title: true,
              content: true,
              source: true,
              sourceUrl: true,
              author: true,
              subreddit: true,
              createdAt: true,
              scrapedAt: true
            },
            orderBy: {
              scrapedAt: 'desc'
            }
          }
        })
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
        businessIdeas: c.businessIdeas,
        ...(includeComplaints === 'true' && { complaints: c.complaints })
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