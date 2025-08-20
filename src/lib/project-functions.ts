'use server';

import { withAuth } from '@/lib/services/auth-service';
import { ProjectsAPI } from '@/lib/api/projects/index';

export interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  } | null;
  _count?: {
    cards: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectsResult {
  success: boolean;
  error?: string;
  projects?: Project[];
}

export interface CreateProjectResult {
  success: boolean;
  error?: string;
  project?: Project;
}

export interface GetProjectResult {
  success: boolean;
  error?: string;
  project?: Project & {
    owner: { id: string; name: string | null; email: string };
    users: Array<{
      user: { id: string; name: string | null; email: string };
    }>;
    cards: Array<{
      id: string;
      title: string;
      assignee?: { id: string; name: string | null; email: string } | null;
    }>;
    _count: { cards: number; users: number };
  };
}

export interface UpdateProjectResult {
  success: boolean;
  error?: string;
  project?: Project;
}

export interface DeleteProjectResult {
  success: boolean;
  error?: string;
}

/**
 * Get user's projects
 */
export async function getUserProjects(): Promise<ProjectsResult> {
  const result = await withAuth(async (user) => {
    const apiResult = await ProjectsAPI.getProjects({ userId: user.id });
    return apiResult.projects;
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }

  return {
    success: true,
    projects: result.data || []
  };
}

/**
 * Create a new project
 */
export async function createProject(data: {
  projectName: string;
  organizationName?: string;
  organizationId?: string;
}): Promise<CreateProjectResult> {
  const result = await withAuth(async (user) => {
    const apiResult = await ProjectsAPI.createProject({
      userId: user.id,
      ...data
    });
    return apiResult.project;
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }

  return {
    success: true,
    project: result.data
  };
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<GetProjectResult> {
  const result = await withAuth(async (user) => {
    const project = await ProjectsAPI.getProjectById(projectId, user.id);
    return project;
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }

  return {
    success: true,
    project: result.data
  };
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string, 
  updates: { name?: string }
): Promise<UpdateProjectResult> {
  const result = await withAuth(async (user) => {
    const project = await ProjectsAPI.updateProject(projectId, user.id, updates);
    return project;
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }

  return {
    success: true,
    project: result.data
  };
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<DeleteProjectResult> {
  const result = await withAuth(async (user) => {
    await ProjectsAPI.deleteProject(projectId, user.id);
    return true;
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }

  return {
    success: true
  };
}