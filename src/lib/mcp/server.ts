import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { PrismaClient } from '@/generated/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { validateToolArgs, handleMCPError, rateLimiter, requestLogger } from './validation.js';
import { MCPResourceHandler } from './resources.js';
import { mcpEventBus, MCPEventEmitter } from './notifications.js';

const prisma = new PrismaClient();

class VibeHeroMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'vibehero-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          notifications: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_projects',
            description: 'List all projects for the authenticated user',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_project',
            description: 'Create a new project',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Project name' },
                description: { type: 'string', description: 'Project description' },
              },
              required: ['name'],
            },
          },
          {
            name: 'list_issues',
            description: 'List issues for a project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'Project ID' },
                status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'Filter by status' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'create_issue',
            description: 'Create a new issue',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'Project ID' },
                title: { type: 'string', description: 'Issue title' },
                description: { type: 'string', description: 'Issue description' },
                status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'Issue status' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Issue priority' },
              },
              required: ['projectId', 'title'],
            },
          },
          {
            name: 'update_issue',
            description: 'Update an existing issue',
            inputSchema: {
              type: 'object',
              properties: {
                issueId: { type: 'string', description: 'Issue ID' },
                title: { type: 'string', description: 'Issue title' },
                description: { type: 'string', description: 'Issue description' },
                status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'Issue status' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Issue priority' },
              },
              required: ['issueId'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const startTime = Date.now();
      let success = false;
      let error: string | undefined;

      try {
        // Get current user for rate limiting and logging
        const user = await this.getCurrentUser();
        
        // Check rate limit
        if (!rateLimiter.checkRateLimit(user.id)) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Rate limit exceeded. Please wait before making more requests.',
            {
              remainingRequests: rateLimiter.getRemainingRequests(user.id),
              resetTime: rateLimiter.getResetTime(user.id)
            }
          );
        }

        // Validate arguments
        const validatedArgs = validateToolArgs(name, args);

        // Import tool handlers dynamically
        const { MCPToolHandlers } = await import('./tools.js');

        let result;
        switch (name) {
          // Organization Management
          case 'list_organizations':
            result = await MCPToolHandlers.handleListOrganizations();
            break;
          case 'create_organization':
            result = await MCPToolHandlers.handleCreateOrganization(validatedArgs);
            break;
          case 'invite_to_organization':
            result = await MCPToolHandlers.handleInviteToOrganization(validatedArgs);
            break;
          
          // Project Management
          case 'list_projects':
            result = await this.handleListProjects();
            break;
          case 'create_project':
            result = await this.handleCreateProject(validatedArgs);
            break;
          
          // Sprint Management
          case 'list_sprints':
            result = await MCPToolHandlers.handleListSprints(validatedArgs);
            break;
          case 'create_sprint':
            result = await MCPToolHandlers.handleCreateSprint(validatedArgs);
            break;
          case 'close_sprint':
            result = await MCPToolHandlers.handleCloseSprint(validatedArgs);
            break;
          
          // Label Management
          case 'list_labels':
            result = await MCPToolHandlers.handleListLabels(validatedArgs);
            break;
          case 'create_label':
            result = await MCPToolHandlers.handleCreateLabel(validatedArgs);
            break;
          case 'assign_label':
            result = await MCPToolHandlers.handleAssignLabel(validatedArgs);
            break;
          
          // Issue Management
          case 'list_issues':
            result = await this.handleListIssues(validatedArgs);
            break;
          case 'create_issue':
            result = await this.handleCreateIssue(validatedArgs);
            break;
          case 'update_issue':
            result = await this.handleUpdateIssue(validatedArgs);
            break;
          
          // Comment Management
          case 'list_comments':
            result = await MCPToolHandlers.handleListComments(validatedArgs);
            break;
          case 'create_comment':
            result = await MCPToolHandlers.handleCreateComment(validatedArgs);
            break;
          
          // AI Integration
          case 'get_ai_ready_cards':
            result = await MCPToolHandlers.handleGetAiReadyCards(validatedArgs);
            break;
          case 'update_card_status':
            result = await MCPToolHandlers.handleUpdateCardStatus(validatedArgs);
            break;
          case 'get_next_ready_card':
            result = await MCPToolHandlers.handleGetNextReadyCard(validatedArgs);
            break;
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        success = true;
        return result;
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error';
        const mcpError = handleMCPError(err);
        throw mcpError;
      } finally {
        // Log the request
        try {
          const user = await this.getCurrentUser().catch(() => null);
          if (user) {
            requestLogger.logRequest(
              user.id,
              name,
              args,
              success,
              Date.now() - startTime,
              error
            );
          }
        } catch {
          // Ignore logging errors
        }
      }
    });
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        return await MCPResourceHandler.listResources();
      } catch (error) {
        const mcpError = handleMCPError(error);
        throw mcpError;
      }
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      try {
        const { uri } = request.params;
        return await MCPResourceHandler.readResource(uri);
      } catch (error) {
        const mcpError = handleMCPError(error);
        throw mcpError;
      }
    });
  }

  private async getCurrentUser() {
    const { getMCPAuth } = await import('./auth.js');
    const auth = getMCPAuth();
    return auth.requireAuth();
  }

  private async handleListProjects() {
    const user = await this.getCurrentUser();
    
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } }
        ]
      },
      include: {
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

  private async handleCreateProject(args: any) {
    const user = await this.getCurrentUser();
    
    const schema = z.object({
      name: z.string(),
      description: z.string().optional(),
    });

    const { name, description } = schema.parse(args);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: user.id,
      },
    });

    // Emit event notification
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

  private async handleListIssues(args: any) {
    const user = await this.getCurrentUser();
    
    const schema = z.object({
      projectId: z.string(),
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
    });

    const { projectId, status } = schema.parse(args);

    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } }
        ]
      }
    });

    if (!project) {
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
        labels: true,
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

  private async handleCreateIssue(args: any) {
    const user = await this.getCurrentUser();
    
    const schema = z.object({
      projectId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
    });

    const { projectId, title, description, status, priority } = schema.parse(args);

    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { users: { some: { userId: user.id } } }
        ]
      }
    });

    if (!project) {
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
        labels: true,
      },
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

  private async handleUpdateIssue(args: any) {
    const user = await this.getCurrentUser();
    
    const schema = z.object({
      issueId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['todo', 'in_progress', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    });

    const { issueId, ...updateData } = schema.parse(args);

    // Verify user has access to issue via project
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        project: {
          OR: [
            { ownerId: user.id },
            { users: { some: { userId: user.id } } }
          ]
        }
      }
    });

    if (!issue) {
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
        labels: true,
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updatedIssue, null, 2),
        },
      ],
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('VibeHero MCP Server started on stdio');
  }
}

export default VibeHeroMCPServer;