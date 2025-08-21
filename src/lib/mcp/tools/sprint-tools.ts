import { z } from 'zod';
import { 
  getProjectSprints,
  createSprint,
  updateSprint,
  closeSprint,
  deleteSprint
} from '@/lib/sprint-functions';

// MCP tools use a system user ID
const MCP_USER_ID = 'mcp-system';
// Type for the MCP server
type Server = Parameters<Parameters<typeof import('@vercel/mcp-adapter').createMcpHandler>[0]>[0];

export function registerSprintTools(server: Server) {
  server.tool(
    "list_sprints",
    "Get all sprints in a project",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ project_id }) => {
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
      
      const result = await getProjectSprints(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_active_sprint",
    "Get the currently active sprint in a project",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ project_id }) => {
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
      
      const result = await getProjectSprints(projectId);
      if (result.success && result.sprints) {
        const activeSprint = result.sprints.find(s => s.isActive);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              success: true,
              activeSprint: activeSprint || null
            }, null, 2)
          }]
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_sprint_issues",
    "Get all issues in a specific sprint",
    {
      sprint_id: z.string().describe("Sprint identifier"),
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ sprint_id, project_id }) => {
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
      
      // Import getProjectIssues here to avoid circular dependency
      const { getProjectIssues } = await import('@/lib/issue-functions');
      const result = await getProjectIssues(projectId, MCP_USER_ID, { sprintId: sprint_id });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "create_sprint",
    "Create a new sprint in the project",
    {
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)"),
      name: z.string().describe("Sprint name"),
      start_date: z.string().optional().describe("Sprint start date (ISO format)"),
      end_date: z.string().optional().describe("Sprint end date (ISO format)")
    },
    async ({ project_id, name, start_date, end_date }) => {
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
      
      const result = await createSprint(
        projectId,
        {
          name,
          startDate: start_date,
          endDate: end_date
        }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "update_sprint",
    "Update an existing sprint",
    {
      sprint_id: z.string().describe("Sprint identifier"),
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)"),
      name: z.string().optional().describe("New sprint name"),
      start_date: z.string().optional().describe("New start date (ISO format)"),
      end_date: z.string().optional().describe("New end date (ISO format)"),
      is_active: z.boolean().optional().describe("Set sprint as active/inactive")
    },
    async ({ sprint_id, project_id, name, start_date, end_date, is_active }) => {
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
      
      const result = await updateSprint(
        projectId,
        sprint_id,
        {
          name,
          startDate: start_date,
          endDate: end_date,
          isActive: is_active
        }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "close_sprint",
    "Close a sprint and optionally move incomplete issues to next sprint",
    {
      sprint_id: z.string().describe("Sprint identifier"),
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ sprint_id, project_id }) => {
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
      
      const result = await closeSprint(projectId, sprint_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "delete_sprint",
    "Delete a sprint (only if it has no issues)",
    {
      sprint_id: z.string().describe("Sprint identifier"),
      project_id: z.string().optional().describe("The project ID (optional if VIBE_HERO_PROJECT_ID env var is set)")
    },
    async ({ sprint_id, project_id }) => {
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
      
      const result = await deleteSprint(projectId, sprint_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );
}