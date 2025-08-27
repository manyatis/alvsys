import { NextRequest, NextResponse } from 'next/server';
import VectorSyncService from '@/services/vector-sync-service-prisma';

// TEMPORARY TESTING ENDPOINT - REMOVE IN PRODUCTION
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Test endpoint only available in development' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { projectId, action } = body;

    const vectorService = new VectorSyncService();

    if (action === 'sync-project' && projectId) {
      console.log(`🔄 Testing vector sync for project: ${projectId}`);
      
      const result = await vectorService.syncProjectCards(projectId);
      
      return NextResponse.json({
        success: true,
        message: `Vector sync test completed for project`,
        result,
      });
    }

    if (action === 'search' && projectId) {
      const { query, similarityThreshold, limit } = body;
      
      if (!query) {
        return NextResponse.json({ error: 'Query required for search' }, { status: 400 });
      }

      const searchResults = await vectorService.searchSimilarMemory(
        query,
        projectId,
        similarityThreshold || 0.7,
        limit || 10
      );
      
      return NextResponse.json({
        success: true,
        query,
        results: searchResults,
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use sync-project or search' 
    }, { status: 400 });

  } catch (error) {
    console.error('Vector sync test error:', error);
    
    return NextResponse.json({
      error: 'Vector sync test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Test endpoint only available in development' }, { status: 403 });
  }

  return NextResponse.json({
    message: 'Vector Sync Test API - Development Only',
    note: 'This bypasses authentication for testing purposes',
    actions: ['sync-project', 'search']
  });
}