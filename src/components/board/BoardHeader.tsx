'use client';

import { MoreVertical, RefreshCw } from 'lucide-react';
import ProjectSelector from '@/components/ProjectSelector';

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
}

interface BoardHeaderProps {
  project: Project | null;
  currentProjectId: string;
  isRefreshing: boolean;
}

export default function BoardHeader({
  project,
  currentProjectId,
  isRefreshing,
}: BoardHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 md:px-4 py-2">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex-1 min-w-0">
          {project && (
            <ProjectSelector 
              currentProject={project} 
              currentProjectId={currentProjectId}
            />
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-2 md:ml-4">
          {isRefreshing && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="hidden md:inline">Syncing...</span>
            </div>
          )}
          <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
            <MoreVertical className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}