import { prisma } from './prisma';

/**
 * Utility to monitor database connection health
 * Useful for debugging connection pool issues
 */
export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connectionCount = 0;
  private activeConnections = new Set<string>();

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  /**
   * Test database connectivity
   */
  async testConnection(): Promise<{ success: boolean; latency?: number; error?: string }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { success: true, latency };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get current connection stats
   */
  getStats() {
    return {
      connectionCount: this.connectionCount,
      activeConnections: this.activeConnections.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Track a new operation
   */
  trackOperation(operationId: string) {
    this.connectionCount++;
    this.activeConnections.add(operationId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Operation started: ${operationId} (active: ${this.activeConnections.size})`);
    }
  }

  /**
   * Complete an operation
   */
  completeOperation(operationId: string) {
    this.activeConnections.delete(operationId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Operation completed: ${operationId} (active: ${this.activeConnections.size})`);
    }
  }

  /**
   * Log connection pool status (for debugging)
   */
  async logConnectionStatus() {
    const connectionTest = await this.testConnection();
    const stats = this.getStats();
    
    console.log('[DB Connection Monitor]', {
      ...stats,
      ...connectionTest
    });
  }
}

// Export singleton instance
export const connectionMonitor = ConnectionMonitor.getInstance();