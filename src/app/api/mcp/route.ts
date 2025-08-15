import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { HTTPServerTransport } from '@/lib/mcp/transports';
import { getMCPAuth } from '@/lib/mcp/auth';

// Global MCP server instance
let mcpServer: Server | null = null;
let httpTransport: HTTPServerTransport | null = null;

function initializeMCPServer() {
  if (!mcpServer) {
    mcpServer = new Server(
      {
        name: 'vibehero-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    httpTransport = new HTTPServerTransport(mcpServer);
  }
  
  return { mcpServer, httpTransport };
}

// POST /api/mcp - Handle MCP requests via HTTP
export async function POST(request: NextRequest) {
  try {
    // Initialize MCP server if needed
    const { httpTransport } = initializeMCPServer();
    
    if (!httpTransport) {
      return NextResponse.json(
        { error: 'MCP server not initialized' },
        { status: 503 }
      );
    }

    // Authenticate the request
    const authHeader = request.headers.get('authorization');
    const auth = getMCPAuth();
    
    try {
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await auth.authenticateWithToken(token);
      } else {
        // Fall back to session auth
        await auth.authenticateWithSession();
      }
    } catch (authError) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: { 
            code: -32001, 
            message: 'Authentication required',
            data: authError instanceof Error ? authError.message : 'Unknown auth error'
          },
          id: null
        },
        { status: 401 }
      );
    }

    // Ensure transport is connected
    if (!httpTransport.isConnected()) {
      await httpTransport.connect();
    }

    // Handle the MCP request
    return await httpTransport.handleRequest(request);
  } catch (error) {
    console.error('MCP API Error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: { 
          code: -32603, 
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        },
        id: null
      },
      { status: 500 }
    );
  }
}

// GET /api/mcp - Return server info and capabilities
export async function GET() {
  try {
    const { mcpServer } = initializeMCPServer();
    
    return NextResponse.json({
      name: 'vibehero-mcp-server',
      version: '1.0.0',
      description: 'VibeHero MCP Server for project and issue management',
      capabilities: {
        tools: true,
        resources: true,
        notifications: true
      },
      transports: ['http', 'websocket', 'stdio'],
      endpoints: {
        http: '/api/mcp',
        websocket: '/api/mcp/ws'
      },
      authentication: ['bearer-token', 'session'],
      documentation: 'https://github.com/your-org/vibehero#mcp-server'
    });
  } catch (error) {
    console.error('MCP Info Error:', error);
    return NextResponse.json(
      { error: 'Failed to get server info' },
      { status: 500 }
    );
  }
}