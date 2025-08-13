import { prisma } from './prisma';

/**
 * Utility function to execute database operations with proper error handling
 * and connection management for Supabase
 */
export async function withDatabase<T>(
  operation: (client: typeof prisma) => Promise<T>
): Promise<T> {
  try {
    const result = await operation(prisma);
    return result;
  } catch (error) {
    console.error('Database operation failed:', error);
    
    // Handle specific Supabase/PostgreSQL connection errors
    if (error instanceof Error) {
      if (error.message.includes('Max client connections reached')) {
        console.error('Connection pool exhausted - consider reducing concurrent operations');
      }
      if (error.message.includes('Connection terminated')) {
        console.error('Database connection terminated - retrying may be necessary');
      }
    }
    
    throw error;
  }
}

/**
 * Utility function for operations that might need retry on connection issues
 */
export async function withDatabaseRetry<T>(
  operation: (client: typeof prisma) => Promise<T>,
  maxRetries = 2,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withDatabase(operation);
    } catch (error) {
      lastError = error;
      
      // Only retry on connection-related errors
      if (error instanceof Error && 
          (error.message.includes('Connection') || 
           error.message.includes('ECONNRESET') ||
           error.message.includes('timeout'))) {
        
        if (attempt < maxRetries) {
          console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      
      // Don't retry for other types of errors
      break;
    }
  }
  
  throw lastError;
}