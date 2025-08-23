import { z } from 'zod';
import { getUserProjects, getProjectById } from '@/lib/project-functions';
// Type for the MCP server
type Server = Parameters<Parameters<typeof import('@vercel/mcp-adapter').createMcpHandler>[0]>[0];

interface ToolContext {
  projectId?: string | null;
  userId?: string;
}

export function registerProjectTools(server: Server, context?: ToolContext) {
  server.tool(
    "list_projects",
    "Retrieve all projects accessible to the authenticated user",
    {},
    async () => {
      const result = await getUserProjects();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_project",
    "Get detailed information about a specific project",
    {
      project_id: z.string().describe("Project identifier")
    },
    async ({ project_id }) => {
      const result = await getProjectById(project_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "get_current_project",
    "Get detailed information about the current project (from X-Project-Id header)",
    {},
    async () => {
      const projectId = context?.projectId;
      
      if (!projectId) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              error: "Project ID is required. Please provide via X-Project-Id header when configuring the MCP server."
            }, null, 2)
          }]
        };
      }
      
      const result = await getProjectById(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );
}