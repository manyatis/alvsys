import { AiAPI, GetNextReadyTaskParams } from '@/lib/api/ai';
import { createMcpHandler } from '@vercel/mcp-adapter';
import { 
  updateIssueWithAgentInstructions, 
  createIssueComment, 
  getIssueById 
} from '@/lib/issue-functions';
import z from 'zod';

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "next_ready",
      "fetches the next ready task",
      {
        id: z.string().min(1) 
      },
      async ({id}) => {
        const result = await AiAPI.getNextReadyTask({projectId: id});
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    );

    server.tool(
      "dev_mode",
      "Enters a dev mode work loop of repeadetly fetching the next_ready task and working on it.",
      {
        id: z.string().min(1) 
      },
      async ({id}) => {
        const result = await AiAPI.getOnboardInstructions({projectId: id});

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    );

    server.tool(
      "update_task",
      "Updates a task with new status, comments, or other properties. Use this to track progress as you work on tasks.",
      {
        projectId: z.string().min(1).describe("The project ID"),
        cardId: z.string().min(1).describe("The task/card ID to update"),
        status: z.string().optional().describe("New status (todo, in_progress, in_review, done)"),
        comment: z.string().optional().describe("Add a comment to the task"),
        title: z.string().optional().describe("Update the task title"),
        description: z.string().optional().describe("Update the task description"),
        priority: z.number().optional().describe("Update task priority (1-5)"),
        storyPoints: z.number().optional().describe("Update story points estimate"),
      },
      async ({ projectId, cardId, status, comment, title, description, priority, storyPoints }) => {
        try {
          const results = [];

          // First, get the current task to ensure it exists and we have access
          const existingTask = await getIssueById(cardId, projectId);
          if (!existingTask.success) {
            return {
              content: [{ 
                type: "text", 
                text: JSON.stringify({ 
                  success: false, 
                  error: existingTask.error || "Task not found" 
                }, null, 2) 
              }]
            };
          }

          // Update task properties if provided
          const hasUpdates = status || title || description || priority !== undefined || storyPoints !== undefined;
          if (hasUpdates) {
            const updateData: {
              status?: string;
              title?: string;
              description?: string;
              priority?: number;
              storyPoints?: number;
            } = {};
            if (status) updateData.status = status;
            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (priority !== undefined) updateData.priority = priority;
            if (storyPoints !== undefined) updateData.storyPoints = storyPoints;

            const updateResult = await updateIssueWithAgentInstructions(
              cardId,
              projectId,
              updateData
            );

            if (updateResult.success) {
              results.push({
                action: "update",
                success: true,
                message: "Task updated successfully",
                updates: updateData
              });
            } else {
              results.push({
                action: "update",
                success: false,
                error: updateResult.error
              });
            }
          }

          // Add comment if provided
          if (comment && comment.trim()) {
            const commentResult = await createIssueComment(cardId, comment.trim());
            
            if (commentResult.success) {
              results.push({
                action: "comment",
                success: true,
                message: "Comment added successfully",
                comment: commentResult.comment
              });
            } else {
              results.push({
                action: "comment",
                success: false,
                error: commentResult.error
              });
            }
          }

          // If no actions were specified, return an error
          if (results.length === 0) {
            return {
              content: [{ 
                type: "text", 
                text: JSON.stringify({ 
                  success: false, 
                  error: "No updates specified. Provide at least one of: status, comment, title, description, priority, or storyPoints" 
                }, null, 2) 
              }]
            };
          }

          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ 
                success: true, 
                results,
                taskId: cardId,
                projectId 
              }, null, 2) 
            }]
          };

        } catch (error) {
          console.error('Error updating task:', error);
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
              }, null, 2) 
            }]
          };
        }
      }
    );
  },
  {},
  {
    basePath: "/api/llm",
  }
);

export { handler as GET, handler as POST, handler as DELETE };