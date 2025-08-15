import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Enhanced validation and error handling for MCP server
 */

// Common validation schemas
export const schemas = {
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
  status: z.enum(['todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Status must be one of: todo, in_progress, done' })
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be one of: low, medium, high' })
  }),
  cardStatus: z.enum(['BACKLOG', 'READY', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'COMPLETED'], {
    errorMap: () => ({ message: 'Card status must be one of: BACKLOG, READY, IN_PROGRESS, READY_FOR_REVIEW, COMPLETED' })
  }),
  role: z.enum(['MEMBER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be one of: MEMBER, ADMIN' })
  }),
  date: z.string().datetime('Invalid date format - use ISO 8601').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
};

// Tool argument validation schemas
export const toolSchemas = {
  listOrganizations: z.object({}),
  
  createOrganization: z.object({
    name: schemas.name,
    description: schemas.description,
  }),
  
  inviteToOrganization: z.object({
    organizationId: schemas.id,
    email: schemas.email,
    role: schemas.role.default('MEMBER'),
  }),
  
  listProjects: z.object({}),
  
  createProject: z.object({
    name: schemas.name,
    description: schemas.description,
  }),
  
  listSprints: z.object({
    projectId: schemas.id,
  }),
  
  createSprint: z.object({
    projectId: schemas.id,
    name: schemas.name,
    startDate: schemas.date,
    endDate: schemas.date,
  }),
  
  closeSprint: z.object({
    sprintId: schemas.id,
  }),
  
  listLabels: z.object({
    projectId: schemas.id,
  }),
  
  createLabel: z.object({
    projectId: schemas.id,
    name: schemas.name,
    color: schemas.color,
  }),
  
  assignLabel: z.object({
    issueId: schemas.id,
    labelId: schemas.id,
  }),
  
  listIssues: z.object({
    projectId: schemas.id,
    status: schemas.status.optional(),
  }),
  
  createIssue: z.object({
    projectId: schemas.id,
    title: schemas.name,
    description: schemas.description,
    status: schemas.status.default('todo'),
    priority: schemas.priority.default('medium'),
  }),
  
  updateIssue: z.object({
    issueId: schemas.id,
    title: schemas.name.optional(),
    description: schemas.description,
    status: schemas.status.optional(),
    priority: schemas.priority.optional(),
  }).refine(data => Object.keys(data).length > 1, {
    message: 'At least one field besides issueId must be provided'
  }),
  
  listComments: z.object({
    issueId: schemas.id,
  }),
  
  createComment: z.object({
    issueId: schemas.id,
    content: schemas.content,
    isAiComment: z.boolean().default(false),
  }),
  
  getAiReadyCards: z.object({
    projectId: schemas.id,
  }),
  
  updateCardStatus: z.object({
    cardId: schemas.id,
    status: schemas.cardStatus,
    comment: schemas.content.optional(),
  }),
  
  getNextReadyCard: z.object({
    projectId: schemas.id,
  }),
};

/**
 * Validate tool arguments using appropriate schema
 */
export function validateToolArgs(toolName: string, args: any): any {
  const schema = toolSchemas[toolName as keyof typeof toolSchemas];
  
  if (!schema) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Unknown tool: ${toolName}`
    );
  }
  
  try {
    return schema.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      
      throw new McpError(
        ErrorCode.InvalidParams,
        `Validation failed: ${issues.map(i => `${i.path}: ${i.message}`).join(', ')}`,
        { issues }
      );
    }
    throw error;
  }
}

/**
 * Enhanced error handling wrapper
 */
export function handleMCPError(error: unknown): McpError {
  if (error instanceof McpError) {
    return error;
  }
  
  if (error instanceof z.ZodError) {
    const issues = error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }));
    
    return new McpError(
      ErrorCode.InvalidParams,
      `Validation failed: ${issues.map(i => `${i.path}: ${i.message}`).join(', ')}`,
      { issues }
    );
  }
  
  if (error instanceof Error) {
    // Handle specific database errors
    if (error.message.includes('Unique constraint')) {
      return new McpError(
        ErrorCode.InvalidParams,
        'Resource already exists with those parameters'
      );
    }
    
    if (error.message.includes('Foreign key constraint')) {
      return new McpError(
        ErrorCode.InvalidParams,
        'Referenced resource does not exist'
      );
    }
    
    if (error.message.includes('Not found')) {
      return new McpError(
        ErrorCode.InvalidParams,
        'Requested resource not found'
      );
    }
    
    // Generic error
    return new McpError(
      ErrorCode.InternalError,
      `Internal error: ${error.message}`
    );
  }
  
  // Unknown error type
  return new McpError(
    ErrorCode.InternalError,
    'Unknown internal error occurred'
  );
}

/**
 * Rate limiting for MCP tools
 */
export class MCPRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  
  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }
  
  checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true; // Request allowed
  }
  
  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
  
  getResetTime(userId: string): number {
    const userRequests = this.requests.get(userId) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

/**
 * Request logging for debugging and monitoring
 */
export class MCPRequestLogger {
  private logs: Array<{
    timestamp: number;
    userId: string;
    toolName: string;
    args: any;
    success: boolean;
    error?: string;
    duration: number;
  }> = [];
  
  private readonly maxLogs = 1000;
  
  logRequest(
    userId: string,
    toolName: string,
    args: any,
    success: boolean,
    duration: number,
    error?: string
  ): void {
    this.logs.push({
      timestamp: Date.now(),
      userId,
      toolName,
      args: this.sanitizeArgs(args),
      success,
      error,
      duration
    });
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
  
  private sanitizeArgs(args: any): any {
    // Remove sensitive information from logs
    const sanitized = { ...args };
    
    // Remove potential sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  getRecentLogs(limit: number = 50): typeof this.logs {
    return this.logs.slice(-limit);
  }
  
  getLogsByUser(userId: string, limit: number = 50): typeof this.logs {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }
  
  getErrorRate(windowMs: number = 300000): number { // 5 minutes default
    const now = Date.now();
    const recentLogs = this.logs.filter(
      log => now - log.timestamp < windowMs
    );
    
    if (recentLogs.length === 0) return 0;
    
    const errorCount = recentLogs.filter(log => !log.success).length;
    return errorCount / recentLogs.length;
  }
}

// Global instances
export const rateLimiter = new MCPRateLimiter();
export const requestLogger = new MCPRequestLogger();