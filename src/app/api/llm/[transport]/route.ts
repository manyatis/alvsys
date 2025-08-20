import { AiAPI, GetNextReadyTaskParams } from '@/lib/api/ai';
import { createMcpHandler } from '@vercel/mcp-adapter';
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
  },
  {},
  {
    basePath: "/api/llm",
  }
);

export { handler as GET, handler as POST, handler as DELETE };