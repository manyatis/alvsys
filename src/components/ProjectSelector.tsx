'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserProjects } from '@/lib/project-functions';

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
}

interface ProjectSelectorProps {
  currentProject: Project;
  currentProjectId: string;
}

export default function ProjectSelector({ currentProject, currentProjectId }: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Close dropdown when clicking outside (with delay)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Clear any existing timeout
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        // Add a 300ms delay before closing
        closeTimeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 300);
      }
    };

    const handleMouseEnter = () => {
      // Cancel close timeout when mouse enters dropdown
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      const dropdown = dropdownRef.current;
      if (dropdown) {
        dropdown.addEventListener('mouseenter', handleMouseEnter);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      const dropdown = dropdownRef.current;
      if (dropdown) {
        dropdown.removeEventListener('mouseenter', handleMouseEnter);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [isOpen]);

  // Fetch projects when dropdown opens
  useEffect(() => {
    if (isOpen && projects.length === 0) {
      fetchProjects();
    }
  }, [isOpen, projects.length]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await getUserProjects();
      if (result.success && result.projects) {
        const mappedProjects = result.projects
          .filter(project => project.organization !== null)
          .map(project => ({
            id: project.id,
            name: project.name,
            organization: {
              id: project.organization!.id,
              name: project.organization!.name
            }
          }));
        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    if (projectId !== currentProjectId) {
      router.push(`/projects/${projectId}/board`);
    }
    setIsOpen(false);
  };

  // Group projects by organization
  const projectsByOrg = projects.reduce((acc, project) => {
    const orgName = project.organization.name;
    if (!acc[orgName]) {
      acc[orgName] = [];
    }
    acc[orgName].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-left min-w-0 w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {currentProject?.name}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Software project • {currentProject?.organization.name}
          </p>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {Object.entries(projectsByOrg).map(([orgName, orgProjects]) => (
                  <div key={orgName} className="mb-2 last:mb-0">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {orgName}
                    </div>
                    {orgProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project.id)}
                        className={`w-full text-left px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          project.id === currentProjectId
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="truncate font-medium">
                          {project.name}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
                {projects.length === 0 && !loading && (
                  <div className="px-2 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No projects found
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}