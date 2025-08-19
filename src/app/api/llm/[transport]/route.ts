import { AiAPI, GetNextReadyTaskParams } from '@/lib/api/ai';
import { createMcpHandler } from '@vercel/mcp-adapter';
import z from 'zod';




const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "next_ready",
      "fetches the next ready task",
      async () => {
        const projectId = process.env.VIBE_PROJECT_ID;
        if (!projectId) return {
          content: [{ type: "text", text: "error, no project id was passed in" }]
        }

        let params: GetNextReadyTaskParams = { projectId }
        const result = await AiAPI.getNextReadyTask(params);
        
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    );

    server.tool(
      "start_working",
      "Starts the working loop for the agent",
      async () => {
        const projectId = process.env.VIBE_PROJECT_ID;
        if (!projectId) return {
          content: [{ type: "text", text: "error, no project id was passed in" }]
        }

        let params: GetNextReadyTaskParams = { projectId }
        const result = await AiAPI.getOnboardInstructions(params);

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    );
  },
  {},
  {
    basePath: "/api/llm",
  }
);

export { handler as GET, handler as POST, handler as DELETE };