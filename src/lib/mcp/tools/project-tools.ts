import { z } from 'zod';
import { getUserProjects, getProjectById } from '@/lib/project-functions';
// Type for the MCP server
type Server = Parameters<Parameters<typeof import('@vercel/mcp-adapter').createMcpHandler>[0]>[0];

export function registerProjectTools(server: Server) {
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
}