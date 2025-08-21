'use server';

import { PrismaClient, Card, Project, Status } from '@prisma/client';
import { GitHubService } from '@/lib/github';
import { GitHubSyncService, SyncOptions, SyncResult } from '@/services/github-sync-service';
import { prisma } from './prisma';

export interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    type: string;
    avatar_url: string;
  };
  repository_selection: string;
  permissions?: Record<string, string>;
  repositories: GitHubRepository[];
  error?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
}

export interface GitHubInstallationsResponse {
  installations: GitHubInstallation[];
  needsAppInstallation?: boolean;
  needsAuthorization?: boolean;
  needsGitHubConnection?: boolean;
  authorizationUrl?: string;
  installUrl?: string;
  usingAppAuth?: boolean;
  error?: string;
}

export interface ProjectSyncResult {
  success: boolean;
  error?: string;
  result?: SyncResult;
}

export interface CardSyncResult {
  success: boolean;
  error?: string;
  card?: Card;
}

export interface WebhookResult {
  success: boolean;
  error?: string;
  processed?: boolean;
}

export interface ProjectGitHubStatus {
  isLinked: boolean;
  repositoryName?: string;
  installationId?: number;
  syncEnabled: boolean;
  lastSyncAt?: Date;
  cardsSynced?: number;
  totalCards?: number;
}

/**
 * Get GitHub installations for a user
 * Uses the user's OAuth token to get accessible installations
 */
export async function getUserInstallations(userId: string): Promise<GitHubInstallationsResponse> {
    try {
      // Get user's GitHub account (if connected via OAuth)
      const githubAccount = await prisma.account.findFirst({
        where: {
          userId: userId,
          provider: 'github',
        },
      });

      if (!githubAccount?.access_token) {
        const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero';
        return {
          installations: [],
          needsAppInstallation: true,
          error: 'GitHub account not connected',
          authorizationUrl: `https://github.com/apps/${appName}/installations/new`,
        };
      }

      try {
        // Get installations using the user's OAuth token
        const userGithubService = new GitHubService(undefined, githubAccount.access_token);
        const installations = await userGithubService.getInstallations();
        
        // For each installation, get accessible repositories
        const installationsWithRepos = await Promise.all(
          installations.map(async (installation) => {
            try {
              const repos = await userGithubService.getInstallationRepositories(installation.id.toString());
              return {
                id: installation.id,
                account: {
                  login: (installation.account as { login?: string })?.login || 'Unknown',
                  type: (installation.account as { type?: string })?.type || 'User',
                  avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
                },
                repository_selection: installation.repository_selection,
                permissions: installation.permissions,
                repositories: repos.repositories.map((repo: GitHubRepository) => ({
                  id: repo.id,
                  name: repo.name,
                  full_name: repo.full_name,
                  description: repo.description,
                  private: repo.private,
                  html_url: repo.html_url,
                  default_branch: repo.default_branch,
                })),
              };
            } catch (error) {
              console.error(`Error getting repositories for installation ${installation.id}:`, error);
              return {
                id: installation.id,
                account: {
                  login: (installation.account as { login?: string })?.login || 'Unknown',
                  type: (installation.account as { type?: string })?.type || 'User',
                  avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
                },
                repository_selection: installation.repository_selection,
                permissions: installation.permissions,
                repositories: [],
                error: 'Failed to load repositories',
              };
            }
          })
        );

        return {
          installations: installationsWithRepos,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStatus = (error as { status?: number }).status;
        
        // If it's a 403, the user needs to authorize the app
        if (errorStatus === 403) {
          const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero';
          return {
            installations: [],
            needsAppInstallation: true,
            needsAuthorization: true,
            authorizationUrl: `https://github.com/apps/${appName}/installations/new`,
            error: 'GitHub App requires authorization. Please authorize the app to access your installations.',
          };
        }
        
        const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero';
        return {
          installations: [],
          needsAppInstallation: true,
          error: errorMessage,
          authorizationUrl: `https://github.com/apps/${appName}/installations/new`,
        };
      }
    } catch (error) {
      console.error('Error getting GitHub installations:', error);
      return {
        installations: [],
        error: 'Internal server error',
      };
    }
  }

  /**
   * Get GitHub App installations using App authentication
   * Requires GitHub App credentials to be configured
   */
export async function getAppInstallations(): Promise<GitHubInstallationsResponse> {
    try {
      const appGithubService = new GitHubService();
      const installations = await appGithubService.getInstallations();
      
      // Get repositories for each installation
      const installationsWithRepos = await Promise.all(
        installations.map(async (installation) => {
          try {
            const installationService = await GitHubService.createForInstallation(installation.id.toString());
            const repos = await installationService.getInstallationRepositories(installation.id.toString());
            
            return {
              id: installation.id,
              account: {
                login: (installation.account as { login?: string })?.login || 'Unknown',
                type: (installation.account as { type?: string })?.type || 'User',
                avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
              },
              repository_selection: installation.repository_selection,
              repositories: repos.repositories || [],
            };
          } catch (error) {
            console.error(`Error getting repos for installation ${installation.id}:`, error);
            return {
              id: installation.id,
              account: {
                login: (installation.account as { login?: string })?.login || 'Unknown',
                type: (installation.account as { type?: string })?.type || 'User',
                avatar_url: (installation.account as { avatar_url?: string })?.avatar_url || '',
              },
              repository_selection: installation.repository_selection,
              repositories: [],
              error: 'Failed to load repositories',
            };
          }
        })
      );

      return {
        installations: installationsWithRepos,
        usingAppAuth: true,
      };
    } catch (error) {
      console.error('Error getting app installations:', error);
      
      return {
        installations: [],
        needsAppInstallation: true,
        error: 'Failed to get GitHub App installations. Make sure the app is properly configured.',
        installUrl: `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibe-hero'}/installations/new`,
      };
    }
  }

  /**
   * Link a project to a GitHub repository
   */
export async function linkProjectToRepository(
    projectId: string, 
    repositoryName: string, 
    installationId: number,
    userId: string
  ): Promise<{ success: boolean; error?: string; project?: Project }> {
    try {
      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { users: { some: { userId: userId } } },
          ],
        },
      });

      if (!project) {
        return { success: false, error: 'Project not found or access denied' };
      }

      // Update project with GitHub information
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          githubRepoName: repositoryName,
          githubInstallationId: installationId.toString(),
          githubSyncEnabled: true,
          githubLastSyncAt: new Date(),
        },
      });

      return { success: true, project: updatedProject };
    } catch (error) {
      console.error('Error linking project to repository:', error);
      return { success: false, error: 'Failed to link project to repository' };
    }
  }

  /**
   * Sync a project with GitHub (bidirectional sync)
   */
export async function syncProject(
    projectId: string, 
    userId: string, 
    options: SyncOptions = { syncComments: true, syncLabels: true }
  ): Promise<ProjectSyncResult> {
    try {
      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { users: { some: { userId: userId } } },
          ],
        },
      });

      if (!project) {
        return { success: false, error: 'Project not found or access denied' };
      }

      // Create sync service using installation token
      const syncService = await GitHubSyncService.createForProject(projectId);
      
      if (!syncService) {
        return { 
          success: false,
          error: 'GitHub sync not configured for this project. Please ensure the GitHub App is installed and the project is linked to a repository.'
        };
      }

      // Perform sync
      const result = await syncService.syncProject(options);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, result };
    } catch (error) {
      console.error('Error syncing project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sync a specific card to GitHub
   */
export async function syncCardToGitHub(
    cardId: string, 
    userId: string
  ): Promise<CardSyncResult> {
    try {
      // Get card - access verification handled at higher layer
      const card = await prisma.card.findUnique({
        where: {
          id: cardId,
        },
        include: {
          project: true,
        },
      });

      if (!card) {
        return { success: false, error: 'Card not found' };
      }

      // Create sync service
      const syncService = await GitHubSyncService.createForProject(card.projectId);
      if (!syncService) {
        return {
          success: false,
          error: 'Project not linked to GitHub or sync service unavailable'
        };
      }

      // Sync card to GitHub
      const result = await syncService.syncCardToGitHub(cardId);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Get updated card
      const updatedCard = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
          githubSync: true,
        },
      });

      return { success: true, card: updatedCard || undefined };
    } catch (error) {
      console.error('Error syncing card to GitHub:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Disable GitHub sync for a specific card
   */
export async function disableCardSync(
    cardId: string, 
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get card - access verification handled at higher layer
      const card = await prisma.card.findUnique({
        where: {
          id: cardId,
        },
      });

      if (!card) {
        return { success: false, error: 'Card not found' };
      }

      // Disable GitHub sync for this card
      await prisma.card.update({
        where: { id: cardId },
        data: {
          githubSyncEnabled: false,
          githubIssueId: null,
          githubIssueUrl: null,
          githubLastSyncAt: null,
        },
      });

      // Remove sync record if exists
      await prisma.gitHubIssueSync.deleteMany({
        where: { cardId },
      });

      return { success: true };
    } catch (error) {
      console.error('Error disabling GitHub sync for card:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Reset GitHub sync for a project
   */
export async function resetProjectSync(
    projectId: string, 
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { users: { some: { userId: userId } } },
          ],
        },
      });

      if (!project) {
        return { success: false, error: 'Project not found or access denied' };
      }

      // Create sync service
      const syncService = await GitHubSyncService.createForProject(projectId);
      if (!syncService) {
        return {
          success: false,
          error: 'Project not linked to GitHub or sync service unavailable'
        };
      }

      // Reset sync data - clear GitHub sync records
      await prisma.gitHubIssueSync.deleteMany({
        where: { projectId }
      });

      // Reset project sync status
      await prisma.project.update({
        where: { id: projectId },
        data: {
          githubSyncEnabled: false,
          githubLastSyncAt: null,
          githubRepoName: null,
          githubInstallationId: null
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting project sync:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Verify if a user has access to a project
   */
export async function verifyProjectAccess(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { users: { some: { userId: userId } } },
          ],
        },
      });

      return !!project;
    } catch (error) {
      console.error('Error verifying project access:', error);
      return false;
    }
  }

  /**
   * Sync a specific GitHub issue to VibeHero
   */
export async function syncIssueToVibeHero(
    projectId: string,
    issueNumber: number,
    userId: string
  ): Promise<{ success: boolean; error?: string; card?: Card }> {
    try {
      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { users: { some: { userId: userId } } },
          ],
        },
      });

      if (!project) {
        return { success: false, error: 'Project not found or access denied' };
      }

      // Create sync service
      const syncService = await GitHubSyncService.createForProject(projectId);
      if (!syncService) {
        return {
          success: false,
          error: 'Project not linked to GitHub or sync service unavailable'
        };
      }

      // Sync issue to VibeHero
      const result = await syncService.syncIssueToVibeHero(issueNumber);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Find the created/updated card
      const syncRecord = await prisma.gitHubIssueSync.findFirst({
        where: {
          projectId,
          githubIssueId: issueNumber,
        },
        include: {
          card: true,
        },
      });

      return { 
        success: true, 
        card: syncRecord?.card || undefined 
      };
    } catch (error) {
      console.error('Error syncing issue to VibeHero:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get project GitHub status
   */
export async function getProjectGitHubStatus(
    projectId: string, 
    userId: string
  ): Promise<{
    success: boolean;
    error?: string;
    isLinked: boolean;
    repositoryName?: string;
    installationId?: number;
    syncEnabled: boolean;
    lastSyncAt?: Date;
  }> {
    try {
      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { users: { some: { userId: userId } } },
          ],
        },
      });

      if (!project) {
        return { 
          success: false, 
          error: 'Project not found or access denied',
          isLinked: false,
          syncEnabled: false,
        };
      }

      return {
        success: true,
        isLinked: !!(project.githubRepoName && project.githubInstallationId),
        repositoryName: project.githubRepoName || undefined,
        installationId: project.githubInstallationId ? parseInt(project.githubInstallationId) : undefined,
        syncEnabled: project.githubSyncEnabled || false,
        lastSyncAt: project.githubLastSyncAt || undefined,
      };
    } catch (error) {
      console.error('Error getting project GitHub status:', error);
      return { 
        success: false, 
        error: 'Internal server error',
        isLinked: false,
        syncEnabled: false,
      };
    }
  }

  /**
   * Handle GitHub webhook events
   */
export async function handleWebhook(
    payload: Record<string, unknown>,
    eventType: string
  ): Promise<{ success: boolean; error?: string; processed?: boolean }> {
    try {
      // Handle different webhook event types
      switch (eventType) {
        case 'issues':
          return await handleIssueWebhook(payload);
        case 'issue_comment':
          return await handleCommentWebhook(payload);
        case 'installation':
          return await handleInstallationWebhook(payload);
        default:
          return { success: true, processed: false };
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Handle GitHub issue webhook events
   */
async function handleIssueWebhook(
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string; processed?: boolean }> {
    try {
      const { action, issue, repository, installation } = payload;
      
      if (!(installation as { id?: number })?.id) {
        return { success: true, processed: false };
      }

      // Find the project linked to this repository
      const project = await prisma.project.findFirst({
        where: {
          githubInstallationId: (installation as { id: number }).id.toString(),
          githubRepoName: (repository as { full_name: string }).full_name,
        },
      });

      if (!project) {
        return { success: true, processed: false };
      }

      // Create sync service
      const syncService = await GitHubSyncService.createForProject(project.id);
      if (!syncService) {
        return { success: false, error: 'Unable to create sync service' };
      }

      // Handle different issue actions
      switch (action) {
        case 'opened':
        case 'edited':
        case 'closed':
        case 'reopened':
          await syncService.syncIssueToVibeHero((issue as { number: number }).number);
          break;
        default:
          return { success: true, processed: false };
      }

      return { success: true, processed: true };
    } catch (error) {
      console.error('Error handling issue webhook:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Handle GitHub comment webhook events
   */
async function handleCommentWebhook(
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string; processed?: boolean }> {
    try {
      const { action, comment, issue, repository, installation } = payload;
      
      if (!(installation as { id?: number })?.id || action !== 'created') {
        return { success: true, processed: false };
      }

      // Find the project and sync record
      const syncRecord = await prisma.gitHubIssueSync.findFirst({
        where: {
          githubIssueId: (issue as { number: number }).number,
          githubRepoName: (repository as { full_name: string }).full_name,
        },
        include: {
          project: true,
        },
      });

      if (!syncRecord) {
        return { success: true, processed: false };
      }

      // Create comment in VibeHero
      await prisma.comment.create({
        data: {
          content: (comment as { body: string }).body,
          cardId: syncRecord.cardId,
          authorId: syncRecord.project.ownerId, // Use project owner for external comments
          isAiComment: false,
          githubCommentId: (comment as { id: number }).id,
        },
      });

      return { success: true, processed: true };
    } catch (error) {
      console.error('Error handling comment webhook:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Handle GitHub installation webhook events
   */
async function handleInstallationWebhook(
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string; processed?: boolean }> {
    try {
      const { action, installation } = payload;
      
      switch (action) {
        case 'deleted':
          // Remove GitHub configuration from projects
          await prisma.project.updateMany({
            where: {
              githubInstallationId: (installation as { id: number }).id.toString(),
            },
            data: {
              githubInstallationId: null,
              githubRepoName: null,
              githubSyncEnabled: false,
            },
          });
          break;
        default:
          return { success: true, processed: false };
      }

      return { success: true, processed: true };
    } catch (error) {
      console.error('Error handling installation webhook:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Unlink a project from its GitHub repository
   */
export async function unlinkProjectFromRepository(
    projectId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify user has access to the project (must be owner)
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: userId, // Only owners can unlink
        },
      });

      if (!project) {
        return { success: false, error: 'Project not found or insufficient permissions' };
      }

      // Unlink the repository
      await prisma.project.update({
        where: { id: projectId },
        data: {
          githubRepoName: null,
          githubInstallationId: null,
          githubSyncEnabled: false,
          githubLastSyncAt: null,
        },
      });

      // Remove all sync records
      await prisma.gitHubIssueSync.deleteMany({
        where: { projectId },
      });

      return { success: true };
    } catch (error) {
      console.error('Error unlinking project from repository:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Create a new project from a GitHub repository
   */
export async function createProjectFromRepository(
    repoName: string,
    repoDescription: string | undefined,
    installationId: number,
    syncIssues: boolean,
    userId: string
  ): Promise<{ 
    success: boolean; 
    error?: string; 
    project?: {
      id: string;
      name: string;
      description: string;
      organization: {
        id: string;
        name: string;
      };
      _count: {
        cards: number;
      };
      createdAt: Date;
      githubRepoName: string | null;
      githubRepoUrl: string | null;
      githubSyncEnabled: boolean | null;
      githubLastSyncAt: Date | null;
    };
    message?: string;
  }> {
    try {
      // Get the GitHub repository details
      const githubAccount = await prisma.account.findFirst({
        where: {
          userId: userId,
          provider: 'github',
        },
      });

      if (!githubAccount?.access_token) {
        return {
          success: false,
          error: 'GitHub account not connected'
        };
      }

      const githubService = new GitHubService(undefined, githubAccount.access_token);
      
      // Check if a project already exists for this repository
      const existingProject = await prisma.project.findFirst({
        where: {
          githubRepoName: repoName,
          ownerId: userId,
        },
      });

      if (existingProject) {
        return {
          success: false,
          error: `Project already exists for repository ${repoName}`
        };
      }

      // Get repository details
      const repoDetails = await githubService.getRepositoryByName(repoName);
      
      // Create organization first (using repo owner name)
      const repoOwner = repoName.split('/')[0];
      let organization = await prisma.organization.findFirst({
        where: {
          slug: repoOwner.toLowerCase(),
        },
      });

      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            name: repoOwner,
            slug: repoOwner.toLowerCase(),
            description: `GitHub organization for ${repoOwner}`,
          },
        });
      }

      // Create the project with GitHub integration
      const project = await prisma.project.create({
        data: {
          name: repoDetails.name,
          description: repoDescription || repoDetails.description || `Project synced from GitHub repository ${repoName}`,
          ownerId: userId,
          organizationId: organization.id,
          githubRepoId: repoDetails.id.toString(),
          githubRepoName: repoName,
          githubRepoUrl: repoDetails.html_url,
          githubInstallationId: installationId.toString(),
          githubSyncEnabled: syncIssues,
          githubLastSyncAt: null,
        },
        include: {
          organization: true,
          _count: {
            select: {
              cards: true,
            },
          },
        },
      });

      // Add user to project
      await prisma.projectUser.create({
        data: {
          projectId: project.id,
          userId: userId,
          role: 'owner',
        },
      });

      // If sync is enabled, perform initial sync
      if (syncIssues) {
        try {
          // Use the user's GitHub service for syncing (since we're using OAuth, not GitHub App)
          const userGithubService = new GitHubService(undefined, githubAccount.access_token);
          const syncService = new GitHubSyncService(userGithubService, project);
          
          const syncResult = await syncService.syncProject({
            syncComments: true,
            syncLabels: true,
            initialSync: true, // Only sync FROM GitHub TO VibeHero during project creation
          });

          console.log('Sync result:', syncResult);

          // Only update last sync time if sync was successful
          if (syncResult.success) {
            await prisma.project.update({
              where: { id: project.id },
              data: { githubLastSyncAt: new Date() },
            });
          }
        } catch (syncError) {
          console.error('Initial sync failed:', syncError);
          // Don't fail project creation if sync fails
        }
      }

      return {
        success: true,
        project: {
          id: project.id,
          name: project.name,
          description: project.description || '',
          organization: project.organization || { id: '', name: '' },
          _count: project._count,
          createdAt: project.createdAt,
          githubRepoName: project.githubRepoName,
          githubRepoUrl: project.githubRepoUrl,
          githubSyncEnabled: project.githubSyncEnabled,
          githubLastSyncAt: project.githubLastSyncAt,
        },
        message: syncIssues ? 'Project created and GitHub issues synced' : 'Project created without sync',
      };
    } catch (error) {
      console.error('Error creating project from GitHub:', error);
      return { success: false, error: 'Internal server error' };
    }
}