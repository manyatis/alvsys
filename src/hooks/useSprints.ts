'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getProjectSprints, 
  createSprint as createSprintAction,
  updateSprint as updateSprintAction,
  deleteSprint as deleteSprintAction,
  closeSprint as closeSprintAction
} from '@/lib/sprint-functions';

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    cards: number;
  };
}

export function useSprints(projectId: string, userId?: string | null) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSprints = useCallback(async () => {
    try {
      const result = await getProjectSprints(projectId);
      if (result.success && result.sprints) {
        setSprints(result.sprints);
        const active = result.sprints.find((sprint: Sprint) => sprint.isActive);
        setActiveSprint(active || null);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchSprints();
    }
  }, [projectId, fetchSprints]);

  const createSprint = async (name: string, startDate?: Date, endDate?: Date) => {
    try {
      if (!userId) {
        console.error('useSprints: No userId provided for sprint creation');
        return false;
      }

      const result = await createSprintAction(projectId, userId, {
        name,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });

      if (result.success) {
        await fetchSprints();
        return true;
      }
      console.error('useSprints: Sprint creation failed:', result.error);
      return false;
    } catch (error) {
      console.error('Error creating sprint:', error);
      return false;
    }
  };

  const updateSprint = async (sprintId: string, updates: Partial<Sprint>) => {
    try {
      if (!userId) {
        console.error('useSprints: No userId provided for sprint update');
        return false;
      }

      const result = await updateSprintAction(projectId, userId, sprintId, {
        name: updates.name,
        startDate: updates.startDate?.toISOString(),
        endDate: updates.endDate?.toISOString(),
        isActive: updates.isActive,
      });

      if (result.success) {
        await fetchSprints();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating sprint:', error);
      return false;
    }
  };

  const closeSprint = async (sprintId: string) => {
    try {
      if (!userId) {
        console.error('useSprints: No userId provided for sprint closure');
        return false;
      }

      const result = await closeSprintAction(projectId, userId, sprintId);

      if (result.success) {
        await fetchSprints();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error closing sprint:', error);
      return false;
    }
  };

  const deleteSprint = async (sprintId: string) => {
    try {
      if (!userId) {
        console.error('useSprints: No userId provided for sprint deletion');
        return false;
      }

      const result = await deleteSprintAction(projectId, userId, sprintId);

      if (result.success) {
        await fetchSprints();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting sprint:', error);
      return false;
    }
  };

  return {
    sprints,
    activeSprint,
    loading,
    createSprint,
    updateSprint,
    closeSprint,
    deleteSprint,
    refreshSprints: fetchSprints,
  };
}