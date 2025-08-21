'use server';

// Authentication imports removed - will be handled at a higher layer
import { prisma } from '@/lib/prisma';

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    cards: number;
  };
}

export interface SprintsResult {
  success: boolean;
  error?: string;
  sprints?: Sprint[];
}

export interface CreateSprintResult {
  success: boolean;
  error?: string;
  sprint?: Sprint;
}

export interface UpdateSprintResult {
  success: boolean;
  error?: string;
  sprint?: Sprint;
}

export interface DeleteSprintResult {
  success: boolean;
  error?: string;
}

export interface CloseSprintResult {
  success: boolean;
  error?: string;
  closedSprint?: Sprint;
  activatedSprint?: Sprint | null;
  movedCardsCount?: number;
}

/**
 * Get sprints for a project
 */
export async function getProjectSprints(projectId: string): Promise<SprintsResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    // Basic validation - project should exist (placeholder logic)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } },
        ],
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    // Get all sprints for the project
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { cards: true }
        }
      }
    });

    return {
      success: true,
      sprints
    };
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return {
      success: false,
      error: 'Failed to fetch sprints'
    };
  }
}

/**
 * Create a new sprint
 */
export async function createSprint(
  projectId: string, 
  userId: string,
  data: {
    name: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<CreateSprintResult> {
  try {
    const { name, startDate, endDate } = data;

    // Basic validation - project should exist (placeholder logic)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } },
        ],
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    // Check if there's already an active sprint
    const activeSprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        isActive: true,
      },
    });

    // Create the new sprint
    const sprint = await prisma.sprint.create({
      data: {
        name,
        projectId,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default: 2 weeks from now
        isActive: !activeSprint, // Make active if no other active sprint
      },
    });

    return {
      success: true,
      sprint
    };
  } catch (error) {
    console.error('Error creating sprint:', error);
    return {
      success: false,
      error: 'Failed to create sprint'
    };
  }
}

/**
 * Update a sprint
 */
export async function updateSprint(
  projectId: string,
  userId: string,
  sprintId: string,
  data: {
    name?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }
): Promise<UpdateSprintResult> {
  try {

    const { name, startDate, endDate, isActive } = data;

    // Basic validation - project should exist (placeholder logic)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } },
        ],
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    // If setting this sprint as active, deactivate others
    if (isActive) {
      await prisma.sprint.updateMany({
        where: {
          projectId,
          id: { not: sprintId },
        },
        data: { isActive: false },
      });
    }

    // Update the sprint
    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return {
      success: true,
      sprint
    };
  } catch (error) {
    console.error('Error updating sprint:', error);
    return {
      success: false,
      error: 'Failed to update sprint'
    };
  }
}

/**
 * Delete a sprint
 */
export async function deleteSprint(
  projectId: string,
  userId: string,
  sprintId: string
): Promise<DeleteSprintResult> {
  try {

    // Basic validation - project should exist (placeholder logic)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } },
        ],
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    // Delete the sprint (cards will have sprintId set to null due to optional relation)
    await prisma.sprint.delete({
      where: { id: sprintId },
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return {
      success: false,
      error: 'Failed to delete sprint'
    };
  }
}

/**
 * Close a sprint and optionally move incomplete cards to next sprint
 */
export async function closeSprint(
  projectId: string,
  userId: string,
  sprintId: string
): Promise<CloseSprintResult> {
  try {

    // Basic validation - project should exist (placeholder logic)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } },
        ],
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    // Get the current sprint
    const currentSprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        cards: {
          where: {
            status: { not: 'COMPLETED' }
          }
        }
      }
    });

    if (!currentSprint) {
      return {
        success: false,
        error: 'Sprint not found'
      };
    }

    if (!currentSprint.isActive) {
      return {
        success: false,
        error: 'Sprint is not active'
      };
    }

    // Find the next sprint (by creation date)
    const nextSprint = await prisma.sprint.findFirst({
      where: {
        projectId,
        createdAt: { gt: currentSprint.createdAt },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Close the current sprint
      await tx.sprint.update({
        where: { id: sprintId },
        data: { 
          isActive: false,
          endDate: new Date(),
        },
      });

      // If there are incomplete cards and a next sprint exists, move them
      if (currentSprint.cards.length > 0 && nextSprint) {
        await tx.card.updateMany({
          where: {
            sprintId,
            status: { not: 'COMPLETED' },
          },
          data: { sprintId: nextSprint.id },
        });
      }

      // Activate the next sprint if it exists
      if (nextSprint) {
        await tx.sprint.update({
          where: { id: nextSprint.id },
          data: { 
            isActive: true,
            startDate: new Date(),
          },
        });
      }

      return {
        closedSprint: currentSprint,
        activatedSprint: nextSprint,
        movedCardsCount: currentSprint.cards.length,
      };
    });

    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('Error closing sprint:', error);
    return {
      success: false,
      error: 'Failed to close sprint'
    };
  }
}