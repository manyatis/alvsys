'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { getUserInstallations as getUserInstallationsFunc, getAppInstallations as getAppInstallationsFunc } from '@/lib/github-functions';
import { prisma } from './prisma';



/**
 * Get GitHub installations for the authenticated user
 */
export async function getUserInstallations() {
  try {
    // Validate session authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error('Unauthorized');
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error('Unauthorized');
    }

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
    // Try app installations first
    try {
      const appResult = await getAppInstallations();
      if (appResult.installations && appResult.installations.length > 0) {
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