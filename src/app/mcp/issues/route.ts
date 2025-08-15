import { NextRequest, NextResponse } from 'next/server';
import { getMCPAuth } from '@/lib/mcp/auth';
import { MCPToolHandlers } from '@/lib/mcp/tools';

// GET /mcp/issues - List issues for a project
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = getMCPAuth();
    
    try {
      await auth.authenticateWithSession();
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      );
    }

    // Use MCP tool handlers
    const result = await MCPToolHandlers.handleListIssues({
      projectId,
      ...(status && { status })
    });
    
    // Parse and return the result  
    const issues = JSON.parse(result.content[0].text);
    
    return NextResponse.json(issues);
  } catch (error) {
    console.error('MCP Issues GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /mcp/issues - Create new issue
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = getMCPAuth();
    
    try {
      await auth.authenticateWithSession();
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      projectId, 
      title, 
      description, 
      status = 'todo', 
      priority = 'medium' 
    } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'projectId and title are required' },
        { status: 400 }
      );
    }

    // Create issue using MCP
    const result = await MCPToolHandlers.handleCreateIssue({
      projectId,
      title,
      description,
      status,
      priority
    });
    
    const issue = JSON.parse(result.content[0].text);
    
    return NextResponse.json(issue);
  } catch (error) {
    console.error('MCP Issues POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}