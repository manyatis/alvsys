/**
 * VibeHero MCP Client
 * Wrapper service for communicating with the MCP server
 */

import { getSession } from 'next-auth/react';

export interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: number | string;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export class MCPClientError extends Error {
  public code: number;
  public data?: any;

  constructor(error: MCPError) {
    super(error.message);
    this.name = 'MCPClientError';
    this.code = error.code;
    this.data = error.data;
  }
}

export class VibeHeroMCPClient {
  private baseUrl: string;
  private requestId = 1;

  constructor(baseUrl: string = '/mcp') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a raw MCP request
   */
  private async makeRequest(method: string, params?: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++
    };

    try {
      // Get session for authentication
      const session = await getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization if we have a session
      if (session?.user?.email) {
        // For session-based auth, the server will handle this automatically
        // If you have API keys in session, you could add them here
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for session auth
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const mcpResponse: MCPResponse = await response.json();

      if (mcpResponse.error) {
        throw new MCPClientError(mcpResponse.error);
      }

      return mcpResponse.result;
    } catch (error) {
      if (error instanceof MCPClientError) {
        throw error;
      }
      
      // Wrap other errors
      throw new MCPClientError({
        code: -32603,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any> {
    return this.makeRequest('tools/list');
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: any = {}): Promise<any> {
    return this.makeRequest('tools/call', { name, arguments: args });
  }

  /**
   * List available resources
   */
  async listResources(): Promise<any> {
    return this.makeRequest('resources/list');
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<any> {
    return this.makeRequest('resources/read', { uri });
  }

  // === PROJECT MANAGEMENT ===

  /**
   * List projects for the authenticated user
   */
  async listProjects(): Promise<any[]> {
    const response = await fetch('/mcp/projects', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new MCPClientError({
        code: response.status,
        message: error.error || 'Failed to list projects'
      });
    }
    
    const data = await response.json();
    return data.projects || data;
  }

  /**
   * Create a new project
   */
  async createProject(name: string, description?: string, organizationId?: string): Promise<any> {
    const response = await fetch('/mcp/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        projectName: name,
        description,
        organizationId
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new MCPClientError({
        code: response.status,
        message: error.error || 'Failed to create project'
      });
    }
    
    const data = await response.json();
    return data.project;
  }

  // === ORGANIZATION MANAGEMENT ===

  /**
   * List user's organizations
   */
  async listOrganizations(): Promise<any[]> {
    const result = await this.callTool('list_organizations');
    return JSON.parse(result.content[0].text);
  }

  /**
   * Create a new organization
   */
  async createOrganization(name: string, description?: string): Promise<any> {
    const result = await this.callTool('create_organization', { name, description });
    return JSON.parse(result.content[0].text);
  }

  /**
   * Invite user to organization
   */
  async inviteToOrganization(organizationId: string, email: string, role: 'MEMBER' | 'ADMIN' = 'MEMBER'): Promise<any> {
    const result = await this.callTool('invite_to_organization', { organizationId, email, role });
    return JSON.parse(result.content[0].text);
  }

  // === ISSUE MANAGEMENT ===

  /**
   * List issues for a project
   */
  async listIssues(projectId: string, status?: 'todo' | 'in_progress' | 'done'): Promise<any[]> {
    const url = new URL('/mcp/issues', window.location.origin);
    url.searchParams.set('projectId', projectId);
    if (status) url.searchParams.set('status', status);
    
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new MCPClientError({
        code: response.status,
        message: error.error || 'Failed to list issues'
      });
    }
    
    return await response.json();
  }

  /**
   * Create a new issue
   */
  async createIssue(params: {
    projectId: string;
    title: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
  }): Promise<any> {
    const response = await fetch('/mcp/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new MCPClientError({
        code: response.status,
        message: error.error || 'Failed to create issue'
      });
    }
    
    return await response.json();
  }

  /**
   * Update an existing issue
   */
  async updateIssue(issueId: string, updates: {
    title?: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
  }): Promise<any> {
    const response = await fetch(`/mcp/issues/${issueId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new MCPClientError({
        code: response.status,
        message: error.error || 'Failed to update issue'
      });
    }
    
    return await response.json();
  }

  // === SPRINT MANAGEMENT ===

  /**
   * List sprints for a project
   */
  async listSprints(projectId: string): Promise<any[]> {
    const result = await this.callTool('list_sprints', { projectId });
    return JSON.parse(result.content[0].text);
  }

  /**
   * Create a new sprint
   */
  async createSprint(params: {
    projectId: string;
    name: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const result = await this.callTool('create_sprint', params);
    return JSON.parse(result.content[0].text);
  }

  /**
   * Close a sprint
   */
  async closeSprint(sprintId: string): Promise<any> {
    const result = await this.callTool('close_sprint', { sprintId });
    return JSON.parse(result.content[0].text);
  }

  // === LABEL MANAGEMENT ===

  /**
   * List labels for a project
   */
  async listLabels(projectId: string): Promise<any[]> {
    const result = await this.callTool('list_labels', { projectId });
    return JSON.parse(result.content[0].text);
  }

  /**
   * Create a new label
   */
  async createLabel(projectId: string, name: string, color?: string): Promise<any> {
    const result = await this.callTool('create_label', { projectId, name, color });
    return JSON.parse(result.content[0].text);
  }

  /**
   * Assign a label to an issue
   */
  async assignLabel(issueId: string, labelId: string): Promise<any> {
    const result = await this.callTool('assign_label', { issueId, labelId });
    return JSON.parse(result.content[0].text);
  }

  // === COMMENT MANAGEMENT ===

  /**
   * List comments for an issue
   */
  async listComments(issueId: string): Promise<any[]> {
    const response = await fetch(`/mcp/issues/${issueId}/comments`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new MCPClientError({
        code: response.status,
        message: error.error || 'Failed to list comments'
      });
    }
    
    return await response.json();
  }

  /**
   * Create a new comment
   */
  async createComment(issueId: string, content: string, isAiComment: boolean = false): Promise<any> {
    const response = await fetch(`/mcp/issues/${issueId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content, isAiComment }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new MCPClientError({
        code: response.status,
        message: error.error || 'Failed to create comment'
      });
    }
    
    return await response.json();
  }

  // === AI INTEGRATION ===

  /**
   * Get AI-ready cards for a project
   */
  async getAiReadyCards(projectId: string): Promise<any[]> {
    const result = await this.callTool('get_ai_ready_cards', { projectId });
    return JSON.parse(result.content[0].text);
  }

  /**
   * Update card status (AI endpoint)
   */
  async updateCardStatus(cardId: string, status: string, comment?: string): Promise<any> {
    const result = await this.callTool('update_card_status', { cardId, status, comment });
    return JSON.parse(result.content[0].text);
  }

  /**
   * Get next ready card for AI processing
   */
  async getNextReadyCard(projectId: string): Promise<any> {
    const result = await this.callTool('get_next_ready_card', { projectId });
    return JSON.parse(result.content[0].text);
  }

  // === RESOURCES ===

  /**
   * Get project template
   */
  async getProjectTemplate(type: 'basic' | 'agile' | 'kanban' = 'basic'): Promise<any> {
    const result = await this.readResource(`vibehero://templates/project/${type}`);
    return JSON.parse(result.contents[0].text);
  }

  /**
   * Get issue template
   */
  async getIssueTemplate(type: 'bug' | 'feature' | 'task' = 'task'): Promise<any> {
    const result = await this.readResource(`vibehero://templates/issue/${type}`);
    return JSON.parse(result.contents[0].text);
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<any> {
    const result = await this.readResource('vibehero://data/user/profile');
    return JSON.parse(result.contents[0].text);
  }

  /**
   * Get user projects summary
   */
  async getUserProjectsSummary(): Promise<any> {
    const result = await this.readResource('vibehero://data/user/projects');
    return JSON.parse(result.contents[0].text);
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<any> {
    const result = await this.readResource('vibehero://data/user/usage');
    return JSON.parse(result.contents[0].text);
  }
}

// Create a singleton instance
export const mcpClient = new VibeHeroMCPClient();

// Export convenience functions
export const {
  listProjects,
  createProject,
  listOrganizations,
  createOrganization,
  inviteToOrganization,
  listIssues,
  createIssue,
  updateIssue,
  listSprints,
  createSprint,
  closeSprint,
  listLabels,
  createLabel,
  assignLabel,
  listComments,
  createComment,
  getAiReadyCards,
  updateCardStatus,
  getNextReadyCard,
  getProjectTemplate,
  getIssueTemplate,
  getUserProfile,
  getUserProjectsSummary,
  getUsageStats
} = mcpClient;