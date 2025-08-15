/**
 * VibeHero MCP WebSocket Client
 * Real-time notifications and events
 */

import { EventEmitter } from 'events';
import React from 'react';

export interface MCPNotification {
  type: 'event';
  event: {
    id: string;
    type: string;
    data: any;
    timestamp: string;
    projectId?: string;
    organizationId?: string;
  };
}

export interface MCPWebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export class MCPWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private debug: boolean;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(options: MCPWebSocketOptions = {}) {
    super();
    
    this.url = options.url || this.getWebSocketUrl();
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.debug = options.debug || false;
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      return ''; // Server-side
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/mcp/ws`;
  }

  private log(message: string, ...args: any[]): void {
    if (this.debug) {
      console.log(`[MCP WebSocket] ${message}`, ...args);
    }
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.log('Connecting to', this.url);

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
      // Wait for connection to be established
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          this.handleOpen();
          resolve();
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });
    } catch (error) {
      this.isConnecting = false;
      this.log('Connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.log('Disconnecting...');
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message to the server
   */
  send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private handleOpen(): void {
    this.log('Connected successfully');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.emit('connected');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.log('Received message:', data);
      
      if (data.method === 'notification') {
        this.handleNotification(data.params as MCPNotification);
      } else {
        this.emit('message', data);
      }
    } catch (error) {
      this.log('Failed to parse message:', error, event.data);
    }
  }

  private handleNotification(notification: MCPNotification): void {
    this.log('Received notification:', notification);
    
    // Emit the general notification event
    this.emit('notification', notification);
    
    // Emit specific event type
    if (notification.type === 'event') {
      this.emit('event', notification.event);
      this.emit(`event:${notification.event.type}`, notification.event);
      
      // Emit project-specific events
      if (notification.event.projectId) {
        this.emit(`project:${notification.event.projectId}`, notification.event);
      }
      
      // Emit organization-specific events
      if (notification.event.organizationId) {
        this.emit(`organization:${notification.event.organizationId}`, notification.event);
      }
    }
  }

  private handleClose(event: CloseEvent): void {
    this.log('Connection closed:', event.code, event.reason);
    this.ws = null;
    this.isConnecting = false;
    this.emit('disconnected', event);
    
    // Attempt to reconnect if it wasn't a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    this.log('WebSocket error:', error);
    this.emit('error', error);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        this.log('Reconnect failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          this.log('Max reconnect attempts reached');
          this.emit('reconnect-failed');
        }
      });
    }, delay);
  }

  // === EVENT SUBSCRIPTION HELPERS ===

  /**
   * Subscribe to all events
   */
  onEvent(handler: (event: any) => void): void {
    this.on('event', handler);
  }

  /**
   * Subscribe to specific event types
   */
  onEventType(eventType: string, handler: (event: any) => void): void {
    this.on(`event:${eventType}`, handler);
  }

  /**
   * Subscribe to project events
   */
  onProjectEvent(projectId: string, handler: (event: any) => void): void {
    this.on(`project:${projectId}`, handler);
  }

  /**
   * Subscribe to organization events
   */
  onOrganizationEvent(organizationId: string, handler: (event: any) => void): void {
    this.on(`organization:${organizationId}`, handler);
  }

  /**
   * Subscribe to specific project event types
   */
  onProjectEventType(projectId: string, eventType: string, handler: (event: any) => void): void {
    this.on('event', (event) => {
      if (event.projectId === projectId && event.type === eventType) {
        handler(event);
      }
    });
  }

  // === CONVENIENCE METHODS FOR COMMON EVENTS ===

  /**
   * Subscribe to issue events
   */
  onIssueEvent(handler: (event: any) => void): void {
    this.onEventType('issue.created', handler);
    this.onEventType('issue.updated', handler);
    this.onEventType('issue.status_changed', handler);
    this.onEventType('issue.assigned', handler);
    this.onEventType('issue.deleted', handler);
  }

  /**
   * Subscribe to project events
   */
  onProjectEvents(handler: (event: any) => void): void {
    this.onEventType('project.created', handler);
    this.onEventType('project.updated', handler);
    this.onEventType('project.deleted', handler);
  }

  /**
   * Subscribe to comment events
   */
  onCommentEvent(handler: (event: any) => void): void {
    this.onEventType('comment.created', handler);
    this.onEventType('comment.updated', handler);
    this.onEventType('comment.deleted', handler);
  }

  /**
   * Subscribe to AI events
   */
  onAIEvent(handler: (event: any) => void): void {
    this.onEventType('ai.task_started', handler);
    this.onEventType('ai.task_completed', handler);
    this.onEventType('ai.task_failed', handler);
  }

  /**
   * Subscribe to sprint events
   */
  onSprintEvent(handler: (event: any) => void): void {
    this.onEventType('sprint.created', handler);
    this.onEventType('sprint.started', handler);
    this.onEventType('sprint.closed', handler);
  }
}

// React hook for using MCP WebSocket
export function useMCPWebSocket(options: MCPWebSocketOptions = {}) {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      client: null,
      isConnected: false,
      connect: () => Promise.resolve(),
      disconnect: () => {},
    };
  }

  const [client] = React.useState(() => new MCPWebSocketClient(options));
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    client.on('connected', handleConnected);
    client.on('disconnected', handleDisconnected);

    // Auto-connect
    client.connect().catch(console.error);

    return () => {
      client.off('connected', handleConnected);
      client.off('disconnected', handleDisconnected);
      client.disconnect();
    };
  }, [client]);

  return {
    client,
    isConnected,
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
  };
}

// Create a singleton instance for global use
export const mcpWebSocket = typeof window !== 'undefined' ? new MCPWebSocketClient() : null;

// Auto-connect on client-side
if (mcpWebSocket) {
  mcpWebSocket.connect().catch(console.error);
}