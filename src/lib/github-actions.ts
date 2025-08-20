'use server';

// Authentication imports removed - will be handled at a higher layer
import { PrismaClient } from '@prisma/client';
import { getUserInstallations as getUserInstallationsFunc, getAppInstallations as getAppInstallationsFunc } from '@/lib/github-functions';
import { prisma } from './prisma';



/**
 * Get GitHub installations for the authenticated user
 */
export async function getUserInstallations() {
  try {
    // Validate session authentication
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };


    // Use the consolidated GitHub functions
    const result = await getUserInstallationsFunc(user.id);
    
    return result;
  } catch (error) {
    console.error('Error in getUserInstallations server action:', error);
    throw error;
  }
}

/**
 * Get GitHub App installations using App authentication
 */
export async function getAppInstallations() {
  try {
    // Validate session authentication
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    // Use the consolidated GitHub functions
    const result = await getAppInstallationsFunc();
    
    return result;
  } catch (error) {
    console.error('Error in getAppInstallations server action:', error);
    throw error;
  }
}

/**
 * Get both user and app installations, with fallback logic
 */
export async function getAllInstallations() {
  try {
    // Always check if user has GitHub OAuth connection first
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    // Check if user has GitHub OAuth token (placeholder logic)
    const githubAccount = { access_token: 'placeholder-token' };

    // Try app installations first
    try {
      const appResult = await getAppInstallations();
      if (appResult.installations && appResult.installations.length > 0) {
        // If we have app installations but no OAuth token, indicate OAuth is needed for project creation
        if (!githubAccount?.access_token) {
          return {
            ...appResult,
            error: 'GitHub account not connected',
            needsGitHubConnection: true,
          };
        }
        return appResult;
      }
    } catch (error) {
      console.log('App installations failed, trying user installations');
    }

    // Fall back to user installations
    return await getUserInstallations();
  } catch (error) {
    console.error('Error in getAllInstallations server action:', error);
    throw error;
  }
}

/**
 * Create a new project from a GitHub repository (server action)
 */
export async function createProjectFromRepository(
  repoName: string,
  repoDescription: string | undefined,
  installationId: number,
  syncIssues: boolean
) {
  try {
    // Validate session authentication
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };


    // Use the consolidated GitHub functions
    const result = await import('@/lib/github-functions').then(module => 
      module.createProjectFromRepository(repoName, repoDescription, installationId, syncIssues, user.id)
    );
    
    return result;
  } catch (error) {
    console.error('Error in createProjectFromRepository server action:', error);
    throw error;
  }
}