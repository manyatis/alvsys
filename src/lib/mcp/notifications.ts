import { EventEmitter } from 'events';
import { PrismaClient } from '@/generated/prisma';
import { WebSocketServerTransport } from './transports.js';

const prisma = new PrismaClient();

/**
 * Event types for MCP notifications
 */
export enum MCPEventType {
  // Project Events
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_DELETED = 'project.deleted',
  
  // Issue Events
  ISSUE_CREATED = 'issue.created',
  ISSUE_UPDATED = 'issue.updated',
  ISSUE_STATUS_CHANGED = 'issue.status_changed',
  ISSUE_ASSIGNED = 'issue.assigned',
  ISSUE_DELETED = 'issue.deleted',
  
  // Comment Events
  COMMENT_CREATED = 'comment.created',
  COMMENT_UPDATED = 'comment.updated',
  COMMENT_DELETED = 'comment.deleted',
  
  // Sprint Events
  SPRINT_CREATED = 'sprint.created',
  SPRINT_STARTED = 'sprint.started',
  SPRINT_CLOSED = 'sprint.closed',
  
  // Label Events
  LABEL_CREATED = 'label.created',
  LABEL_ASSIGNED = 'label.assigned',
  LABEL_REMOVED = 'label.removed',
  
  // Organization Events
  ORGANIZATION_CREATED = 'organization.created',
  MEMBER_INVITED = 'organization.member_invited',
  MEMBER_JOINED = 'organization.member_joined',
  
  // AI Events
  AI_TASK_STARTED = 'ai.task_started',
  AI_TASK_COMPLETED = 'ai.task_completed',
  AI_TASK_FAILED = 'ai.task_failed',
  
  // System Events
  USER_CONNECTED = 'user.connected',
  USER_DISCONNECTED = 'user.disconnected',
  RATE_LIMIT_EXCEEDED = 'system.rate_limit_exceeded'
}

export interface MCPEvent {
  id: string;
  type: MCPEventType;
  userId: string;
  projectId?: string;
  organizationId?: string;
  data: any;
  timestamp: Date;
  metadata?: {
    source: string;
    version: string;
    correlationId?: string;
  };
}

/**
 * MCP Event Bus for handling notifications and real-time events
 */
export class MCPEventBus extends EventEmitter {
  private static instance: MCPEventBus;
  private wsTransport: WebSocketServerTransport | null = null;
  private eventHistory: MCPEvent[] = [];
  private readonly maxHistorySize = 1000;

  private constructor() {
    super();
    this.setupEventLogging();
  }

  public static getInstance(): MCPEventBus {
    if (!MCPEventBus.instance) {
      MCPEventBus.instance = new MCPEventBus();
    }
    return MCPEventBus.instance;
  }

  /**
   * Set WebSocket transport for real-time notifications
   */
  public setWebSocketTransport(transport: WebSocketServerTransport): void {
    this.wsTransport = transport;
  }

  /**
   * Emit an MCP event
   */
  public async emitEvent(
    type: MCPEventType,
    userId: string,
    data: any,
    options: {
      projectId?: string;
      organizationId?: string;
      correlationId?: string;
    } = {}
  ): Promise<void> {
    const event: MCPEvent = {
      id: this.generateEventId(),
      type,
      userId,
      projectId: options.projectId,
      organizationId: options.organizationId,
      data,
      timestamp: new Date(),
      metadata: {
        source: 'vibehero-mcp-server',
        version: '1.0.0',
        correlationId: options.correlationId
      }
    };

    // Add to history
    this.addToHistory(event);

    // Emit to local listeners
    this.emit(type, event);
    this.emit('*', event);

    // Send WebSocket notification if transport is available
    if (this.wsTransport) {
      await this.sendWebSocketNotification(event);
    }

    // Store in database for persistence (optional)
    await this.persistEvent(event);

    console.log(`[MCP Event] ${type}:`, {
      userId,
      projectId: options.projectId,
      timestamp: event.timestamp
    });
  }

  /**
   * Subscribe to specific event types
   */
  public subscribe(
    eventType: MCPEventType | '*',
    handler: (event: MCPEvent) => void
  ): void {
    this.on(eventType, handler);
  }

  /**
   * Unsubscribe from event types
   */
  public unsubscribe(
    eventType: MCPEventType | '*',
    handler: (event: MCPEvent) => void
  ): void {
    this.removeListener(eventType, handler);
  }

  /**
   * Get recent events for a user
   */
  public getRecentEvents(
    userId: string,
    limit: number = 50,
    filter?: {
      types?: MCPEventType[];
      projectId?: string;
      since?: Date;
    }
  ): MCPEvent[] {
    let events = this.eventHistory.filter(event => event.userId === userId);

    if (filter) {
      if (filter.types) {
        events = events.filter(event => filter.types!.includes(event.type));
      }
      if (filter.projectId) {
        events = events.filter(event => event.projectId === filter.projectId);
      }
      if (filter.since) {
        events = events.filter(event => event.timestamp >= filter.since!);
      }
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get events for a project
   */
  public getProjectEvents(
    projectId: string,
    limit: number = 50,
    filter?: {
      types?: MCPEventType[];
      since?: Date;
    }
  ): MCPEvent[] {
    let events = this.eventHistory.filter(event => event.projectId === projectId);

    if (filter) {
      if (filter.types) {
        events = events.filter(event => filter.types!.includes(event.type));
      }
      if (filter.since) {
        events = events.filter(event => event.timestamp >= filter.since!);
      }
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private addToHistory(event: MCPEvent): void {
    this.eventHistory.push(event);
    
    // Trim history if it gets too large
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private async sendWebSocketNotification(event: MCPEvent): Promise<void> {
    if (!this.wsTransport) return;

    try {
      // Determine who should receive this notification
      const recipients = await this.getEventRecipients(event);
      
      for (const userId of recipients) {
        // In a real implementation, you'd track WebSocket connections by user
        // For now, broadcast to all connections
        this.wsTransport.broadcast({
          type: 'event',
          event: {
            id: event.id,
            type: event.type,
            data: event.data,
            timestamp: event.timestamp,
            projectId: event.projectId,
            organizationId: event.organizationId
          }
        });
      }
    } catch (error) {
      console.error('Failed to send WebSocket notification:', error);
    }
  }

  private async getEventRecipients(event: MCPEvent): Promise<string[]> {
    const recipients = new Set<string>();
    
    // Always include the event creator
    recipients.add(event.userId);

    // Add project members if it's a project-related event
    if (event.projectId) {
      try {
        const project = await prisma.project.findUnique({
          where: { id: event.projectId },
          include: {
            users: {
              select: { userId: true }
            }
          }
        });

        if (project) {
          // Add project owner
          recipients.add(project.ownerId);
          
          // Add project members
          project.users.forEach(user => recipients.add(user.userId));
        }
      } catch (error) {
        console.error('Failed to get project members for notification:', error);
      }
    }

    // Add organization members if it's an organization-related event
    if (event.organizationId) {
      try {
        const members = await prisma.organizationMember.findMany({
          where: { organizationId: event.organizationId },
          select: { userId: true }
        });

        members.forEach(member => recipients.add(member.userId));
      } catch (error) {
        console.error('Failed to get organization members for notification:', error);
      }
    }

    return Array.from(recipients);
  }

  private async persistEvent(event: MCPEvent): Promise<void> {
    // Optionally store events in database for audit trail
    // This is useful for debugging, analytics, and compliance
    try {
      // You could create an Event table in your database
      // await prisma.event.create({
      //   data: {
      //     id: event.id,
      //     type: event.type,
      //     userId: event.userId,
      //     projectId: event.projectId,
      //     organizationId: event.organizationId,
      //     data: JSON.stringify(event.data),
      //     timestamp: event.timestamp,
      //     metadata: JSON.stringify(event.metadata)
      //   }
      // });
    } catch (error) {
      console.error('Failed to persist event:', error);
    }
  }

  private setupEventLogging(): void {
    // Log all events for debugging
    this.on('*', (event: MCPEvent) => {
      console.log(`[Event Log] ${event.type}`, {
        eventId: event.id,
        userId: event.userId,
        projectId: event.projectId,
        timestamp: event.timestamp
      });
    });

    // Set up event-specific handlers
    this.setupProjectEventHandlers();
    this.setupIssueEventHandlers();
    this.setupAIEventHandlers();
  }

  private setupProjectEventHandlers(): void {
    this.on(MCPEventType.PROJECT_CREATED, async (event: MCPEvent) => {
      // You could trigger additional actions here
      // e.g., send welcome email, create default issues, etc.
    });
  }

  private setupIssueEventHandlers(): void {
    this.on(MCPEventType.ISSUE_STATUS_CHANGED, async (event: MCPEvent) => {
      // You could trigger automations based on status changes
      // e.g., notify assignee, update metrics, etc.
    });
  }

  private setupAIEventHandlers(): void {
    this.on(MCPEventType.AI_TASK_COMPLETED, async (event: MCPEvent) => {
      // You could trigger follow-up actions
      // e.g., run tests, deploy, notify stakeholders, etc.
    });
  }
}

/**
 * Convenience functions for emitting common events
 */
export class MCPEventEmitter {
  private static eventBus = MCPEventBus.getInstance();

  static async projectCreated(userId: string, projectId: string, projectData: any): Promise<void> {
    await this.eventBus.emitEvent(MCPEventType.PROJECT_CREATED, userId, projectData, { projectId });
  }

  static async issueCreated(userId: string, projectId: string, issueData: any): Promise<void> {
    await this.eventBus.emitEvent(MCPEventType.ISSUE_CREATED, userId, issueData, { projectId });
  }

  static async issueStatusChanged(
    userId: string,
    projectId: string,
    issueId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.eventBus.emitEvent(
      MCPEventType.ISSUE_STATUS_CHANGED,
      userId,
      { issueId, oldStatus, newStatus },
      { projectId }
    );
  }

  static async aiTaskCompleted(
    userId: string,
    projectId: string,
    cardId: string,
    result: any
  ): Promise<void> {
    await this.eventBus.emitEvent(
      MCPEventType.AI_TASK_COMPLETED,
      userId,
      { cardId, result },
      { projectId }
    );
  }

  static async commentCreated(
    userId: string,
    projectId: string,
    issueId: string,
    commentData: any
  ): Promise<void> {
    await this.eventBus.emitEvent(
      MCPEventType.COMMENT_CREATED,
      userId,
      { issueId, ...commentData },
      { projectId }
    );
  }

  static async sprintCreated(userId: string, projectId: string, sprintData: any): Promise<void> {
    await this.eventBus.emitEvent(MCPEventType.SPRINT_CREATED, userId, sprintData, { projectId });
  }

  static async organizationCreated(userId: string, organizationId: string, orgData: any): Promise<void> {
    await this.eventBus.emitEvent(
      MCPEventType.ORGANIZATION_CREATED,
      userId,
      orgData,
      { organizationId }
    );
  }

  static async rateLimitExceeded(userId: string, toolName: string, limit: number): Promise<void> {
    await this.eventBus.emitEvent(
      MCPEventType.RATE_LIMIT_EXCEEDED,
      userId,
      { toolName, limit, timestamp: new Date() }
    );
  }
}

// Export singleton instance
export const mcpEventBus = MCPEventBus.getInstance();