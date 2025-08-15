import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getMCPAuth } from './auth.js';
import { CardService } from '@/services/card-service.js';
import { UsageService } from '@/services/usage-service.js';
import { CardStatus } from '@/types/card.js';

const prisma = new PrismaClient();

export class MCPToolHandlers {
  // Organization Management Tools
  static async handleListOrganizations() {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { id: user.organizationId || undefined },
          {
            projects: {
              some: {
                OR: [
                  { ownerId: user.id },
                  { users: { some: { userId: user.id } } }
                ]
              }
            }
          }
        ]
      },
      include: {
        _count: {
          select: { projects: true, members: true }
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(organizations, null, 2),
        },
      ],
    };
  }

  static async handleCreateOrganization(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      name: z.string(),
      description: z.string().optional(),
    });

    const { name, description } = schema.parse(args);

    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        _count: {
          select: { projects: true, members: true }
        }
      }
    });

    // Update user's organizationId
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(organization, null, 2),
        },
      ],
    };
  }

  static async handleInviteToOrganization(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      organizationId: z.string(),
      email: z.string().email(),
      role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
    });

    const { organizationId, email, role } = schema.parse(args);

    // Check if user is admin of the organization
    const orgMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
        role: 'ADMIN'
      }
    });

    if (!orgMember) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Only organization admins can invite members'
      );
    }

    // Check if user exists
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitedUser) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'User with this email does not exist'
      );
    }

    // Check if already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: invitedUser.id
      }
    });

    if (existingMember) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'User is already a member of this organization'
      );
    }

    const invitation = await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: invitedUser.id,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        organization: {
          select: { id: true, name: true }
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(invitation, null, 2),
        },
      ],
    };
  }

  // Project Management Tools
  static async handleListProjects() {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } }
        ]
      },
      include: {
        organization: {
          select: { id: true, name: true }
        },
        _count: {
          select: { issues: true }
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    };
  }

  static async handleCreateProject(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();
    
    const schema = z.object({
      name: z.string(),
      description: z.string().optional(),
      organizationId: z.string().optional(),
    });

    const { name, description, organizationId } = schema.parse(args);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: user.id,
        organizationId: organizationId || user.organizationId,
      },
      include: {
        organization: {
          select: { id: true, name: true }
        },
        _count: {
          select: { issues: true }
        }
      }
    });

    // Emit event notification
    const { MCPEventEmitter } = await import('./notifications.js');
    await MCPEventEmitter.projectCreated(user.id, project.id, {
      name: project.name,
      description: project.description,
      ownerId: project.ownerId
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    };
  }

  // Sprint Management Tools
  static async handleListSprints(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
    });

    const { projectId } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { cards: true }
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sprints, null, 2),
        },
      ],
    };
  }

  static async handleCreateSprint(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
      name: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });

    const { projectId, name, startDate, endDate } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    // Check if there's already an active sprint
    const activeSprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        isActive: true,
      },
    });

    const sprint = await prisma.sprint.create({
      data: {
        name,
        projectId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks default
        isActive: !activeSprint, // Make active if no other active sprint
      },
      include: {
        _count: {
          select: { cards: true }
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sprint, null, 2),
        },
      ],
    };
  }

  static async handleCloseSprint(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      sprintId: z.string(),
    });

    const { sprintId } = schema.parse(args);

    // Check if user has access to sprint via project
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        project: {
          OR: [
            { ownerId: user.id },
            { users: { some: { userId: user.id } } }
          ]
        }
      }
    });

    if (!sprint) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Sprint not found or access denied'
      );
    }

    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: { 
        isActive: false,
        endDate: new Date()
      },
      include: {
        _count: {
          select: { cards: true }
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updatedSprint, null, 2),
        },
      ],
    };
  }

  // Label Management Tools
  static async handleListLabels(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
    });

    const { projectId } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    const labels = await prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(labels, null, 2),
        },
      ],
    };
  }

  static async handleCreateLabel(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
      name: z.string(),
      color: z.string().optional(),
    });

    const { projectId, name, color } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    // Check if label already exists
    const existingLabel = await prisma.label.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: name.trim()
        }
      }
    });

    if (existingLabel) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Label already exists'
      );
    }

    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
      '#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
      '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
    ];

    const label = await prisma.label.create({
      data: {
        name: name.trim(),
        color: color || colors[Math.floor(Math.random() * colors.length)],
        projectId
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(label, null, 2),
        },
      ],
    };
  }

  static async handleAssignLabel(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      issueId: z.string(),
      labelId: z.string(),
    });

    const { issueId, labelId } = schema.parse(args);

    if (!(await auth.checkIssueAccess(issueId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Issue not found or access denied'
      );
    }

    // Verify label belongs to same project as issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { projectId: true }
    });

    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        projectId: issue?.projectId
      }
    });

    if (!label) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Label not found in issue project'
      );
    }

    // Check if already assigned
    const existing = await prisma.issueLabel.findFirst({
      where: { issueId, labelId }
    });

    if (existing) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Label already assigned to issue'
      );
    }

    const assignment = await prisma.issueLabel.create({
      data: { issueId, labelId },
      include: {
        label: true,
        issue: {
          select: { id: true, title: true }
        }
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(assignment, null, 2),
        },
      ],
    };
  }

  // Issue Management Tools  
  static async handleListIssues(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
    });

    const { projectId, status } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    const issues = await prisma.issue.findMany({
      where: {
        projectId,
        ...(status && { status }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        labels: {
          include: {
            label: true
          }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issues, null, 2),
        },
      ],
    };
  }

  static async handleCreateIssue(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
    });

    const { projectId, title, description, status, priority } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status,
        priority,
        projectId,
        reporterId: user.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        labels: {
          include: {
            label: true
          }
        },
        _count: {
          select: { comments: true }
        }
      },
    });

    // Emit event notification
    const { MCPEventEmitter } = await import('./notifications.js');
    await MCPEventEmitter.issueCreated(user.id, projectId, {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    };
  }

  static async handleUpdateIssue(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      issueId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    });

    const { issueId, ...updateData } = schema.parse(args);

    if (!(await auth.checkIssueAccess(issueId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Issue not found or access denied'
      );
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        labels: {
          include: {
            label: true
          }
        },
        _count: {
          select: { comments: true }
        }
      },
    });

    // Emit event notification
    const { MCPEventEmitter } = await import('./notifications.js');
    await MCPEventEmitter.issueStatusChanged(
      user.id, 
      updatedIssue.projectId, 
      issueId, 
      'unknown', // We'd need to track old status
      updatedIssue.status
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updatedIssue, null, 2),
        },
      ],
    };
  }

  // Comment Management Tools
  static async handleListComments(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      issueId: z.string(),
    });

    const { issueId } = schema.parse(args);

    if (!(await auth.checkIssueAccess(issueId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Issue not found or access denied'
      );
    }

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
      content: [
        {
          type: 'text',
          text: JSON.stringify(comments, null, 2),
        },
      ],
    };
  }

  static async handleCreateComment(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      issueId: z.string(),
      content: z.string(),
      isAiComment: z.boolean().default(false),
    });

    const { issueId, content, isAiComment } = schema.parse(args);

    if (!(await auth.checkIssueAccess(issueId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Issue not found or access denied'
      );
    }

    const comment = await prisma.comment.create({
      data: {
        cardId: issueId,
        content: content.trim(),
        authorId: user.id,
        isAiComment
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
      content: [
        {
          type: 'text',
          text: JSON.stringify(comment, null, 2),
        },
      ],
    };
  }

  // AI Integration Tools
  static async handleGetAiReadyCards(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
    });

    const { projectId } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    const readyCards = await CardService.getAiReadyCards(projectId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(readyCards.map(card => ({
            id: card.id,
            title: card.title,
            description: card.description,
            acceptanceCriteria: card.acceptanceCriteria,
            status: card.status,
            projectId: card.projectId,
            agentInstructions: card.agentInstructions,
            project: card.project,
          })), null, 2),
        },
      ],
    };
  }

  static async handleUpdateCardStatus(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      cardId: z.string(),
      status: z.enum(['BACKLOG', 'READY', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'COMPLETED']),
      comment: z.string().optional(),
    });

    const { cardId, status, comment } = schema.parse(args);

    // Check access via project
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        project: {
          OR: [
            { ownerId: user.id },
            { users: { some: { userId: user.id } } }
          ]
        }
      }
    });

    if (!card) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Card not found or access denied'
      );
    }

    const updatedCard = await CardService.updateCardStatus(cardId, status as CardStatus);

    // Add comment if provided
    if (comment) {
      await prisma.comment.create({
        data: {
          cardId,
          content: comment,
          authorId: user.id,
          isAiComment: true,
        },
      });
    }

    // Increment usage when AI completes tasks
    if (status === 'READY_FOR_REVIEW' || status === 'COMPLETED') {
      await UsageService.incrementCardUsage(user.id);
    }

    // Log AI activity
    await prisma.aIWorkLog.create({
      data: {
        cardId,
        userId: user.id,
        action: 'update_card_status',
        details: { status, comment, previousStatus: card.status },
        apiEndpoint: 'mcp://vibehero/update_card_status'
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Card status updated successfully',
            card: {
              id: updatedCard.id,
              status: updatedCard.status,
              title: updatedCard.title,
            }
          }, null, 2),
        },
      ],
    };
  }

  static async handleGetNextReadyCard(args: any) {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    const schema = z.object({
      projectId: z.string(),
    });

    const { projectId } = schema.parse(args);

    if (!(await auth.checkProjectAccess(projectId))) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Project not found or access denied'
      );
    }

    const nextCard = await prisma.card.findFirst({
      where: {
        projectId,
        status: 'READY',
        isAiAllowedTask: true,
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        project: true,
        agentInstructions: true,
        assignee: true,
      },
    });

    if (!nextCard) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: 'No ready tasks available. Continue polling for new tasks.',
              card: null,
              instruction: 'Wait and check again later for new tasks.'
            }, null, 2),
          },
        ],
      };
    }

    // Log AI activity
    await prisma.aIWorkLog.create({
      data: {
        cardId: nextCard.id,
        userId: user.id,
        action: 'get_next_ready_card',
        details: { projectId, title: nextCard.title },
        apiEndpoint: 'mcp://vibehero/get_next_ready_card'
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            card: {
              id: nextCard.id,
              title: nextCard.title,
              description: nextCard.description,
              acceptanceCriteria: nextCard.acceptanceCriteria,
              status: nextCard.status,
              priority: nextCard.priority,
              projectId: nextCard.projectId,
              isAiAllowedTask: nextCard.isAiAllowedTask,
              agentInstructions: nextCard.agentInstructions,
              project: nextCard.project,
              assignee: nextCard.assignee,
              createdAt: nextCard.createdAt,
              updatedAt: nextCard.updatedAt,
            }
          }, null, 2),
        },
      ],
    };
  }
}