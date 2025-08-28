import { prisma } from '@/lib/prisma';
import { UsageService } from '@/services/usage-service';
import { GitHubSyncService } from '@/services/github-sync-service';
import { ApiError } from '@/lib/api/errors';
import { CardStatus, AgentInstructionType } from '@/types/card';

export interface GetIssuesParams {
  projectId: string;
  userId: string;
  status?: string;
  sprintId?: string;
  activeSprint?: boolean;
}

export interface CreateIssueParams {
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  priority?: number;
  storyPoints?: number;
  isAiAllowedTask?: boolean;
  agentInstructions?: Array<{
    instructionType: string;
    branchName?: string;
    createBranch?: boolean;
    webResearchPrompt?: string;
    codeResearchPrompt?: string;
    architectureGuidelines?: string;
    generalInstructions?: string;
  }>;
  status?: string;
  sprintId?: string;
}

export interface UpdateIssueParams {
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  priority?: number;
  storyPoints?: number;
  status?: string;
  assigneeId?: string | null;
  sprintId?: string | null;
  isAiAllowedTask?: boolean;
  githubSyncEnabled?: boolean;
}

export class IssuesAPI {
  static async getIssues(params: GetIssuesParams) {
    const { projectId, status, sprintId, activeSprint } = params;

    // Build the where clause
    const whereClause: { projectId: string; status?: CardStatus; sprintId?: string | null } = {
      projectId,
    };

    // Add status filter if provided
    if (status) {
      whereClause.status = status as CardStatus;
    }

    if (sprintId) {
      // Filter by specific sprint ID
      whereClause.sprintId = sprintId;
    } else if (activeSprint) {
      // Find the active sprint for this project
      const activeSprint = await prisma.sprint.findFirst({
        where: {
          projectId,
          isActive: true,
        },
      });
      
      // If there's an active sprint, filter cards by it
      // Otherwise, show cards with no sprint assigned (backlog)
      whereClause.sprintId = activeSprint ? activeSprint.id : null;
    }

    const issues = await prisma.card.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agentInstructions: true,
        labels: {
          include: {
            label: true
          }
        },
        sprint: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return issues;
  }

  static async createIssue(params: CreateIssueParams) {
    const {
      userId,
      title,
      description,
      acceptanceCriteria,
      projectId,
      priority = 3,
      storyPoints = 5,
      isAiAllowedTask = true,
      agentInstructions = [],
      status,
      sprintId,
    } = params;

    if (!title || !projectId) {
      throw ApiError.badRequest('Title and projectId are required');
    }

    // Check usage limits before creating card
    const hasReachedLimit = await UsageService.hasReachedDailyCardLimit(userId);
    if (hasReachedLimit) {
      const usageStats = await UsageService.getUserUsageStats(userId);
      throw ApiError.tooManyRequests('Daily card limit reached', {
        used: usageStats.dailyCardProcessingCount,
        limit: 5, // Default limit for now since service is stubbed
        resetTime: usageStats.lastResetDate,
      });
    }

    const issue = await prisma.card.create({
      data: {
        title,
        description,
        acceptanceCriteria,
        projectId,
        priority,
        storyPoints,
        isAiAllowedTask,
        status: status as CardStatus,
        sprintId,
        agentInstructions: {
          create: agentInstructions.map((instruction) => ({
            instructionType: instruction.instructionType as AgentInstructionType,
            branchName: instruction.branchName,
            createBranch: instruction.createBranch || false,
            webResearchPrompt: instruction.webResearchPrompt,
            codeResearchPrompt: instruction.codeResearchPrompt,
            architectureGuidelines: instruction.architectureGuidelines,
            generalInstructions: instruction.generalInstructions,
          })),
        },
      },
      include: {
        agentInstructions: true,
      },
    });

    // Increment usage after successful card creation
    await UsageService.incrementCardUsage(userId);

    // Auto-sync to GitHub if the project has GitHub sync enabled - run in background
    setImmediate(async () => {
      try {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { githubSyncEnabled: true, githubInstallationId: true, githubRepoName: true },
        });
        
        if (project?.githubSyncEnabled && project.githubInstallationId && project.githubRepoName) {
          const githubSyncService = await GitHubSyncService.createForProject(projectId);
          if (githubSyncService) {
            // Enable GitHub sync for this card and sync it to GitHub
            await prisma.card.update({
              where: { id: issue.id },
              data: { githubSyncEnabled: true },
            });
            
            await githubSyncService.syncCardToGitHub(issue.id);
            console.log(`Background GitHub sync completed for new card ${issue.id}`);
          }
        }
      } catch (error) {
        // Log the error but don't fail the card creation
        console.error('Failed to auto-sync card to GitHub in background:', error);
      }
    });

    return issue;
  }

  static async getIssueById(issueId: string, projectId: string) {
    const issue = await prisma.card.findFirst({
      where: {
        id: issueId,
        projectId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agentInstructions: true,
        labels: {
          include: {
            label: true
          }
        },
        sprint: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!issue) {
      throw ApiError.notFound('Issue not found');
    }

    return issue;
  }

  static async updateIssue(issueId: string, projectId: string, updates: UpdateIssueParams) {
    // Verify the issue exists in the project
    const existingIssue = await prisma.card.findFirst({
      where: {
        id: issueId,
        projectId,
      },
    });

    if (!existingIssue) {
      throw ApiError.notFound('Issue not found');
    }

    // Handle assigneeId: convert empty string to null, handle 'agent' special case, validate if not null
    const processedUpdates: UpdateIssueParams = { ...updates };
    if ('assigneeId' in updates) {
      if (updates.assigneeId === '' || updates.assigneeId === undefined) {
        processedUpdates.assigneeId = null;
      } else if (updates.assigneeId === 'agent') {
        // 'agent' is a special value that represents AI assignment, but we store it as null in DB
        processedUpdates.assigneeId = null;
      } else if (updates.assigneeId !== null) {
        // Verify the assignee exists
        const assigneeExists = await prisma.user.findUnique({
          where: { id: updates.assigneeId },
        });
        if (!assigneeExists) {
          throw ApiError.badRequest('Invalid assignee ID');
        }
      }
    }

    const updatedIssue = await prisma.card.update({
      where: { id: issueId },
      data: {
        ...processedUpdates,
        status: processedUpdates.status ? processedUpdates.status as CardStatus : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agentInstructions: true,
        labels: {
          include: {
            label: true
          }
        },
        sprint: true,
      },
    });

    // Sync to GitHub if enabled - run in background to avoid blocking UI
    if (updatedIssue.githubSyncEnabled && updatedIssue.githubIssueId) {
      // Start GitHub sync in background without awaiting
      setImmediate(async () => {
        try {
          const githubSyncService = await GitHubSyncService.createForProject(projectId);
          if (githubSyncService) {
            await githubSyncService.syncCardToGitHub(issueId);
            console.log(`Background GitHub sync completed for card ${issueId}`);
          }
        } catch (error) {
          console.error('Failed to sync issue to GitHub in background:', error);
        }
      });
    }

    return updatedIssue;
  }

  static async deleteIssue(issueId: string, projectId: string) {
    // Verify the issue exists in the project
    const issue = await prisma.card.findFirst({
      where: {
        id: issueId,
        projectId,
      },
    });

    if (!issue) {
      throw ApiError.notFound('Issue not found');
    }

    // Note: Closing GitHub issues would need to be implemented in GitHubSyncService

    // Delete the issue
    await prisma.card.delete({
      where: { id: issueId },
    });

    return { success: true };
  }
  
}