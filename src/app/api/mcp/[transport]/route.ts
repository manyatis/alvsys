import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { generateMcpOnboardingInstructions } from '../../../../lib/ai/onboarding-flows';
import { AIService } from '../../../../lib/ai-service';
import { 
  createTaskInstructions,
  createApiEndpointsInfo 
} from '../../../../lib/mcp-utils';
import { CardStatus } from '../../../../types/card';
import { prisma } from '../../../../lib/prisma';

// MCP-specific authentication helper
async function authenticateMcpRequest(bearerToken: string, projectId: string) {
  if (!bearerToken) {
    throw new Error('Bearer token is required for authentication.');
  }

  // Find the API key
  const userKeys = await prisma.aPIKey.findMany({
    where: {
      key: bearerToken,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          organizationId: true,
        },
      },
    },
  });

  if (userKeys.length !== 1) {
    throw new Error('Invalid API key.');
  }

  const userKey = userKeys[0];

  // Update last used timestamp  
  await prisma.aPIKey.update({
    where: { id: userKey.id },
    data: { lastUsedAt: new Date() }
  });

  const user = userKey.user;

  // Check if user has access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.id }, // User owns the project
        { 
          users: {
            some: { userId: user.id } // User is a member of the project
          }
        }
      ]
    }
  });

  if (!project) {
    throw new Error('Invalid API key or insufficient permissions for this project.');
  }

  return user;
}

const handler = createMcpHandler(
  (server) => {
    // Fetch all tasks tool
    server.tool(
      'fetchAllTasks',
      'Fetch all AI-allowed tasks that are READY or IN_PROGRESS for a project',
      {
        projectId: z.string().describe('The project ID to fetch tasks for'),
        bearerToken: z.string().describe('Bearer token for authentication'),
      },
      async ({ projectId, bearerToken }) => {
        // Authenticate the request
        const user = await authenticateMcpRequest(bearerToken, projectId);
        
        const project = await AIService.getProjectById(projectId);
        const cards = await AIService.getReadyCards(projectId);

        const response = {
          project: {
            id: project.id,
            name: project.name
          },
          cards: cards,
          totalCards: cards.length,
          instructions: createTaskInstructions(cards, project.name),
          api_endpoints: createApiEndpointsInfo(projectId)
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }
    );

    // Update task status tool
    server.tool(
      'updateTaskStatus',
      'Update the status of a task and optionally add a comment',
      {
        projectId: z.string().describe('The project ID the task belongs to'),
        cardId: z.string().describe('The ID of the task/card to update'),
        status: z.enum(['IN_PROGRESS', 'READY_FOR_REVIEW', 'BLOCKED', 'COMPLETED']).describe('The new status for the task'),
        comment: z.string().optional().describe('Optional comment to add when updating the status'),
        bearerToken: z.string().describe('Bearer token for authentication'),
      },
      async ({ projectId, cardId, status, comment, bearerToken }) => {
        // Authenticate the request
        const user = await authenticateMcpRequest(bearerToken, projectId);

        await AIService.getProjectById(projectId);
        
        const result = await AIService.updateCardStatus(
          cardId, 
          status as CardStatus, 
          projectId, 
          comment
          // Note: userId is optional for MCP calls since no auth context
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    );

    // Onboard tool
    server.tool(
      'onboard',
      'Get onboarding instructions for AI agents to autonomously execute tasks in a project',
      {
        projectId: z.string().describe('The project ID to get onboarding instructions for'),
        bearerToken: z.string().describe('Bearer token for authentication'),
      },
      async ({ projectId, bearerToken }) => {
        // Authenticate the request
        const user = await authenticateMcpRequest(bearerToken, projectId);

        const project = await AIService.getProjectById(projectId);
        const instructions = generateMcpOnboardingInstructions({
          projectId: project.id,
          apiToken: bearerToken
        });

        return {
          content: [
            {
              type: 'text',
              text: instructions,
            },
          ],
        };
      }
    );

    // Next ready tool
    server.tool(
      'nextReady',
      'Get the next ready task for AI processing from a project',
      {
        projectId: z.string().describe('The project ID to get the next ready task from'),
        bearerToken: z.string().describe('Bearer token for authentication'),
      },
      async ({ projectId, bearerToken }) => {
        // Authenticate the request
        const user = await authenticateMcpRequest(bearerToken, projectId);

        await AIService.getProjectById(projectId);
        
        const result = await AIService.getNextReadyCard(projectId);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    );
  }
);

export { handler as GET, handler as POST };