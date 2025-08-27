import { NextRequest, NextResponse } from 'next/server';
import VectorSyncService from '@/services/vector-sync-service-prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // Basic auth check - you might want to implement API key auth for automated triggers
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, action } = body;

    const vectorService = new VectorSyncService();

    if (action === 'sync-project' && projectId) {
      // Sync specific project
      const result = await vectorService.syncProjectCards(projectId);
      
      return NextResponse.json({
        success: true,
        message: `Vector sync completed for project`,
        result,
      });
    } 
    
    if (action === 'sync-all') {
      // Sync all projects
      const results = await vectorService.syncAllProjects();
      
      const totalStats = results.reduce((acc, result) => ({
        cardsEmbedded: acc.cardsEmbedded + result.synced.cardsEmbedded,
        commentsEmbedded: acc.commentsEmbedded + result.synced.commentsEmbedded,
        cardsSkipped: acc.cardsSkipped + result.synced.cardsSkipped,
        commentsSkipped: acc.commentsSkipped + result.synced.commentsSkipped,
      }), { cardsEmbedded: 0, commentsEmbedded: 0, cardsSkipped: 0, commentsSkipped: 0 });
      
      return NextResponse.json({
        success: true,
        message: `Vector sync completed for all projects`,
        totalStats,
        results,
      });
    }

    if (action === 'search' && projectId) {
      // Test search functionality
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
      error: 'Invalid action. Use sync-project, sync-all, or search' 
    }, { status: 400 });

  } catch (error) {
    console.error('Vector sync API error:', error);
    
    return NextResponse.json({
      error: 'Vector sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check / status endpoint
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({
        message: 'MemoLab Vector Sync API',
        endpoints: {
          'POST /': 'Sync vectors',
          'POST / with action=sync-project': 'Sync specific project',
          'POST / with action=sync-all': 'Sync all projects', 
          'POST / with action=search': 'Search similar memory',
          'GET /?projectId=xxx': 'Get project stats',
        },
      });
    }

    // Get vector database stats for a project
    const vectorService = new VectorSyncService();
    const vectorStats = await vectorService.getProjectStats(projectId);

    return NextResponse.json({
      projectId,
      vectorStats,
    });

  } catch (error) {
    console.error('Vector stats error:', error);
    
    return NextResponse.json({
      error: 'Failed to get vector stats',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}