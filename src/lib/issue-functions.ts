'use server';

import { prisma } from '@/lib/prisma';
import { IssuesAPI } from '@/lib/api/issues/index';

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  acceptanceCriteria: string | null;
  priority: number;
  storyPoints: number | null;
  status: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  sprint?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssuesResult {
  success: boolean;
  error?: string;
  issues?: Issue[];
}

export interface CreateIssueResult {
  success: boolean;
  error?: string;
  issue?: Issue;
}

export interface GetIssueResult {
  success: boolean;
  error?: string;
  issue?: Issue & {
    assignee?: { id: string; name: string | null; email: string } | null;
    sprint?: { id: string; name: string } | null;
    comments?: Array<{
      id: string;
      content: string;
      author?: { id: string; name: string | null; email: string } | null;
      createdAt: Date;
    }>;
    labels?: Array<{ label: { id: string; name: string; color: string } }>;
    agentInstructions?: Array<{ id: string; instructionType: string }>;
  };
}

export interface UpdateIssueResult {
  success: boolean;
  error?: string;
  issue?: Issue;
}

export interface DeleteIssueResult {
  success: boolean;
  error?: string;
}

/**
 * Get issues for a project
 */
export async function getProjectIssues(
  projectId: string,
  filters?: {
    status?: string;
    sprintId?: string;
    activeSprint?: boolean;
  }
): Promise<IssuesResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    // For now, we'll use a placeholder user ID
    const userId = 'placeholder-user-id';

    const issues = await IssuesAPI.getIssues({
      projectId,
      userId,
      status: filters?.status,
      sprintId: filters?.sprintId,
      activeSprint: filters?.activeSprint,
    });

    return {
      success: true,
      issues
    };
  } catch (error: unknown) {
    console.error('Error getting project issues:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Create a new issue
 */
export async function createIssue(data: {
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
}): Promise<CreateIssueResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    // For now, we'll use a placeholder user ID
    const userId = 'placeholder-user-id';

    const issue = await IssuesAPI.createIssue({
      userId,
      ...data,
    });

    return {
      success: true,
      issue
    };
  } catch (error: unknown) {
    console.error('Error creating issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Get issue by ID
 */
export async function getIssueById(issueId: string, projectId: string): Promise<GetIssueResult> {
  try {
    // TODO: Authentication will be handled at a higher layer

    const issue = await IssuesAPI.getIssueById(issueId, projectId);
    return {
      success: true,
      issue
    };
  } catch (error: unknown) {
    console.error('Error getting issue by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Update issue with agent instructions
 */
export async function updateIssueWithAgentInstructions(
  issueId: string,
  projectId: string,
  updates: {
    title?: string;
    description?: string;
    acceptanceCriteria?: string;
    priority?: number;
    storyPoints?: number;
    status?: string;
    assigneeId?: string;
    sprintId?: string | null;
    isAiAllowedTask?: boolean;
    githubSyncEnabled?: boolean;
    agentInstructions?: Array<{
      instructionType: string;
      branchName?: string;
      createBranch?: boolean;
      webResearchPrompt?: string;
      codeResearchPrompt?: string;
      architectureGuidelines?: string;
      generalInstructions?: string;
    }>;
  }
): Promise<UpdateIssueResult> {
  try {
    // TODO: Authentication will be handled at a higher layer

    // Handle agent instructions update separately if provided
    if (updates.agentInstructions !== undefined) {
      // Delete existing instructions and create new ones
      await prisma.agentDeveloperInstructions.deleteMany({
        where: { cardId: issueId },
      });

      await prisma.card.update({
        where: { id: issueId },
        data: {
          agentInstructions: {
            create: updates.agentInstructions.map((instruction) => ({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              instructionType: instruction.instructionType as any,
              branchName: instruction.branchName,
              createBranch: instruction.createBranch || false,
              webResearchPrompt: instruction.webResearchPrompt,
              codeResearchPrompt: instruction.codeResearchPrompt,
              architectureGuidelines: instruction.architectureGuidelines,
              generalInstructions: instruction.generalInstructions,
            })),
          }
        }
      });
    }

    // Update the issue with other fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { agentInstructions, ...updateParams } = updates;
    const issue = await IssuesAPI.updateIssue(issueId, projectId, updateParams);
    return {
      success: true,
      issue
    };
  } catch (error: unknown) {
    console.error('Error updating issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Update issue
 */
export async function updateIssue(
  issueId: string,
  projectId: string,
  updates: {
    title?: string;
    description?: string;
    acceptanceCriteria?: string;
    priority?: number;
    storyPoints?: number;
    status?: string;
    assigneeId?: string;
    sprintId?: string | null;
    isAiAllowedTask?: boolean;
    githubSyncEnabled?: boolean;
  }
): Promise<UpdateIssueResult> {
  try {
    // TODO: Authentication will be handled at a higher layer

    const issue = await IssuesAPI.updateIssue(issueId, projectId, updates);
    return {
      success: true,
      issue
    };
  } catch (error: unknown) {
    console.error('Error updating issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Delete issue
 */
export async function deleteIssue(issueId: string, projectId: string): Promise<DeleteIssueResult> {
  try {
    // TODO: Authentication will be handled at a higher layer

    await IssuesAPI.deleteIssue(issueId, projectId);
    return {
      success: true
    };
  } catch (error: unknown) {
    console.error('Error deleting issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

export interface IssueLabel {
  cardId: string;
  labelId: string;
  label: {
    id: string;
    name: string;
    color: string;
  };
}

export interface IssueLabelResult {
  success: boolean;
  error?: string;
  issueLabel?: IssueLabel;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  authorId: string;
  isAiComment: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface CommentsResult {
  success: boolean;
  error?: string;
  comments?: Comment[];
}

export interface CreateCommentResult {
  success: boolean;
  error?: string;
  comment?: Comment;
}

/**
 * Add label to issue
 */
export async function addLabelToIssue(issueId: string, labelId: string): Promise<IssueLabelResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';

    // Check if issue exists
    const issue = await prisma.card.findUnique({
      where: { id: issueId },
      include: {
        project: true
      }
    });

    if (!issue) {
      return {
        success: false,
        error: 'Issue not found'
      };
    }

    // Verify the label exists and belongs to the same project
    const label = await prisma.label.findUnique({
      where: { id: labelId }
    });

    if (!label || label.projectId !== issue.projectId) {
      return {
        success: false,
        error: 'Label not found or does not belong to this project'
      };
    }

    // Check if the issue already has this label
    const existingIssueLabel = await prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId: issueId,
          labelId
        }
      }
    });

    if (existingIssueLabel) {
      return {
        success: false,
        error: 'Label already assigned to this issue'
      };
    }

    // Create the issue-label relationship
    const issueLabel = await prisma.cardLabel.create({
      data: {
        cardId: issueId,
        labelId
      },
      include: {
        label: true
      }
    });

    return {
      success: true,
      issueLabel
    };
  } catch (error: unknown) {
    console.error('Error assigning label to issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Remove label from issue
 */
export async function removeLabelFromIssue(issueId: string, labelId: string): Promise<DeleteIssueResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';

    // Check if issue exists
    const issue = await prisma.card.findUnique({
      where: { id: issueId },
      include: {
        project: true
      }
    });

    if (!issue) {
      return {
        success: false,
        error: 'Issue not found'
      };
    }

    // Remove the issue-label relationship
    await prisma.cardLabel.deleteMany({
      where: {
        cardId: issueId,
        labelId
      }
    });

    return {
      success: true
    };
  } catch (error: unknown) {
    console.error('Error removing label from issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Get comments for an issue
 */
export async function getIssueComments(issueId: string): Promise<CommentsResult> {
  try {
    // TODO: Authentication will be handled at a higher layer

    // Fetch comments for the issue
    const comments = await prisma.comment.findMany({
      where: { cardId: issueId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return {
      success: true,
      comments
    };
  } catch (error: unknown) {
    console.error('Error fetching comments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Create a comment for an issue
 */
export async function createIssueComment(issueId: string, content: string): Promise<CreateCommentResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';

    if (!content || content.trim() === '') {
      return {
        success: false,
        error: 'Content is required'
      };
    }

    // Check if issue exists
    const issue = await prisma.card.findUnique({
      where: { id: issueId }
    });

    if (!issue) {
      return {
        success: false,
        error: 'Issue not found'
      };
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        cardId: issueId,
        content: content.trim(),
        authorId: userId,
        isAiComment: false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return {
      success: true,
      comment
    };
  } catch (error: unknown) {
    console.error('Error creating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}