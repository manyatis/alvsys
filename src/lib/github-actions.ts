'use server';

// Authentication imports removed - will be handled at a higher layer
import { getUserInstallations as getUserInstallationsFunc, getAppInstallations as getAppInstallationsFunc } from '@/lib/github-functions';



/**
 * Get GitHub installations for the authenticated user
 */
export async function getUserInstallations(userId: string) {
  try {
    // Use the consolidated GitHub functions
    const result = await getUserInstallationsFunc(userId);
    
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
export async function getAllInstallations(userId: string) {
  try {
    // SECURITY FIX: Only use user installations, never app installations
    // App installations would expose all installations across all users
    return await getUserInstallations(userId);
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
  syncIssues: boolean,
  username: string
) {
  try {
    // Use the consolidated GitHub functions
    const result = await import('@/lib/github-functions').then(module => 
      module.createProjectFromRepository(repoName, repoDescription, installationId, syncIssues, username)
    );
    
    return result;
  } catch (error) {
    console.error('Error in createProjectFromRepository server action:', error);
    throw error;
  }
}