import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { NextRequest, NextResponse } from 'next/server';
import { EventEmitter } from 'events';

/**
 * HTTP Transport for MCP Server
 * Adapts MCP server to work with Next.js API routes
 */
export class HTTPServerTransport extends EventEmitter {
  private server: Server;
  private connected = false;

  constructor(server: Server) {
    super();
    this.server = server;
  }

  async connect(): Promise<void> {
    this.connected = true;
    this.emit('connect');
  }

  async close(): Promise<void> {
    this.connected = false;
    this.emit('close');
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Handle HTTP request for MCP operations
   */
  async handleRequest(request: NextRequest): Promise<NextResponse> {
    try {
      if (!this.connected) {
        return NextResponse.json(
          { error: 'MCP server not connected' },
          { status: 503 }
        );
      }

      const body = await request.json();
      
      // Validate MCP request format
      if (!body.jsonrpc || !body.method || typeof body.id === 'undefined') {
        return NextResponse.json(
          { 
            jsonrpc: '2.0',
            error: { code: -32600, message: 'Invalid Request' },
            id: body.id || null
          },
          { status: 400 }
        );
      }

      // Process the MCP request
      const response = await this.processRequest(body);
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('HTTP Transport Error:', error);
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

  private async processRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Create a mock transport for processing
      const mockTransport = {
        start: () => Promise.resolve(),
        send: (response: any) => {
          resolve(response);
        },
        close: () => Promise.resolve(),
      };

      // Process request through the server
      try {
        // Simulate receiving a message
        this.server.onerror = (error) => {
          reject(error);
        };

        // Handle the request based on method
        this.handleMCPMethod(request)
          .then(resolve)
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async handleMCPMethod(request: any): Promise<any> {
    const { method, params, id } = request;

    try {
      let result;

      switch (method) {
        case 'tools/list':
          // Get tools list from server
          result = await this.getToolsList();
          break;
        
        case 'tools/call':
          // Call a tool
          result = await this.callTool(params);
          break;

        case 'resources/list':
          // List resources
          result = await this.getResourcesList();
          break;

        case 'resources/read':
          // Read a resource
          result = await this.readResource(params);
          break;

        default:
          throw new Error(`Unknown method: ${method}`);
      }

      return {
        jsonrpc: '2.0',
        result,
        id
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        id
      };
    }
  }

  private async getToolsList(): Promise<any> {
    // This would normally come from the server's tool registry
    // For now, return the tools we've defined
    return {
      tools: [
        // Organization Management
        {
          name: 'list_organizations',
          description: 'List all organizations for the authenticated user',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'create_organization',
          description: 'Create a new organization',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Organization name' },
              description: { type: 'string', description: 'Organization description' }
            },
            required: ['name']
          }
        },
        {
          name: 'invite_to_organization',
          description: 'Invite a user to an organization',
          inputSchema: {
            type: 'object',
            properties: {
              organizationId: { type: 'string', description: 'Organization ID' },
              email: { type: 'string', format: 'email', description: 'User email' },
              role: { type: 'string', enum: ['MEMBER', 'ADMIN'], description: 'User role' }
            },
            required: ['organizationId', 'email']
          }
        },
        // Project Management
        {
          name: 'list_projects',
          description: 'List all projects for the authenticated user',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'create_project',
          description: 'Create a new project',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Project name' },
              description: { type: 'string', description: 'Project description' }
            },
            required: ['name']
          }
        },
        // Sprint Management
        {
          name: 'list_sprints',
          description: 'List sprints for a project',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' }
            },
            required: ['projectId']
          }
        },
        {
          name: 'create_sprint',
          description: 'Create a new sprint',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' },
              name: { type: 'string', description: 'Sprint name' },
              startDate: { type: 'string', format: 'date-time', description: 'Start date' },
              endDate: { type: 'string', format: 'date-time', description: 'End date' }
            },
            required: ['projectId', 'name']
          }
        },
        {
          name: 'close_sprint',
          description: 'Close an active sprint',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: { type: 'string', description: 'Sprint ID' }
            },
            required: ['sprintId']
          }
        },
        // Label Management
        {
          name: 'list_labels',
          description: 'List labels for a project',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' }
            },
            required: ['projectId']
          }
        },
        {
          name: 'create_label',
          description: 'Create a new label',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' },
              name: { type: 'string', description: 'Label name' },
              color: { type: 'string', description: 'Label color (hex)' }
            },
            required: ['projectId', 'name']
          }
        },
        {
          name: 'assign_label',
          description: 'Assign a label to an issue',
          inputSchema: {
            type: 'object',
            properties: {
              issueId: { type: 'string', description: 'Issue ID' },
              labelId: { type: 'string', description: 'Label ID' }
            },
            required: ['issueId', 'labelId']
          }
        },
        // Issue Management
        {
          name: 'list_issues',
          description: 'List issues for a project',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' },
              status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'Filter by status' }
            },
            required: ['projectId']
          }
        },
        {
          name: 'create_issue',
          description: 'Create a new issue',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' },
              title: { type: 'string', description: 'Issue title' },
              description: { type: 'string', description: 'Issue description' },
              status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'Issue status' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Issue priority' }
            },
            required: ['projectId', 'title']
          }
        },
        {
          name: 'update_issue',
          description: 'Update an existing issue',
          inputSchema: {
            type: 'object',
            properties: {
              issueId: { type: 'string', description: 'Issue ID' },
              title: { type: 'string', description: 'Issue title' },
              description: { type: 'string', description: 'Issue description' },
              status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'Issue status' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Issue priority' }
            },
            required: ['issueId']
          }
        },
        // Comment Management
        {
          name: 'list_comments',
          description: 'List comments for an issue',
          inputSchema: {
            type: 'object',
            properties: {
              issueId: { type: 'string', description: 'Issue ID' }
            },
            required: ['issueId']
          }
        },
        {
          name: 'create_comment',
          description: 'Create a new comment',
          inputSchema: {
            type: 'object',
            properties: {
              issueId: { type: 'string', description: 'Issue ID' },
              content: { type: 'string', description: 'Comment content' },
              isAiComment: { type: 'boolean', description: 'Whether this is an AI comment' }
            },
            required: ['issueId', 'content']
          }
        },
        // AI Integration
        {
          name: 'get_ai_ready_cards',
          description: 'Get cards that are ready for AI processing',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' }
            },
            required: ['projectId']
          }
        },
        {
          name: 'update_card_status',
          description: 'Update a card status (AI endpoint)',
          inputSchema: {
            type: 'object',
            properties: {
              cardId: { type: 'string', description: 'Card ID' },
              status: { type: 'string', enum: ['BACKLOG', 'READY', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'COMPLETED'], description: 'New status' },
              comment: { type: 'string', description: 'Optional comment' }
            },
            required: ['cardId', 'status']
          }
        },
        {
          name: 'get_next_ready_card',
          description: 'Get the next card ready for AI processing',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Project ID' }
            },
            required: ['projectId']
          }
        }
      ]
    };
  }

  private async callTool(params: any): Promise<any> {
    const { name, arguments: args } = params;
    
    // Import tool handlers dynamically to avoid circular dependencies
    const { MCPToolHandlers } = await import('./tools.js');

    switch (name) {
      // Organization Management
      case 'list_organizations':
        return await MCPToolHandlers.handleListOrganizations();
      case 'create_organization':
        return await MCPToolHandlers.handleCreateOrganization(args);
      case 'invite_to_organization':
        return await MCPToolHandlers.handleInviteToOrganization(args);
      
      // Sprint Management
      case 'list_sprints':
        return await MCPToolHandlers.handleListSprints(args);
      case 'create_sprint':
        return await MCPToolHandlers.handleCreateSprint(args);
      case 'close_sprint':
        return await MCPToolHandlers.handleCloseSprint(args);
      
      // Label Management
      case 'list_labels':
        return await MCPToolHandlers.handleListLabels(args);
      case 'create_label':
        return await MCPToolHandlers.handleCreateLabel(args);
      case 'assign_label':
        return await MCPToolHandlers.handleAssignLabel(args);
      
      // Comment Management
      case 'list_comments':
        return await MCPToolHandlers.handleListComments(args);
      case 'create_comment':
        return await MCPToolHandlers.handleCreateComment(args);
      
      // AI Integration
      case 'get_ai_ready_cards':
        return await MCPToolHandlers.handleGetAiReadyCards(args);
      case 'update_card_status':
        return await MCPToolHandlers.handleUpdateCardStatus(args);
      case 'get_next_ready_card':
        return await MCPToolHandlers.handleGetNextReadyCard(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async getResourcesList(): Promise<any> {
    return {
      resources: [
        {
          uri: 'vibehero://templates/project',
          name: 'Project Template',
          description: 'Default project template with common setup',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://templates/issue',
          name: 'Issue Template',
          description: 'Default issue template with standard fields',
          mimeType: 'application/json'
        },
        {
          uri: 'vibehero://schemas/project',
          name: 'Project Schema',
          description: 'JSON schema for project structure',
          mimeType: 'application/json'
        }
      ]
    };
  }

  private async readResource(params: any): Promise<any> {
    const { uri } = params;

    switch (uri) {
      case 'vibehero://templates/project':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                name: 'New Project',
                description: 'Project description',
                labels: [
                  { name: 'bug', color: '#EF4444' },
                  { name: 'feature', color: '#22C55E' },
                  { name: 'enhancement', color: '#3B82F6' }
                ],
                defaultSprint: {
                  name: 'Sprint 1',
                  duration: '2 weeks'
                }
              }, null, 2)
            }
          ]
        };
      
      case 'vibehero://templates/issue':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                title: 'Issue Title',
                description: '## Description\n\nDescribe the issue here.\n\n## Acceptance Criteria\n\n- [ ] Criterion 1\n- [ ] Criterion 2',
                priority: 'medium',
                status: 'todo'
              }, null, 2)
            }
          ]
        };
      
      case 'vibehero://schemas/project':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1 },
                  description: { type: 'string' },
                  ownerId: { type: 'string' },
                  organizationId: { type: 'string' }
                },
                required: ['name', 'ownerId'],
                additionalProperties: false
              }, null, 2)
            }
          ]
        };
      
      default:
        throw new Error(`Resource not found: ${uri}`);
    }
  }
}

/**
 * WebSocket Transport for MCP Server
 * Enables real-time communication and notifications
 */
export class WebSocketServerTransport extends EventEmitter {
  private server: Server;
  private wsConnections: Set<WebSocket> = new Set();
  private connected = false;

  constructor(server: Server) {
    super();
    this.server = server;
  }

  async connect(): Promise<void> {
    this.connected = true;
    this.emit('connect');
  }

  async close(): Promise<void> {
    this.connected = false;
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();
    this.emit('close');
  }

  isConnected(): boolean {
    return this.connected;
  }

  addConnection(ws: WebSocket): void {
    this.wsConnections.add(ws);
    
    ws.addEventListener('close', () => {
      this.wsConnections.delete(ws);
    });

    ws.addEventListener('message', async (event) => {
      try {
        const request = JSON.parse(event.data as string);
        const response = await this.processWebSocketRequest(request);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(response));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32603, message: 'Internal error' },
            id: null
          }));
        }
      }
    });
  }

  private async processWebSocketRequest(request: any): Promise<any> {
    // Similar to HTTP transport but for WebSocket
    const httpTransport = new HTTPServerTransport(this.server);
    await httpTransport.connect();
    
    // Create a mock NextRequest for compatibility
    const mockRequest = {
      json: () => Promise.resolve(request)
    } as NextRequest;
    
    const response = await httpTransport.handleRequest(mockRequest);
    return await response.json();
  }

  /**
   * Broadcast notification to all connected clients
   */
  broadcast(notification: any): void {
    const message = JSON.stringify({
      jsonrpc: '2.0',
      method: 'notification',
      params: notification
    });

    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Send notification to specific client
   */
  sendToClient(ws: WebSocket, notification: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'notification',
        params: notification
      }));
    }
  }
}