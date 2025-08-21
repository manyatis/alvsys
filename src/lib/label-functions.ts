'use server';

// Authentication imports removed - will be handled at a higher layer
import { prisma } from '@/lib/prisma';

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabelsResult {
  success: boolean;
  error?: string;
  labels?: Label[];
}

export interface CreateLabelResult {
  success: boolean;
  error?: string;
  label?: Label;
}

// Generate a random hex color
function generateRandomColor(): string {
  const colors = [
    '#EF4444', // Red
    '#F97316', // Orange  
    '#F59E0B', // Amber
    '#EAB308', // Yellow
    '#84CC16', // Lime
    '#22C55E', // Green
    '#10B981', // Emerald
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#A855F7', // Purple
    '#D946EF', // Fuchsia
    '#EC4899', // Pink
    '#F43F5E', // Rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get labels for a project
 */
export async function getProjectLabels(projectId: string): Promise<LabelsResult> {
  try {
    // Basic validation - project should exist
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    // Get all labels for the project
    const labels = await prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      labels
    };
  } catch (error) {
    console.error('Error fetching labels:', error);
    return {
      success: false,
      error: 'Failed to fetch labels'
    };
  }
}

/**
 * Create a new label
 */
export async function createLabel(
  projectId: string,
  data: {
    name: string;
    color?: string;
  }
): Promise<CreateLabelResult> {
  try {
    const { name, color } = data;

    if (!name || name.trim() === '') {
      return {
        success: false,
        error: 'Label name is required'
      };
    }

    // Basic validation - project should exist
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    // Check if label already exists in this project
    const existingLabel = await prisma.label.findUnique({
      where: {
        projectId_name: {
          projectId: projectId,
          name: name.trim()
        }
      }
    });

    if (existingLabel) {
      return {
        success: false,
        error: 'Label already exists'
      };
    }

    // Create the label with provided color or random if not provided
    const label = await prisma.label.create({
      data: {
        name: name.trim(),
        color: color || generateRandomColor(),
        projectId: projectId
      }
    });

    return {
      success: true,
      label
    };
  } catch (error) {
    console.error('Error creating label:', error);
    return {
      success: false,
      error: 'Failed to create label'
    };
  }
}