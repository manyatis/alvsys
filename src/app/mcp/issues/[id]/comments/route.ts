import { NextRequest, NextResponse } from 'next/server';
import { getMCPAuth } from '@/lib/mcp/auth';
import { MCPToolHandlers } from '@/lib/mcp/tools';

// GET /mcp/issues/[id]/comments - List comments for issue
export async function GET(
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

    // Get comments using MCP
    const result = await MCPToolHandlers.handleListComments({ issueId });
    
    const comments = JSON.parse(result.content[0].text);
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('MCP Comments GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /mcp/issues/[id]/comments - Create new comment
export async function POST(
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
    const { content, isAiComment = false } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create comment using MCP
    const result = await MCPToolHandlers.handleCreateComment({
      issueId,
      content: content.trim(),
      isAiComment
    });
    
    const comment = JSON.parse(result.content[0].text);
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('MCP Comments POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}