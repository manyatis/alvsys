import { createMcpHandler } from '@vercel/mcp-adapter';
import { NextRequest, NextResponse } from 'next/server';
import { registerProjectTools } from '@/lib/mcp/tools/project-tools';
import { registerIssueTools } from '@/lib/mcp/tools/issue-tools';
import { registerSprintTools } from '@/lib/mcp/tools/sprint-tools';
import { registerWorkflowTools } from '@/lib/mcp/tools/workflow-tools';
import { registerStatisticsTools } from '@/lib/mcp/tools/statistics-tools';
import { verifyMcpAuth } from '@/lib/mcp/auth';

// Create the base MCP handler
const mcpHandler = createMcpHandler(
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

// Wrap the handler with authentication
async function authenticatedHandler(request: NextRequest) {
  // Check if authentication is enabled via environment variable
  const authEnabled = process.env.MCP_AUTH_ENABLED === 'true';
  
  if (authEnabled) {
    // Verify Bearer token authentication
    const authResult = await verifyMcpAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Add user context to request for downstream use
    const headers = new Headers(request.headers);
    headers.set('X-User-Id', authResult.userId!);
    
    // Create new request with updated headers
    const authenticatedRequest = new NextRequest(request.url, {
      method: request.method,
      headers: headers,
      body: request.body,
    });
    
    // Pass through to MCP handler
    return mcpHandler(authenticatedRequest);
  }
  
  // If auth is disabled, pass through directly
  return mcpHandler(request);
}

export { 
  authenticatedHandler as GET, 
  authenticatedHandler as POST, 
  authenticatedHandler as DELETE 
};