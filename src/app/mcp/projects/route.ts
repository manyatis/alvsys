import { NextRequest, NextResponse } from 'next/server';
import { getMCPAuth } from '@/lib/mcp/auth';
import { MCPToolHandlers } from '@/lib/mcp/tools';
import { MCPEventEmitter } from '@/lib/mcp/notifications';

// GET /mcp/projects - List projects
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

    // Use MCP tool handlers directly
    const result = await MCPToolHandlers.handleListProjects();
    
    // Parse and return the result  
    const projects = JSON.parse(result.content[0].text);
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('MCP Projects GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /mcp/projects - Create project
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
    const { projectName, organizationName, organizationId } = body;

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    let orgId = organizationId;

    // Create organization if needed
    if (!organizationId && organizationName) {
      const orgResult = await MCPToolHandlers.handleCreateOrganization({
        name: organizationName
      });
      const organization = JSON.parse(orgResult.content[0].text);
      orgId = organization.id;
    }

    // Create project
    const projectResult = await MCPToolHandlers.handleCreateProject({
      name: projectName,
      organizationId: orgId
    });
    
    const project = JSON.parse(projectResult.content[0].text);
    
    return NextResponse.json({ 
      project,
      message: 'Project created successfully' 
    });
  } catch (error) {
    console.error('MCP Projects POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}