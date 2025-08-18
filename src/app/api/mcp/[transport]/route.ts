import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { generateOnboardingInstructions } from '../../../../lib/ai/onboarding';
import { AIService } from '../../../../lib/ai-service';
import { 
  createTaskInstructions,
  createApiEndpointsInfo 
} from '../../../../lib/mcp-utils';
import { CardStatus } from '../../../../types/card';

const handler = createMcpHandler(
  (server) => {
    // Fetch all tasks tool
    server.tool(
      'fetchAllTasks',
      'Fetch all AI-allowed tasks that are READY or IN_PROGRESS for a project',
      {
        projectId: z.string().describe('The project ID to fetch tasks for'),
      },
      async ({ projectId }) => {
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
      },
      async ({ projectId, cardId, status, comment }) => {
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
      },
      async ({ projectId }) => {
        const project = await AIService.getProjectById(projectId);
        const instructions = generateOnboardingInstructions(
          project.id, 
          process.env.VIBE_HERO_API_TOKEN
        );

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
      },
      async ({ projectId }) => {
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