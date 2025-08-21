import { createMcpHandler } from '@vercel/mcp-adapter';
import { registerProjectTools } from '@/lib/mcp/tools/project-tools';
import { registerIssueTools } from '@/lib/mcp/tools/issue-tools';
import { registerSprintTools } from '@/lib/mcp/tools/sprint-tools';
import { registerWorkflowTools } from '@/lib/mcp/tools/workflow-tools';
import { registerStatisticsTools } from '@/lib/mcp/tools/statistics-tools';

const handler = createMcpHandler(
  async (server) => {
    // Register all tool categories
    registerProjectTools(server);
    registerIssueTools(server);
    registerSprintTools(server);
    registerWorkflowTools(server);
    registerStatisticsTools(server);
  },
  {},
  {
    basePath: "/api/llm",
  }
);

export { handler as GET, handler as POST, handler as DELETE };