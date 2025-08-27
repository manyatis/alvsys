import { prisma } from '@/lib/prisma';
import { Card, Comment, Project } from '@prisma/client';

// Types for vector database
export interface CardEmbedding {
  id?: string;
  card_id: string;
  project_id: string;
  title: string;
  description: string | null;
  acceptance_criteria: string | null;
  status: string;
  priority: number;
  is_ai_allowed: boolean;
  github_issue_id: number | null;
  embedding: number[];
  created_at?: Date;
  updated_at?: Date;
  synced_at?: Date;
}

export interface CommentEmbedding {
  id?: string;
  comment_id: string;
  card_id: string;
  project_id: string;
  content: string;
  author_type: 'human' | 'ai';
  is_ai_comment: boolean;
  github_comment_id: number | null;
  embedding: number[];
  created_at?: Date;
  updated_at?: Date;
  synced_at?: Date;
}

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
  private supabaseUrl: string;
  private supabaseKey: string;
  private openaiApiKey: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL!;
    this.supabaseKey = process.env.SUPABASE_ANON_KEY!;
    this.openaiApiKey = process.env.OPENAI_API_KEY!;
    
    if (!this.supabaseUrl || !this.supabaseKey || !this.openaiApiKey) {
      throw new Error('Missing required environment variables for vector sync');
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
   * Insert or update card embedding in vector database
   */
  private async upsertCardEmbedding(cardEmbedding: CardEmbedding): Promise<void> {
    const { data, error } = await fetch(`${this.supabaseUrl}/rest/v1/card_embeddings`, {
      method: 'POST',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        ...cardEmbedding,
        synced_at: new Date().toISOString(),
      }),
    }).then(res => res.json());

    if (error) {
      throw new Error(`Supabase error upserting card embedding: ${error.message}`);
    }
  }

  /**
   * Insert or update comment embedding in vector database
   */
  private async upsertCommentEmbedding(commentEmbedding: CommentEmbedding): Promise<void> {
    const { data, error } = await fetch(`${this.supabaseUrl}/rest/v1/comment_embeddings`, {
      method: 'POST',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        ...commentEmbedding,
        synced_at: new Date().toISOString(),
      }),
    }).then(res => res.json());

    if (error) {
      throw new Error(`Supabase error upserting comment embedding: ${error.message}`);
    }
  }

  /**
   * Check if card needs re-embedding based on update time
   */
  private async needsCardEmbedding(cardId: string, updatedAt: Date): Promise<boolean> {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/card_embeddings?card_id=eq.${cardId}&select=synced_at`, {
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
      },
    });

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return true; // No embedding exists
    }

    const existingSync = new Date(data[0].synced_at);
    return updatedAt > existingSync; // Re-embed if card updated after last sync
  }

  /**
   * Check if comment needs re-embedding based on update time
   */
  private async needsCommentEmbedding(commentId: string, updatedAt: Date): Promise<boolean> {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/comment_embeddings?comment_id=eq.${commentId}&select=synced_at`, {
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
      },
    });

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return true; // No embedding exists
    }

    const existingSync = new Date(data[0].synced_at);
    return updatedAt > existingSync; // Re-embed if comment updated after last sync
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

            const cardEmbedding: CardEmbedding = {
              card_id: card.id,
              project_id: projectId,
              title: card.title,
              description: card.description,
              acceptance_criteria: card.acceptanceCriteria,
              status: card.status,
              priority: card.priority,
              is_ai_allowed: card.isAiAllowedTask,
              github_issue_id: card.githubIssueId,
              embedding,
            };

            await this.upsertCardEmbedding(cardEmbedding);
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

                const commentEmbeddingData: CommentEmbedding = {
                  comment_id: comment.id,
                  card_id: card.id,
                  project_id: projectId,
                  content: comment.content,
                  author_type: comment.isAiComment ? 'ai' : 'human',
                  is_ai_comment: comment.isAiComment,
                  github_comment_id: comment.githubCommentId,
                  embedding: commentEmbedding,
                };

                await this.upsertCommentEmbedding(commentEmbeddingData);
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
    const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/search_similar_memory`, {
      method: 'POST',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_embedding: queryEmbedding,
        project_filter: projectId,
        similarity_threshold: similarityThreshold,
        result_limit: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

export default VectorSyncService;