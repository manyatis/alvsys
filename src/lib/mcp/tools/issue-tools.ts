import { z } from 'zod';
import { 
  getProjectIssues, 
  createIssue,
  getIssueById,
  updateIssueWithAgentInstructions,
  createIssueComment,
  addLabelToIssue,
  removeLabelFromIssue,
  getIssueComments
} from '@/lib/issue-functions';
import { AiAPI } from '@/lib/api/ai';
// Type for the MCP server
type Server = Parameters<Parameters<typeof import('@vercel/mcp-adapter').createMcpHandler>[0]>[0];

export function registerIssueTools(server: Server) {
  server.tool(
    "next_ready",
    "Fetch the next highest priority task that's ready for work",
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
      
      const result = await AiAPI.getNextReadyTask({ projectId });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "list_issues",
    "Get all issues in a project with optional status filter",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)"),
      status: z.string().optional().describe("Filter by status (REFINEMENT, READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED)"),
      sprint_id: z.string().optional().describe("Filter by sprint ID"),
      // TODO: Add assignee filter when supported by getProjectIssues
      // assignee_id: z.string().optional().describe("Filter by assignee ID")
    },
    async ({ project_id, status, sprint_id }) => {
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
      
      const result = await getProjectIssues(projectId, { status, sprintId: sprint_id });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_issue",
    "Get detailed information about a specific issue",
    {
      issue_id: z.string().describe("Issue identifier"),
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ issue_id, project_id }) => {
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
      
      const result = await getIssueById(issue_id, projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "create_issue",
    "Create a new issue in the project",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)"),
      title: z.string().describe("Issue title"),
      description: z.string().optional().describe("Detailed description"),
      acceptance_criteria: z.string().optional().describe("Definition of done"),
      is_ai_allowed_task: z.boolean().optional().default(true).describe("Allow AI processing"),
      priority: z.number().optional().default(3).describe("Priority level (1-5)"),
      effort_points: z.number().optional().describe("Story points estimate"),
      status: z.string().optional().default("REFINEMENT").describe("Initial status"),
      sprint_id: z.string().optional().describe("Sprint to assign to"),
      assignee_id: z.string().optional().describe("User to assign to"),
      label_ids: z.array(z.string()).optional().describe("Label IDs to add")
    },
    async ({ project_id, title, description, acceptance_criteria, is_ai_allowed_task, priority, effort_points, status, sprint_id }) => {
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
      
      const result = await createIssue({
        projectId,
        title,
        description,
        acceptanceCriteria: acceptance_criteria,
        isAiAllowedTask: is_ai_allowed_task,
        priority,
        storyPoints: effort_points,
        status,
        sprintId: sprint_id,
        // TODO: Add assigneeId and labelIds when supported by createIssue
        // assigneeId: assignee_id,
        // labelIds: label_ids
      });
      
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "update_task",
    "Updates a task with new status, comments, or other properties. Use this to track progress as you work on tasks.",
    {
      projectId: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)"),
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
        const actualProjectId = projectId || process.env.VIBE_HERO_PROJECT_ID;
        
        if (!actualProjectId) {
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ 
                success: false, 
                error: "Project ID is required. Either pass 'projectId' parameter or set VIBE_HERO_PROJECT_ID environment variable." 
              }, null, 2) 
            }]
          };
        }
        
        const results = [];

        const existingTask = await getIssueById(cardId, actualProjectId);
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
            actualProjectId,
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
              projectId: actualProjectId 
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

  server.tool(
    "add_comment",
    "Add a comment to an issue for team communication",
    {
      card_id: z.string().describe("Task/issue identifier"),
      content: z.string().describe("Comment text"),
      is_ai_comment: z.boolean().optional().default(true).describe("Mark as AI-generated")
    },
    async ({ card_id, content }) => {
      const result = await createIssueComment(card_id, content);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_comments",
    "Get all comments for an issue",
    {
      issue_id: z.string().describe("Issue identifier")
    },
    async ({ issue_id }) => {
      const result = await getIssueComments(issue_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "add_label_to_issue",
    "Add a label to an issue",
    {
      issue_id: z.string().describe("Issue identifier"),
      label_id: z.string().describe("Label identifier")
    },
    async ({ issue_id, label_id }) => {
      const result = await addLabelToIssue(issue_id, label_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "remove_label_from_issue",
    "Remove a label from an issue",
    {
      issue_id: z.string().describe("Issue identifier"),
      label_id: z.string().describe("Label identifier")
    },
    async ({ issue_id, label_id }) => {
      const result = await removeLabelFromIssue(issue_id, label_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );
}