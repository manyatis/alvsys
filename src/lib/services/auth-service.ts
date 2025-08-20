import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get the current authenticated user from session
 */
export async function getCurrentUser(): Promise<AuthServiceResult<AuthenticatedUser>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    // Type assertion since we know the session callback adds the id
    const user = session.user as AuthenticatedUser;
    
    if (!user.id) {
      return {
        success: false,
        error: 'User ID not found in session'
      };
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email || '',
        name: user.name || undefined
      }
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      success: false,
      error: 'Failed to get user session'
    };
  }
}

/**
 * Wrapper for authenticated actions
 */
export async function withAuth<T>(
  action: (user: AuthenticatedUser) => Promise<T>
): Promise<AuthServiceResult<T>> {
  const userResult = await getCurrentUser();
  
  if (!userResult.success || !userResult.data) {
    return {
      success: false,
      error: userResult.error
    };
  }

  try {
    const result = await action(userResult.data);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error in authenticated action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}