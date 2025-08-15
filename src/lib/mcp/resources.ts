import { PrismaClient } from '@/generated/prisma';
import { getMCPAuth } from './auth.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

const prisma = new PrismaClient();

/**
 * MCP Resources - Read-only data and templates
 */
export class MCPResourceHandler {
  
  static async listResources(): Promise<any> {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    return {
      resources: [
        // Project Templates
        {
          uri: 'vibehero://templates/project/basic',
          name: 'Basic Project Template',
          description: 'Standard project setup with common labels and structure',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://templates/project/agile',
          name: 'Agile Project Template',
          description: 'Agile project with sprints, user stories, and acceptance criteria',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://templates/project/kanban',
          name: 'Kanban Project Template',
          description: 'Kanban-style project with continuous flow',
          mimeType: 'application/json'
        },
        
        // Issue Templates
        {
          uri: 'vibehero://templates/issue/bug',
          name: 'Bug Report Template',
          description: 'Standard bug report with reproduction steps',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://templates/issue/feature',
          name: 'Feature Request Template',
          description: 'Feature request with user story format',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://templates/issue/task',
          name: 'Task Template',
          description: 'General task with checklist',
          mimeType: 'application/json'
        },
        
        // Schemas
        {
          uri: 'vibehero://schemas/project',
          name: 'Project Schema',
          description: 'JSON schema for project structure validation',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://schemas/issue',
          name: 'Issue Schema',
          description: 'JSON schema for issue structure validation',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://schemas/sprint',
          name: 'Sprint Schema',
          description: 'JSON schema for sprint structure validation',
          mimeType: 'application/json'
        },
        
        // User Data
        {
          uri: 'vibehero://data/user/profile',
          name: 'User Profile',
          description: 'Current user profile and preferences',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://data/user/projects',
          name: 'User Projects Summary',
          description: 'Summary of user projects and activity',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://data/user/usage',
          name: 'Usage Statistics',
          description: 'User usage statistics and limits',
          mimeType: 'application/json'
        }
      ]
    };
  }

  static async readResource(uri: string): Promise<any> {
    const auth = getMCPAuth();
    const user = auth.requireAuth();

    switch (uri) {
      // Project Templates
      case 'vibehero://templates/project/basic':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                name: 'New Project',
                description: 'A new project for organizing tasks and issues',
                labels: [
                  { name: 'bug', color: '#EF4444', description: 'Something isn\'t working' },
                  { name: 'enhancement', color: '#3B82F6', description: 'New feature or request' },
                  { name: 'documentation', color: '#10B981', description: 'Improvements or additions to documentation' },
                  { name: 'good first issue', color: '#84CC16', description: 'Good for newcomers' },
                  { name: 'help wanted', color: '#F59E0B', description: 'Extra attention is needed' }
                ],
                initialSprint: {
                  name: 'Sprint 1',
                  duration: 14 // days
                },
                settings: {
                  allowAiTasks: true,
                  defaultPriority: 'medium',
                  defaultStatus: 'todo'
                }
              }, null, 2)
            }
          ]
        };

      case 'vibehero://templates/project/agile':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                name: 'Agile Project',
                description: 'Agile project with sprints and user stories',
                labels: [
                  { name: 'epic', color: '#8B5CF6', description: 'Large feature or theme' },
                  { name: 'user story', color: '#22C55E', description: 'User-focused requirement' },
                  { name: 'spike', color: '#F97316', description: 'Research or investigation task' },
                  { name: 'technical debt', color: '#EF4444', description: 'Code quality improvement' },
                  { name: 'blocked', color: '#6B7280', description: 'Cannot proceed' }
                ],
                sprints: [
                  { name: 'Sprint 1', duration: 14, goal: 'Initial setup and core features' },
                  { name: 'Sprint 2', duration: 14, goal: 'User interface and experience' }
                ],
                storyPointScale: [1, 2, 3, 5, 8, 13, 21],
                definitionOfDone: [
                  'Code reviewed',
                  'Tests passing',
                  'Documentation updated',
                  'Deployed to staging'
                ]
              }, null, 2)
            }
          ]
        };

      case 'vibehero://templates/project/kanban':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                name: 'Kanban Project',
                description: 'Continuous flow project with WIP limits',
                columns: [
                  { name: 'Backlog', wipLimit: null },
                  { name: 'Ready', wipLimit: 5 },
                  { name: 'In Progress', wipLimit: 3 },
                  { name: 'Review', wipLimit: 2 },
                  { name: 'Done', wipLimit: null }
                ],
                labels: [
                  { name: 'priority-high', color: '#EF4444', description: 'High priority' },
                  { name: 'priority-medium', color: '#F59E0B', description: 'Medium priority' },
                  { name: 'priority-low', color: '#84CC16', description: 'Low priority' },
                  { name: 'urgent', color: '#DC2626', description: 'Urgent - immediate attention' }
                ],
                policies: [
                  'Pull, don\'t push',
                  'Limit work in progress',
                  'Focus on flow efficiency'
                ]
              }, null, 2)
            }
          ]
        };

      // Issue Templates
      case 'vibehero://templates/issue/bug':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                title: 'Bug: [Brief description]',
                description: `## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Environment
- OS: [e.g. iOS, Windows, Linux]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

## Additional Context
Add any other context about the problem here.`,
                priority: 'high',
                labels: ['bug'],
                status: 'todo'
              }, null, 2)
            }
          ]
        };

      case 'vibehero://templates/issue/feature':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                title: 'Feature: [Brief description]',
                description: `## User Story
As a [type of user], I want [some goal] so that [some reason].

## Acceptance Criteria
- [ ] Given [some context]
- [ ] When [some action is taken]
- [ ] Then [some outcome is achieved]

## Additional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Design Notes
Any design considerations or mockups.

## Technical Notes
Any technical implementation details or constraints.`,
                priority: 'medium',
                labels: ['enhancement'],
                status: 'todo'
              }, null, 2)
            }
          ]
        };

      case 'vibehero://templates/issue/task':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                title: 'Task: [Brief description]',
                description: `## Task Description
Describe what needs to be done.

## Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Success Criteria
- What does "done" look like?
- How will we know this is complete?

## Dependencies
- List any dependencies or prerequisites

## Notes
Any additional notes or context.`,
                priority: 'medium',
                labels: ['task'],
                status: 'todo'
              }, null, 2)
            }
          ]
        };

      // Schemas
      case 'vibehero://schemas/project':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                $schema: 'http://json-schema.org/draft-07/schema#',
                title: 'Project',
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 255,
                    description: 'Project name'
                  },
                  description: {
                    type: 'string',
                    maxLength: 2000,
                    description: 'Project description'
                  },
                  ownerId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Project owner user ID'
                  },
                  organizationId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Organization ID'
                  },
                  isActive: {
                    type: 'boolean',
                    default: true,
                    description: 'Whether the project is active'
                  }
                },
                required: ['name', 'ownerId'],
                additionalProperties: false
              }, null, 2)
            }
          ]
        };

      case 'vibehero://schemas/issue':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                $schema: 'http://json-schema.org/draft-07/schema#',
                title: 'Issue',
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 255,
                    description: 'Issue title'
                  },
                  description: {
                    type: 'string',
                    maxLength: 10000,
                    description: 'Issue description'
                  },
                  status: {
                    type: 'string',
                    enum: ['todo', 'in_progress', 'done'],
                    description: 'Issue status'
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: 'Issue priority'
                  },
                  projectId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Project ID'
                  },
                  reporterId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Reporter user ID'
                  },
                  assigneeId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Assignee user ID'
                  }
                },
                required: ['title', 'projectId', 'reporterId'],
                additionalProperties: false
              }, null, 2)
            }
          ]
        };

      // User Data
      case 'vibehero://data/user/profile':
        const userProfile = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            organization: true,
            subscription: true
          }
        });

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                id: userProfile?.id,
                name: userProfile?.name,
                email: userProfile?.email,
                image: userProfile?.image,
                tier: userProfile?.tier,
                organization: userProfile?.organization ? {
                  id: userProfile.organization.id,
                  name: userProfile.organization.name
                } : null,
                subscription: userProfile?.subscription ? {
                  status: userProfile.subscription.status,
                  currentPeriodEnd: userProfile.subscription.currentPeriodEnd
                } : null,
                createdAt: userProfile?.createdAt,
                updatedAt: userProfile?.updatedAt
              }, null, 2)
            }
          ]
        };

      case 'vibehero://data/user/projects':
        const projects = await prisma.project.findMany({
          where: {
            OR: [
              { ownerId: user.id },
              { users: { some: { userId: user.id } } }
            ]
          },
          include: {
            _count: {
              select: { 
                issues: true,
                users: true,
                sprints: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                totalProjects: projects.length,
                projects: projects.map(project => ({
                  id: project.id,
                  name: project.name,
                  description: project.description,
                  isOwner: project.ownerId === user.id,
                  issueCount: project._count.issues,
                  memberCount: project._count.users,
                  sprintCount: project._count.sprints,
                  createdAt: project.createdAt,
                  updatedAt: project.updatedAt
                }))
              }, null, 2)
            }
          ]
        };

      case 'vibehero://data/user/usage':
        const usage = await prisma.userUsage.findUnique({
          where: { userId: user.id }
        });

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                userId: user.id,
                cardsProcessed: usage?.cardsProcessed || 0,
                lastResetDate: usage?.lastResetDate,
                tier: user.tier,
                limits: {
                  FREE: { cardsPerMonth: 10 },
                  PRO: { cardsPerMonth: 1000 },
                  ENTERPRISE: { cardsPerMonth: -1 } // unlimited
                }
              }, null, 2)
            }
          ]
        };

      default:
        throw new McpError(
          ErrorCode.InvalidParams,
          `Resource not found: ${uri}`
        );
    }
  }
}