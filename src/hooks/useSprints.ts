'use client';

import { useState, useEffect } from 'react';

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cards: number;
  };
}

export function useSprints(projectId: string) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSprints = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sprints`);
      if (response.ok) {
        const data = await response.json();
        setSprints(data);
        const active = data.find((sprint: Sprint) => sprint.isActive);
        setActiveSprint(active || null);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSprints();
    }
  }, [projectId]);

  const createSprint = async (name: string, startDate?: Date, endDate?: Date) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sprints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }),
      });

      if (response.ok) {
        await fetchSprints();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating sprint:', error);
      return false;
    }
  };

  const updateSprint = async (sprintId: string, updates: Partial<Sprint>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
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
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprintId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
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
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
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