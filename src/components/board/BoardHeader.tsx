'use client';

import { MoreVertical, RefreshCw, Calendar, ChevronRight, Plus } from 'lucide-react';
import ProjectSelector from '@/components/ProjectSelector';
import { Sprint } from '@/hooks/useSprints';
import { useState, useEffect, useRef } from 'react';

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
  activeSprint: Sprint | null;
  onCloseAndStartNext?: () => void;
  onToggleSprintFilter?: () => void;
  showOnlyActiveSprint?: boolean;
  onCreateSprint?: () => void;
  onViewOldSprints?: () => void;
}

export default function BoardHeader({
  project,
  currentProjectId,
  isRefreshing,
  activeSprint,
  onCloseAndStartNext,
  onToggleSprintFilter,
  showOnlyActiveSprint = true,
  onCreateSprint,
  onViewOldSprints,
}: BoardHeaderProps) {
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSprintMenu(false);
      }
    };

    if (showSprintMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSprintMenu]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 md:px-4 py-2">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {project && (
            <ProjectSelector 
              currentProject={project} 
              currentProjectId={currentProjectId}
            />
          )}
          
          {/* Sprint Selector */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowSprintMenu(!showSprintMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">
                {activeSprint ? activeSprint.name : 'No Active Sprint'}
              </span>
              <span className="md:hidden">
                {activeSprint ? activeSprint.name.split(' ').slice(0, 2).join(' ') : 'No Sprint'}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {showSprintMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-2">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyActiveSprint}
                      onChange={() => onToggleSprintFilter?.()}
                      className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show only active sprint
                    </span>
                  </label>
                </div>
                
                {activeSprint && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          onCloseAndStartNext?.();
                          setShowSprintMenu(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Close & Start Next Sprint
                      </button>
                    </div>
                  </>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      onViewOldSprints?.();
                      setShowSprintMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    View Old Sprints
                  </button>
                  <button
                    onClick={() => {
                      onCreateSprint?.();
                      setShowSprintMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Sprint
                  </button>
                </div>
              </div>
            )}
          </div>
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