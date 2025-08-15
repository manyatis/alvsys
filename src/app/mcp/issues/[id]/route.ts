import { NextRequest, NextResponse } from 'next/server';
import { getMCPAuth } from '@/lib/mcp/auth';
import { MCPToolHandlers } from '@/lib/mcp/tools';

// PUT /mcp/issues/[id] - Update issue
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: issueId } = await params;
    const body = await request.json();
    const { title, description, status, priority } = body;

    // Update issue using MCP
    const result = await MCPToolHandlers.handleUpdateIssue({
      issueId,
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(priority && { priority })
    });
    
    const issue = JSON.parse(result.content[0].text);
    
    return NextResponse.json(issue);
  } catch (error) {
    console.error('MCP Issues PUT Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /mcp/issues/[id] - Delete issue (future implementation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getMCPAuth();
    
    try {
      await auth.authenticateWithSession();
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: issueId } = await params;

    // TODO: Implement delete issue handler in MCPToolHandlers
    // For now, return not implemented
    return NextResponse.json(
      { error: 'Delete operation not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('MCP Issues DELETE Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}