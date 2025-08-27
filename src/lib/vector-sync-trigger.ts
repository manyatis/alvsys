import VectorSyncService from '@/services/vector-sync-service-prisma';

/**
 * Trigger vector sync after GitHub sync completes
 * This creates the decoupled flow: GitHub -> Main DB -> Vector DB
 */
export class VectorSyncTrigger {
  private static isVectorSyncEnabled(): boolean {
    return process.env.ENABLE_VECTOR_SYNC === 'true';
  }

  /**
   * Trigger vector sync for a specific project after GitHub sync
   */
  static async triggerProjectSync(projectId: string): Promise<void> {
    if (!this.isVectorSyncEnabled()) {
      console.log('Vector sync is disabled via environment variable');
      return;
    }

    try {
      console.log(`🔄 Triggering vector sync for project: ${projectId}`);
      
      const vectorService = new VectorSyncService();
      const result = await vectorService.syncProjectCards(projectId);
      
      if (result.success) {
        console.log(`✅ Vector sync completed for project ${projectId}:`, {
          cardsEmbedded: result.synced.cardsEmbedded,
          commentsEmbedded: result.synced.commentsEmbedded,
          cardsSkipped: result.synced.cardsSkipped,
          commentsSkipped: result.synced.commentsSkipped,
        });
      } else {
        console.error(`❌ Vector sync failed for project ${projectId}:`, result.error);
      }
    } catch (error) {
      console.error(`Vector sync trigger error for project ${projectId}:`, error);
      // Don't throw - we don't want to break GitHub sync if vector sync fails
    }
  }

  /**
   * Trigger vector sync in background (non-blocking)
   */
  static triggerProjectSyncInBackground(projectId: string): void {
    // Run in background - don't await
    setImmediate(async () => {
      await this.triggerProjectSync(projectId);
    });
  }

  /**
   * Schedule periodic full sync (for cron job or similar)
   */
  static async triggerFullSync(): Promise<void> {
    if (!this.isVectorSyncEnabled()) {
      console.log('Vector sync is disabled via environment variable');
      return;
    }

    try {
      console.log('🔄 Starting full vector sync for all projects');
      
      const vectorService = new VectorSyncService();
      const results = await vectorService.syncAllProjects();
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      const totalStats = results.reduce((acc, result) => ({
        cardsEmbedded: acc.cardsEmbedded + result.synced.cardsEmbedded,
        commentsEmbedded: acc.commentsEmbedded + result.synced.commentsEmbedded,
      }), { cardsEmbedded: 0, commentsEmbedded: 0 });
      
      console.log(`✅ Full vector sync completed:`, {
        projectsSuccessful: successful,
        projectsFailed: failed,
        totalCardsEmbedded: totalStats.cardsEmbedded,
        totalCommentsEmbedded: totalStats.commentsEmbedded,
      });
      
      if (failed > 0) {
        console.warn(`⚠️ ${failed} projects failed to sync to vector database`);
      }
    } catch (error) {
      console.error('Full vector sync error:', error);
    }
  }
}

export default VectorSyncTrigger;