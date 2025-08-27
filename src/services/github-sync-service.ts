import { PrismaClient, Card, Project, Status, GitHubIssueSync } from '@prisma/client';
import { GitHubService, GitHubIssue, STATUS_MAPPING, GITHUB_STATUS_MAPPING, getMemoLabStatusFromGitHub, parseRepositoryName, GitHubRateLimitError } from '@/lib/github';
import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient();

export interface SyncOptions {
  syncComments: boolean;
  syncLabels: boolean;
  initialSync?: boolean; // If true, only sync FROM GitHub TO MemoLab
}

export interface SyncResult {
  success: boolean;
  error?: string;
  synced: {
    cardsCreated: number;
    cardsUpdated: number;
    issuesCreated: number;
    issuesUpdated: number;
    commentsCreated: number;
    commentsUpdated: number;
  };
  conflicts: Array<{
    cardId?: string;
    issueNumber?: number;
    description: string;
  }>;
}

export class GitHubSyncService {
  private githubService: GitHubService;
  private project: Project;

  constructor(githubService: GitHubService, project: Project) {
    this.githubService = githubService;
    this.project = project;
  }

  /**
   * Create a new sync service instance for a project
   */
  static async createForProject(projectId: string): Promise<GitHubSyncService | null> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        githubIssueSync: true,
      },
    });

    if (!project || !project.githubInstallationId || !project.githubRepoName) {
      return null;
    }

    const githubService = await GitHubService.createForInstallation(project.githubInstallationId);
    return new GitHubSyncService(githubService, project);
  }

  /**
   * Sync all issues/cards between GitHub and MemoLab
   */
  async syncProject(options: SyncOptions): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: {
        cardsCreated: 0,
        cardsUpdated: 0,
        issuesCreated: 0,
        issuesUpdated: 0,
        commentsCreated: 0,
        commentsUpdated: 0,
      },
      conflicts: [],
    };

    try {
      if (!this.project.githubRepoName) {
        throw new Error('Project not linked to GitHub repository');
      }

      const repoData = parseRepositoryName(this.project.githubRepoName);
      if (!repoData) {
        throw new Error('Invalid repository name format');
      }

      const { owner, repo } = repoData;

      // Get all existing sync records for this project
      const existingSyncs = await prisma.gitHubIssueSync.findMany({
        where: { projectId: this.project.id },
        include: { card: true },
      });

      // Create a map for quick lookup
      const syncByCardId = new Map(existingSyncs.map(sync => [sync.cardId, sync]));
      const syncByIssueId = new Map(existingSyncs.map(sync => [sync.githubIssueId, sync]));

      // Sync from GitHub to MemoLab
      await this.syncFromGitHub(owner, repo, syncByIssueId, result, options);
      
      // Only sync back to GitHub if not an initial sync
      if (!options.initialSync) {
        await this.syncToGitHub(owner, repo, syncByCardId, result, options);
      }

      // Update project last sync time
      await prisma.project.update({
        where: { id: this.project.id },
        data: { githubLastSyncAt: new Date() },
      });

      // Trigger vector sync after successful GitHub sync (decoupled)
      const { VectorSyncTrigger } = await import('@/lib/vector-sync-trigger');
      VectorSyncTrigger.triggerProjectSyncInBackground(this.project.id);

    } catch (error) {
      result.success = false;
      if (error instanceof GitHubRateLimitError) {
        result.error = `GitHub API rate limit exceeded. Try again after ${error.resetTime.toLocaleString()}`;
      } else {
        result.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return result;
  }

  /**
   * Sync specific card to GitHub
   */
  async syncCardToGitHub(cardId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.project.githubRepoName) {
        throw new Error('Project not linked to GitHub repository');
      }

      const repoData = parseRepositoryName(this.project.githubRepoName);
      if (!repoData) {
        throw new Error('Invalid repository name format');
      }

      const { owner, repo } = repoData;

      const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
          githubSync: true,
          comments: true,
          labels: {
            include: { label: true }
          },
          assignee: true,
        },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      let githubIssue: GitHubIssue;
      
      // Prepare assignees
      const assignees = [];
      if (card.assignee?.username) {
        assignees.push(card.assignee.username);
      }

      if (card.githubSync) {
        // Update existing issue
        const updateData: {
          title: string;
          body: string;
          state: 'open' | 'closed';
          state_reason?: 'completed' | 'not_planned';
          labels: string[];
          assignees: string[];
        } = {
          title: card.title,
          body: card.description || '',
          state: STATUS_MAPPING[card.status],
          labels: card.labels.map(l => l.label.name),
          assignees,
        };
        
        // Set state_reason for closed issues
        if (updateData.state === 'closed') {
          updateData.state_reason = card.status === 'CANCELLED' ? 'not_planned' : 'completed';
        }
        console.log('Updating GitHub issue with data:', {
          ...updateData,
          cardId: card.id,
          githubIssueId: card.githubSync.githubIssueId
        });
        githubIssue = await this.githubService.updateIssue(owner, repo, card.githubSync.githubIssueId, updateData);
        console.log('GitHub API response:', {
          id: githubIssue.id,
          number: githubIssue.number,
          title: githubIssue.title,
          body: githubIssue.body?.substring(0, 100) + '...',
          state: githubIssue.state,
          updated_at: githubIssue.updated_at
        });
      } else {
        // Create new issue
        githubIssue = await this.githubService.createIssue(owner, repo, {
          title: card.title,
          body: card.description || '',
          labels: card.labels.map(l => l.label.name),
          assignees,
        });

        // Create sync record
        await prisma.gitHubIssueSync.upsert({
          where: {
            cardId: card.id,
          },
          update: {
            githubIssueId: githubIssue.number,
            githubIssueNodeId: githubIssue.node_id,
            lastSyncAt: new Date(),
          },
          create: {
            cardId: card.id,
            projectId: this.project.id,
            githubIssueId: githubIssue.number,
            githubIssueNodeId: githubIssue.node_id,
            githubRepoName: this.project.githubRepoName,
            lastSyncAt: new Date(),
          },
        });
      }

      // Update card with GitHub info
      await prisma.card.update({
        where: { id: cardId },
        data: {
          githubIssueId: githubIssue.number,
          githubIssueUrl: githubIssue.html_url,
          githubSyncEnabled: true,
          githubLastSyncAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync specific GitHub issue to MemoLab
   */
  async syncIssueToMemoLab(issueNumber: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.project.githubRepoName) {
        throw new Error('Project not linked to GitHub repository');
      }

      const repoData = parseRepositoryName(this.project.githubRepoName);
      if (!repoData) {
        throw new Error('Invalid repository name format');
      }

      const { owner, repo } = repoData;

      const githubIssue = await this.githubService.getIssue(owner, repo, issueNumber);

      // Check if sync record exists
      const existingSync = await prisma.gitHubIssueSync.findFirst({
        where: {
          projectId: this.project.id,
          githubIssueId: issueNumber,
        },
        include: { card: true },
      });

      let card: Card;
      
      // Try to find assignee
      let assigneeId = null;
      if (githubIssue.assignees && githubIssue.assignees.length > 0) {
        const firstAssignee = githubIssue.assignees[0];
        const assigneeUser = await this.findUserByGitHub(firstAssignee.login, firstAssignee.id);
        if (assigneeUser) {
          assigneeId = assigneeUser.id;
        }
      }

      if (existingSync) {
        // Update existing card - preserve existing status unless GitHub issue is closed
        const updateData: {
          title: string;
          description: string;
          assigneeId: string | null;
          githubIssueId: number;
          githubIssueUrl: string;
          githubLastSyncAt: Date;
          status?: Status;
        } = {
          title: githubIssue.title,
          description: githubIssue.body || '',
          assigneeId,
          githubIssueId: githubIssue.number,
          githubIssueUrl: githubIssue.html_url,
          githubLastSyncAt: new Date(),
        };
        
        // Only update status if GitHub issue is closed (to mark as completed or cancelled)
        if (githubIssue.state === 'closed') {
          updateData.status = getMemoLabStatusFromGitHub(githubIssue.state as 'open' | 'closed', githubIssue.state_reason) as Status;
        }
        
        card = await prisma.card.update({
          where: { id: existingSync.cardId },
          data: updateData,
        });
      } else {
        // Create new card
        card = await prisma.card.create({
          data: {
            title: githubIssue.title,
            description: githubIssue.body || '',
            status: getMemoLabStatusFromGitHub(githubIssue.state as 'open' | 'closed', githubIssue.state_reason) as Status,
            projectId: this.project.id,
            assigneeId,
            githubIssueId: githubIssue.number,
            githubIssueUrl: githubIssue.html_url,
            githubSyncEnabled: true,
            githubLastSyncAt: new Date(),
          },
        });

        // Create sync record
        await prisma.gitHubIssueSync.upsert({
          where: {
            cardId: card.id,
          },
          update: {
            githubIssueId: githubIssue.number,
            githubIssueNodeId: githubIssue.node_id,
            lastSyncAt: new Date(),
          },
          create: {
            cardId: card.id,
            projectId: this.project.id,
            githubIssueId: githubIssue.number,
            githubIssueNodeId: githubIssue.node_id,
            githubRepoName: this.project.githubRepoName,
            lastSyncAt: new Date(),
          },
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync from GitHub to MemoLab
   */
  private async syncFromGitHub(
    owner: string,
    repo: string,
    syncByIssueId: Map<number, GitHubIssueSync & { card: Card }>,
    result: SyncResult,
    options: SyncOptions
  ) {
    console.log('Syncing from GitHub...', { owner, repo, lastSyncAt: this.project.githubLastSyncAt });
    
    // For initial sync, only get open issues. For regular syncs, get all issues since last sync
    const issueOptions: { state: 'open' | 'closed' | 'all'; since?: string } = { 
      state: options.initialSync ? 'open' : 'all' 
    };
    if (this.project.githubLastSyncAt && !options.initialSync) {
      issueOptions.since = this.project.githubLastSyncAt.toISOString();
    }
    
    const githubIssues = await this.githubService.getIssues(owner, repo, issueOptions);

    console.log(`Found ${githubIssues.length} GitHub issues to process`);

    // Process the issues we found
    const issuesToProcess = githubIssues;

    for (const githubIssue of issuesToProcess) {
      try {
        const existingSync = syncByIssueId.get(githubIssue.number);
        let cardId: string;

        if (existingSync) {
          // Update existing card - last writer wins
          cardId = existingSync.cardId;
          
          // Try to find assignee
          let assigneeId = null;
          if ((githubIssue as GitHubIssue).assignees && (githubIssue as GitHubIssue).assignees.length > 0) {
            const firstAssignee = (githubIssue as GitHubIssue).assignees[0];
            const assigneeUser = await this.findUserByGitHub(firstAssignee.login, firstAssignee.id);
            if (assigneeUser) {
              assigneeId = assigneeUser.id;
            }
          }

          // Update existing card - preserve existing status unless GitHub issue is closed
          const updateData: {
            title: string;
            description: string;
            assigneeId: string | null;
            githubLastSyncAt: Date;
            status?: Status;
          } = {
            title: githubIssue.title,
            description: githubIssue.body || '',
            assigneeId,
            githubLastSyncAt: new Date(),
          };
          
          // Only update status if GitHub issue is closed (to mark as completed or cancelled)
          if (githubIssue.state === 'closed') {
            updateData.status = getMemoLabStatusFromGitHub(githubIssue.state as 'open' | 'closed', githubIssue.state_reason) as Status;
          }
          
          await prisma.card.update({
            where: { id: existingSync.cardId },
            data: updateData,
          });

          await prisma.gitHubIssueSync.update({
            where: { id: existingSync.id },
            data: {
              lastSyncAt: new Date(),
            },
          });

          result.synced.cardsUpdated++;
        } else {
          // Create new card
          console.log(`Creating card for GitHub issue #${githubIssue.number}: ${githubIssue.title} (${githubIssue.state})`);
          
          // Try to find assignee
          let assigneeId = null;
          if ((githubIssue as GitHubIssue).assignees && (githubIssue as GitHubIssue).assignees.length > 0) {
            const firstAssignee = (githubIssue as GitHubIssue).assignees[0];
            const assigneeUser = await this.findUserByGitHub(firstAssignee.login, firstAssignee.id);
            if (assigneeUser) {
              assigneeId = assigneeUser.id;
            }
          }

          const card = await prisma.card.create({
            data: {
              title: githubIssue.title,
              description: githubIssue.body || '',
              status: getMemoLabStatusFromGitHub(githubIssue.state as 'open' | 'closed', githubIssue.state_reason) as Status,
              projectId: this.project.id,
              assigneeId,
              githubIssueId: githubIssue.number,
              githubIssueUrl: githubIssue.html_url,
              githubSyncEnabled: true,
              githubLastSyncAt: new Date(),
            },
          });

          cardId = card.id;

          await prisma.gitHubIssueSync.upsert({
            where: {
              cardId: card.id,
            },
            update: {
              githubIssueId: githubIssue.number,
              githubIssueNodeId: githubIssue.node_id,
              lastSyncAt: new Date(),
            },
            create: {
              cardId: card.id,
              projectId: this.project.id,
              githubIssueId: githubIssue.number,
              githubIssueNodeId: githubIssue.node_id,
              githubRepoName: this.project.githubRepoName!,
              lastSyncAt: new Date(),
            },
          });

          result.synced.cardsCreated++;
        }

        // Sync comments if enabled - now works for both existing and newly created cards
        if (options.syncComments) {
          await this.syncCommentsFromGitHub(owner, repo, githubIssue.number, cardId);
        }
      } catch (error) {
        result.conflicts.push({
          issueNumber: githubIssue.number,
          description: `Failed to sync issue: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }
  }

  /**
   * Sync from MemoLab to GitHub
   */
  private async syncToGitHub(
    owner: string,
    repo: string,
    syncByCardId: Map<string, GitHubIssueSync & { card: Card }>,
    result: SyncResult,
    _options: SyncOptions
  ) {
    const cards = await prisma.card.findMany({
      where: {
        projectId: this.project.id,
        ...(this.project.githubLastSyncAt && {
          updatedAt: { gte: this.project.githubLastSyncAt }
        })
      },
      include: {
        labels: { include: { label: true } },
        githubSync: true,
      },
    });

    for (const card of cards) {
      try {
        const existingSync = syncByCardId.get(card.id);

        if (existingSync) {
          // Update existing issue
          const assignees = [];
          if (card.assigneeId) {
            const assignee = await prisma.user.findUnique({
              where: { id: card.assigneeId },
              include: { accounts: true },
            });
            
            // Try to find GitHub username
            if (assignee?.username) {
              assignees.push(assignee.username);
            } else if (assignee) {
              // Check if they have a GitHub account linked
              const githubAccount = assignee.accounts.find(a => a.provider === 'github');
              if (githubAccount) {
                // We'd need to fetch the username from GitHub API, skip for now
                console.log('User has GitHub account but no username stored');
              }
            }
          }

          const updateData: {
            title: string;
            body: string;
            state: 'open' | 'closed';
            state_reason?: 'completed' | 'not_planned';
            labels: string[];
            assignees: string[];
          } = {
            title: card.title,
            body: card.description || '',
            state: STATUS_MAPPING[card.status],
            labels: card.labels.map(l => l.label.name),
            assignees,
          };
          
          // Set state_reason for closed issues
          if (updateData.state === 'closed') {
            updateData.state_reason = card.status === 'CANCELLED' ? 'not_planned' : 'completed';
          }
          
          const githubIssue = await this.githubService.updateIssue(owner, repo, existingSync.githubIssueId, updateData);

          await prisma.gitHubIssueSync.update({
            where: { id: existingSync.id },
            data: {
              lastSyncAt: new Date(),
            },
          });

          result.synced.issuesUpdated++;
        } else if (card.githubSyncEnabled) {
          // Create new issue
          const assignees = [];
          if (card.assigneeId) {
            const assignee = await prisma.user.findUnique({
              where: { id: card.assigneeId },
              include: { accounts: true },
            });
            
            // Try to find GitHub username
            if (assignee?.username) {
              assignees.push(assignee.username);
            }
          }

          const githubIssue = await this.githubService.createIssue(owner, repo, {
            title: card.title,
            body: card.description || '',
            labels: card.labels.map(l => l.label.name),
            assignees,
          });

          await prisma.gitHubIssueSync.upsert({
            where: {
              cardId: card.id,
            },
            update: {
              githubIssueId: githubIssue.number,
              githubIssueNodeId: githubIssue.node_id,
              lastSyncAt: new Date(),
            },
            create: {
              cardId: card.id,
              projectId: this.project.id,
              githubIssueId: githubIssue.number,
              githubIssueNodeId: githubIssue.node_id,
              githubRepoName: this.project.githubRepoName!,
              lastSyncAt: new Date(),
            },
          });

          await prisma.card.update({
            where: { id: card.id },
            data: {
              githubIssueId: githubIssue.number,
              githubIssueUrl: githubIssue.html_url,
              githubLastSyncAt: new Date(),
            },
          });

          result.synced.issuesCreated++;
        }
      } catch (error) {
        result.conflicts.push({
          cardId: card.id,
          description: `Failed to sync card: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }
  }

  /**
   * Sync comments from GitHub to MemoLab
   */
  private async syncCommentsFromGitHub(owner: string, repo: string, issueNumber: number, cardId: string) {
    const githubComments = await this.githubService.getIssueComments(owner, repo, issueNumber);
    
    for (const githubComment of githubComments) {
      const existingComment = await prisma.comment.findFirst({
        where: {
          cardId,
          githubCommentId: githubComment.id,
        },
      });

      if (!existingComment) {
        // Try to find the user by GitHub username
        let authorId = this.project.ownerId; // Default to project owner
        
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: githubComment.user.login },
              // If they've connected with GitHub OAuth, their account will have the GitHub provider
              {
                accounts: {
                  some: {
                    provider: 'github',
                    providerAccountId: githubComment.user.id.toString(),
                  },
                },
              },
            ],
          },
        });

        if (user) {
          authorId = user.id;
        }

        // Check if this is a Claude/AI comment
        const isClaudeComment = githubComment.user.login === 'claude' || 
                               githubComment.user.login.includes('claude') ||
                               githubComment.body.includes('@claude') ||
                               githubComment.body.includes('Claude Code is working') ||
                               githubComment.body.includes('Generated with [Claude Code]');

        // Create new comment
        await prisma.comment.create({
          data: {
            content: user 
              ? githubComment.body 
              : `**From GitHub (@${githubComment.user.login}):**\n\n${githubComment.body}`,
            cardId,
            authorId,
            githubCommentId: githubComment.id,
            githubSyncEnabled: true,
            isAiComment: isClaudeComment,
          },
        });
      }
    }
  }

  /**
   * Find a user by GitHub username or account ID
   */
  private async findUserByGitHub(username: string, githubId: number) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          {
            accounts: {
              some: {
                provider: 'github',
                providerAccountId: githubId.toString(),
              },
            },
          },
        ],
      },
    });
  }

}

/**
 * Utility functions for project GitHub integration
 */
export class ProjectGitHubService {
  /**
   * Link a project to a GitHub repository
   */
  static async linkRepository(
    projectId: string,
    githubRepoName: string,
    installationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const repoData = parseRepositoryName(githubRepoName);
      if (!repoData) {
        throw new Error('Invalid repository name format');
      }

      // Verify the installation has access to this repository
      const githubService = await GitHubService.createForInstallation(installationId);
      const { owner, repo } = repoData;
      
      try {
        await githubService.getRepository(owner, repo);
      } catch (error) {
        throw new Error('Repository not accessible or does not exist');
      }

      // Generate a unique webhook secret for this project
      const webhookSecret = `vhgh_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      await prisma.project.update({
        where: { id: projectId },
        data: {
          githubRepoName,
          githubRepoUrl: `https://github.com/${githubRepoName}`,
          githubInstallationId: installationId,
          githubSyncEnabled: true,
          githubWebhookSecret: webhookSecret,
        },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unlink a project from GitHub
   */
  static async unlinkRepository(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          githubRepoId: null,
          githubRepoName: null,
          githubRepoUrl: null,
          githubInstallationId: null,
          githubSyncEnabled: false,
          githubLastSyncAt: null,
          githubWebhookSecret: null,
        },
      });

      // Optionally delete all sync records
      await prisma.gitHubIssueSync.deleteMany({
        where: { projectId },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get sync status for a project
   */
  static async getSyncStatus(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        githubIssueSync: {
          include: { card: true },
        },
        _count: {
          select: {
            cards: true,
            githubIssueSync: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    return {
      isLinked: !!project.githubRepoName,
      repoName: project.githubRepoName,
      repoUrl: project.githubRepoUrl,
      syncEnabled: project.githubSyncEnabled,
      lastSyncAt: project.githubLastSyncAt,
      totalCards: project._count.cards,
      syncedCards: project._count.githubIssueSync,
      syncRecords: project.githubIssueSync,
    };
  }
}