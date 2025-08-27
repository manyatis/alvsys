import { prisma } from '@/lib/prisma';
import { Card, Comment } from '@prisma/client';

// Types for vector database
export interface VectorSyncResult {
  success: boolean;
  error?: string;
  synced: {
    cardsEmbedded: number;
    commentsEmbedded: number;
    cardsUpdated: number;
    commentsUpdated: number;
    cardsSkipped: number;
    commentsSkipped: number;
  };
}

export class VectorSyncService {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY!;
    
    if (!this.openaiApiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
  }

  /**
   * Generate embedding using OpenAI's text-embedding-ada-002
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text.replace(/\n/g, ' ').trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Create searchable text from card data
   */
  private createCardSearchText(card: Card): string {
    const parts = [
      card.title,
      card.description || '',
      card.acceptanceCriteria || '',
      `Status: ${card.status}`,
      `Priority: ${card.priority}`,
    ].filter(Boolean);
    
    return parts.join(' | ');
  }

  /**
   * Create searchable text from comment data
   */
  private createCommentSearchText(comment: Comment): string {
    return comment.content;
  }

  /**
   * Check if card needs re-embedding based on update time
   */
  private async needsCardEmbedding(cardId: string, updatedAt: Date): Promise<boolean> {
    const existingEmbedding = await prisma.$queryRaw<Array<{synced_at: Date}>>`
      SELECT synced_at 
      FROM card_embeddings 
      WHERE card_id = ${cardId}
    `;
    
    if (!existingEmbedding || existingEmbedding.length === 0) {
      return true; // No embedding exists
    }

    const existingSync = new Date(existingEmbedding[0].synced_at);
    return updatedAt > existingSync; // Re-embed if card updated after last sync
  }

  /**
   * Check if comment needs re-embedding based on update time
   */
  private async needsCommentEmbedding(commentId: string, updatedAt: Date): Promise<boolean> {
    const existingEmbedding = await prisma.$queryRaw<Array<{synced_at: Date}>>`
      SELECT synced_at 
      FROM comment_embeddings 
      WHERE comment_id = ${commentId}
    `;
    
    if (!existingEmbedding || existingEmbedding.length === 0) {
      return true; // No embedding exists
    }

    const existingSync = new Date(existingEmbedding[0].synced_at);
    return updatedAt > existingSync; // Re-embed if comment updated after last sync
  }

  /**
   * Insert or update card embedding in vector database
   */
  private async upsertCardEmbedding(
    cardId: string,
    projectId: string,
    card: Card,
    embedding: number[]
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO card_embeddings (
        card_id, project_id, title, description, acceptance_criteria,
        status, priority, is_ai_allowed, github_issue_id, embedding, synced_at
      ) VALUES (
        ${cardId}, ${projectId}, ${card.title}, ${card.description}, ${card.acceptanceCriteria},
        ${card.status}, ${card.priority}, ${card.isAiAllowedTask}, ${card.githubIssueId}, 
        ${JSON.stringify(embedding)}::vector, NOW()
      )
      ON CONFLICT (card_id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        is_ai_allowed = EXCLUDED.is_ai_allowed,
        github_issue_id = EXCLUDED.github_issue_id,
        embedding = EXCLUDED.embedding,
        synced_at = NOW(),
        updated_at = NOW()
    `;
  }

  /**
   * Insert or update comment embedding in vector database
   */
  private async upsertCommentEmbedding(
    commentId: string,
    cardId: string,
    projectId: string,
    comment: Comment,
    embedding: number[]
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO comment_embeddings (
        comment_id, card_id, project_id, content, author_type, 
        is_ai_comment, github_comment_id, embedding, synced_at
      ) VALUES (
        ${commentId}, ${cardId}, ${projectId}, ${comment.content}, 
        ${comment.isAiComment ? 'ai' : 'human'}, ${comment.isAiComment}, 
        ${comment.githubCommentId}, ${JSON.stringify(embedding)}::vector, NOW()
      )
      ON CONFLICT (comment_id) DO UPDATE SET
        content = EXCLUDED.content,
        author_type = EXCLUDED.author_type,
        is_ai_comment = EXCLUDED.is_ai_comment,
        github_comment_id = EXCLUDED.github_comment_id,
        embedding = EXCLUDED.embedding,
        synced_at = NOW(),
        updated_at = NOW()
    `;
  }

  /**
   * Sync cards from a project to vector database
   */
  async syncProjectCards(projectId: string): Promise<VectorSyncResult> {
    const result: VectorSyncResult = {
      success: true,
      synced: {
        cardsEmbedded: 0,
        commentsEmbedded: 0,
        cardsUpdated: 0,
        commentsUpdated: 0,
        cardsSkipped: 0,
        commentsSkipped: 0,
      },
    };

    try {
      // Get all cards for this project with their comments
      const cards = await prisma.card.findMany({
        where: { projectId },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      console.log(`Found ${cards.length} cards to process for project ${projectId}`);

      for (const card of cards) {
        try {
          // Check if card needs embedding
          const needsEmbedding = await this.needsCardEmbedding(card.id, card.updatedAt);
          
          if (needsEmbedding) {
            // Generate embedding for card
            const searchText = this.createCardSearchText(card);
            const embedding = await this.generateEmbedding(searchText);

            await this.upsertCardEmbedding(card.id, projectId, card, embedding);
            result.synced.cardsEmbedded++;
            console.log(`✓ Embedded card: ${card.title}`);
          } else {
            result.synced.cardsSkipped++;
            console.log(`⏭️ Skipped card (up to date): ${card.title}`);
          }

          // Process comments for this card
          for (const comment of card.comments) {
            try {
              const needsCommentEmbedding = await this.needsCommentEmbedding(comment.id, comment.updatedAt);
              
              if (needsCommentEmbedding) {
                const commentSearchText = this.createCommentSearchText(comment);
                const commentEmbedding = await this.generateEmbedding(commentSearchText);

                await this.upsertCommentEmbedding(
                  comment.id,
                  card.id,
                  projectId,
                  comment,
                  commentEmbedding
                );

                result.synced.commentsEmbedded++;
                console.log(`✓ Embedded comment on: ${card.title}`);
              } else {
                result.synced.commentsSkipped++;
              }
            } catch (commentError) {
              console.error(`Error processing comment ${comment.id}:`, commentError);
              // Continue processing other comments
            }
          }
        } catch (cardError) {
          console.error(`Error processing card ${card.id}:`, cardError);
          // Continue processing other cards
        }
      }
    } catch (error) {
      console.error('Vector sync error:', error);
      result.success = false;
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Sync all projects to vector database
   */
  async syncAllProjects(): Promise<VectorSyncResult[]> {
    const projects = await prisma.project.findMany({
      select: { id: true, name: true },
    });

    const results: VectorSyncResult[] = [];
    
    for (const project of projects) {
      console.log(`\n🚀 Starting vector sync for project: ${project.name}`);
      const result = await this.syncProjectCards(project.id);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ Completed sync for ${project.name}: ${result.synced.cardsEmbedded} cards, ${result.synced.commentsEmbedded} comments`);
      } else {
        console.error(`❌ Failed sync for ${project.name}: ${result.error}`);
      }
    }

    return results;
  }

  /**
   * Search similar content in vector database
   */
  async searchSimilarMemory(
    query: string,
    projectId: string,
    similarityThreshold: number = 0.7,
    limit: number = 10
  ) {
    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query);

    // Search using the PostgreSQL function
    const results = await prisma.$queryRaw<Array<{
      content_type: string;
      source_id: string;
      content: string;
      additional_context: string | null;
      similarity: number;
      created_at: Date;
    }>>`
      SELECT 
        content_type,
        source_id,
        content,
        additional_context,
        similarity,
        created_at
      FROM search_similar_memory(
        ${JSON.stringify(queryEmbedding)}::vector,
        ${projectId},
        ${similarityThreshold},
        ${limit}
      )
    `;

    return results;
  }

  /**
   * Get vector database stats for a project
   */
  async getProjectStats(projectId: string) {
    const [cardStats, commentStats] = await Promise.all([
      prisma.$queryRaw<Array<{count: number}>>`
        SELECT COUNT(*)::int as count 
        FROM card_embeddings 
        WHERE project_id = ${projectId}
      `,
      prisma.$queryRaw<Array<{count: number}>>`
        SELECT COUNT(*)::int as count 
        FROM comment_embeddings 
        WHERE project_id = ${projectId}
      `,
    ]);

    return {
      cardsEmbedded: cardStats[0]?.count || 0,
      commentsEmbedded: commentStats[0]?.count || 0,
      totalEmbeddings: (cardStats[0]?.count || 0) + (commentStats[0]?.count || 0),
    };
  }
}

export default VectorSyncService;