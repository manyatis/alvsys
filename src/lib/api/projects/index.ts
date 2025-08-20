import { prisma } from '@/lib/prisma';
import { UsageService } from '@/services/usage-service';
import { ApiError } from '@/lib/api/errors';

export interface GetProjectsParams {
  userId: string;
}

export interface CreateProjectParams {
  userId: string;
  projectName: string;
  organizationName?: string;
  organizationId?: string;
}

export class ProjectsAPI {
  static async getProjects({ userId }: GetProjectsParams) {
    const userWithProjects = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedProjects: {
          include: {
            organization: true,
            _count: {
              select: { cards: true }
            }
          }
        },
        projectAccess: {
          include: {
            project: {
              include: {
                organization: true,
                _count: {
                  select: { cards: true }
                }
              }
            }
          }
        }
      }
    });

    if (!userWithProjects) {
      throw ApiError.notFound('User not found');
    }

    // Combine owned projects and projects user is a member of
    const allProjects = [
      ...userWithProjects.ownedProjects,
      ...userWithProjects.projectAccess.map(p => p.project)
    ];

    // Remove duplicates
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p.id, p])).values()
    );

    return { projects: uniqueProjects };
  }

  static async createProject(params: CreateProjectParams) {
    const { userId, projectName, organizationName, organizationId } = params;

    if (!projectName) {
      throw ApiError.badRequest('Project name is required');
    }

    if (!organizationName && !organizationId) {
      throw ApiError.badRequest('Either organization name or ID is required');
    }

    // Check usage limits before creating project
    const hasReachedProjectLimit = await UsageService.hasReachedProjectLimit(userId);
    if (hasReachedProjectLimit) {
      const usageStats = await UsageService.getUserUsageStats(userId);
      throw ApiError.tooManyRequests('Project limit reached', {
        used: usageStats.totalProjectCount,
        limit: 1, // Default limit for now since service is stubbed
      });
    }

    let orgId = organizationId;

    // Create new organization if needed
    if (!organizationId && organizationName) {
      const newOrg = await prisma.organization.create({
        data: {
          name: organizationName,
          users: {
            connect: { id: userId }
          }
        }
      });
      
      orgId = newOrg.id;

      // Update user's organization
      await prisma.user.update({
        where: { id: userId },
        data: { organizationId: orgId }
      });
    }

    // Verify user has access to the organization
    if (organizationId) {
      const userOrg = await prisma.user.findFirst({
        where: {
          id: userId,
          organizationId: organizationId
        }
      });

      if (!userOrg) {
        throw ApiError.forbidden('You do not have access to this organization');
      }
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        organizationId: orgId,
        ownerId: userId,
        users: {
          create: {
            userId: userId,
            role: 'owner'
          }
        }
      },
      include: {
        organization: true
      }
    });

    return { project };
  }

  static async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId } } }
        ]
      },
      include: {
        organization: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        cards: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            cards: true,
            users: true
          }
        }
      }
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    return project;
  }

  static async updateProject(projectId: string, userId: string, updates: { name?: string }) {
    // First verify the user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { users: { some: { userId: userId, role: { in: ['owner', 'admin'] } } } }
        ]
      }
    });

    if (!project) {
      throw ApiError.notFound('Project not found or you do not have permission to update it');
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updates,
      include: {
        organization: true
      }
    });

    return updatedProject;
  }

  static async deleteProject(projectId: string, userId: string) {
    // Only owners can delete projects
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    });

    if (!project) {
      throw ApiError.notFound('Project not found or you do not have permission to delete it');
    }

    // Delete the project (this will cascade to related records based on schema)
    await prisma.project.delete({
      where: { id: projectId }
    });

    return { success: true };
  }
}