import { prisma } from './prisma';

/**
 * Debug utility to help identify connection issues
 */
export async function debugConnections() {
  try {
    console.log('🔍 Debugging database connections...');
    
    // Test basic connectivity
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const latency = Date.now() - start;
    console.log(`✅ Basic connectivity: ${latency}ms`);
    
    // Check current connections (PostgreSQL specific)
    const connections = await prisma.$queryRaw<Array<{
      state: string;
      count: bigint;
    }>>`
      SELECT state, COUNT(*) as count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
      ORDER BY count DESC
    `;
    
    console.log('📊 Current connections by state:');
    connections.forEach(conn => {
      console.log(`  ${conn.state}: ${conn.count.toString()}`);
    });
    
    // Check for long-running queries
    const longQueries = await prisma.$queryRaw<Array<{
      query: string;
      duration: string;
      state: string;
    }>>`
      SELECT 
        query,
        now() - query_start as duration,
        state
      FROM pg_stat_activity 
      WHERE datname = current_database()
        AND query_start < now() - interval '30 seconds'
        AND query != '<IDLE>'
      ORDER BY duration DESC
      LIMIT 10
    `;
    
    if (longQueries.length > 0) {
      console.log('⚠️ Long-running queries:');
      longQueries.forEach(q => {
        console.log(`  ${q.duration} - ${q.state}: ${q.query.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ No long-running queries detected');
    }
    
    return { success: true, latency, connections, longQueries };
    
  } catch (error) {
    console.error('❌ Connection debug failed:', error);
    return { success: false, error };
  }
}

/**
 * Add this to any API route to debug connection issues
 */
export async function withConnectionDebug<T>(
  operation: () => Promise<T>
): Promise<T> {
  const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🚀 Starting operation: ${operationId}`);
  const start = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - start;
    console.log(`✅ Completed operation: ${operationId} in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Failed operation: ${operationId} after ${duration}ms`, error);
    throw error;
  }
}