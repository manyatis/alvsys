import { z } from 'zod';
import { AiAPI } from '@/lib/api/ai';
// Type for the MCP server
type Server = Parameters<Parameters<typeof import('@vercel/mcp-adapter').createMcpHandler>[0]>[0];

export function registerWorkflowTools(server: Server) {
  server.tool(
    "dev_mode",
    "Enter continuous development mode - automatically process tasks",
    {
      id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ id }) => {
      const projectId = id || process.env.VIBE_HERO_PROJECT_ID;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Either pass 'id' parameter or set VIBE_HERO_PROJECT_ID environment variable."
            }, null, 2)
          }]
        };
      }
      
      const result = await AiAPI.getOnboardInstructions({ projectId });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "start_working",
    "Start working on a specific task and update its status",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)"),
      card_id: z.string().describe("Task/issue identifier"),
      comment: z.string().optional().describe("Initial progress comment")
    },
    async ({ project_id, card_id, comment }) => {
      const projectId = project_id || process.env.VIBE_HERO_PROJECT_ID;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Either pass 'project_id' parameter or set VIBE_HERO_PROJECT_ID environment variable."
            }, null, 2)
          }]
        };
      }
      
      // Import updateIssueWithAgentInstructions here to avoid circular dependency
      const { updateIssueWithAgentInstructions, createIssueComment } = await import('@/lib/issue-functions');
      
      const updateResult = await updateIssueWithAgentInstructions(
        card_id,
        projectId,
        { status: 'IN_PROGRESS' }
      );
      
      const results = [updateResult];
      
      if (comment && updateResult.success) {
        const commentResult = await createIssueComment(card_id, comment);
        results.push(commentResult);
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: updateResult.success,
            results,
            taskId: card_id,
            projectId
          }, null, 2)
        }]
      };
    }
  );

  server.tool(
    "update_progress",
    "Update task status and add progress comments",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)"),
      card_id: z.string().describe("Task/issue identifier"),
      status: z.string().describe("New status (READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED)"),
      comment: z.string().optional().describe("Progress update comment")
    },
    async ({ project_id, card_id, status, comment }) => {
      const projectId = project_id || process.env.VIBE_HERO_PROJECT_ID;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Either pass 'project_id' parameter or set VIBE_HERO_PROJECT_ID environment variable."
            }, null, 2)
          }]
        };
      }
      
      const { updateIssueWithAgentInstructions, createIssueComment } = await import('@/lib/issue-functions');
      
      const updateResult = await updateIssueWithAgentInstructions(
        card_id,
        projectId,
        { status }
      );
      
      const results = [updateResult];
      
      if (comment && updateResult.success) {
        const commentResult = await createIssueComment(card_id, comment);
        results.push(commentResult);
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: updateResult.success,
            results,
            taskId: card_id,
            projectId
          }, null, 2)
        }]
      };
    }
  );
}