'use server';

// Authentication imports removed - will be handled at a higher layer
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
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    const result = await ProjectsAPI.getProjects({ userId });
    return {
      success: true,
      projects: result.projects
    };
  } catch (error: unknown) {
    console.error('Error getting user projects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Create a new project
 */
export async function createProject(data: {
  projectName: string;
  organizationName?: string;
  organizationId?: string;
}): Promise<CreateProjectResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    const result = await ProjectsAPI.createProject({
      userId,
      ...data
    });

    return {
      success: true,
      project: result.project
    };
  } catch (error: unknown) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<GetProjectResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    const project = await ProjectsAPI.getProjectById(projectId, userId);
    return {
      success: true,
      project
    };
  } catch (error: unknown) {
    console.error('Error getting project by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string, 
  updates: { name?: string }
): Promise<UpdateProjectResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    const project = await ProjectsAPI.updateProject(projectId, userId, updates);
    return {
      success: true,
      project
    };
  } catch (error: unknown) {
    console.error('Error updating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<DeleteProjectResult> {
  try {
    // TODO: Authentication will be handled at a higher layer
    const userId = 'placeholder-user-id';
    const user = { id: userId, email: 'placeholder@example.com', name: 'Placeholder User' };

    await ProjectsAPI.deleteProject(projectId, userId);
    return {
      success: true
    };
  } catch (error: unknown) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}