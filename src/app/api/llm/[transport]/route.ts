import { createMcpHandler } from '@vercel/mcp-adapter';
import { NextRequest, NextResponse } from 'next/server';
import { registerProjectTools } from '@/lib/mcp/tools/project-tools';
import { registerIssueTools } from '@/lib/mcp/tools/issue-tools';
import { registerSprintTools } from '@/lib/mcp/tools/sprint-tools';
import { registerWorkflowTools } from '@/lib/mcp/tools/workflow-tools';
import { registerStatisticsTools } from '@/lib/mcp/tools/statistics-tools';
import { verifyMcpAuth } from '@/lib/mcp/auth';

// Wrap the handler with authentication and context
async function authenticatedHandler(request: NextRequest) {
  // Authentication is enabled by default, can be disabled by setting MCP_AUTH_ENABLED=false
  const authEnabled = process.env.MCP_AUTH_ENABLED !== 'false';
  
  // Extract project_id from headers
  const projectId = request.headers.get('X-Project-Id') || request.headers.get('x-project-id');
  
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
    
    // Create MCP handler with context
    const mcpHandler = createMcpHandler(
      async (server) => {
        // Pass projectId as context to all tool registrations
        const context = { projectId, userId: authResult.userId };
        registerProjectTools(server, context);
        registerIssueTools(server, context);
        registerSprintTools(server, context);
        registerWorkflowTools(server, context);
        registerStatisticsTools(server, context);
      },
      {},
      {
        basePath: "/api/llm",
      }
    );
    
    // Pass through to MCP handler
    return mcpHandler(authenticatedRequest);
  }
  
  // If auth is disabled, create handler without auth but with projectId
  const mcpHandler = createMcpHandler(
    async (server) => {
      // Pass projectId as context to all tool registrations
      const context = { projectId };
      registerProjectTools(server, context);
      registerIssueTools(server, context);
      registerSprintTools(server, context);
      registerWorkflowTools(server, context);
      registerStatisticsTools(server, context);
    },
    {},
    {
      basePath: "/api/llm",
    }
  );
  
  // Pass through directly
  return mcpHandler(request);
}

export { 
  authenticatedHandler as GET, 
  authenticatedHandler as POST, 
  authenticatedHandler as DELETE 
};