import { createMcpHandler } from '@vercel/mcp-adapter';
import z from 'zod';

const handler = createMcpHandler(
    async (server) => {
        // server comes from the official MCP SDK 
        server.tool(
            "add_todo", // The name of the tool
            "Adds a todo to the list", // A description what the tool does

            async () => { // Implemenation of the tool
                
                return {
                    content: [{ type: "text", text: `Hello World` }],
                };
            }
        );
    },
    {}, // This is for server options, we can leave them empty
    {
        basePath: "/api/llm", // The URL where you host the MCP Server
    }
);

export { handler as GET, handler as POST, handler as DELETE };