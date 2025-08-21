'use client';


import { MoreVertical, RefreshCw, Calendar, ChevronDown, Plus, GitBranch } from 'lucide-react';
import ProjectSelector from '@/components/ProjectSelector';
import { Sprint } from '@/hooks/useSprints';
import { useState, useEffect, useRef } from 'react';

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  } | null;
}

interface BoardHeaderProps {
  project: Project | null;
  currentProjectId: string;
  isRefreshing: boolean;
  isSyncing?: boolean;
  activeSprint: Sprint | null;
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSprintSelect: (sprintId: string | null) => void;
  onCloseAndStartNext?: () => void;
  onToggleSprintFilter?: () => void;
  showOnlyActiveSprint?: boolean;
  onCreateSprint?: () => void;
  onManualSync?: () => void;
}

export default function BoardHeader({
  project,
  currentProjectId,
  isRefreshing,
  isSyncing = false,
  activeSprint,
  sprints,
  selectedSprintId,
  onSprintSelect,
  onCloseAndStartNext,
  onToggleSprintFilter: _onToggleSprintFilter,
  showOnlyActiveSprint: _showOnlyActiveSprint = true,
  onCreateSprint,
  onManualSync,
}: BoardHeaderProps) {
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const [showEllipsisMenu, setShowEllipsisMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ellipsisMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSprintMenu(false);
      }
      if (ellipsisMenuRef.current && !ellipsisMenuRef.current.contains(event.target as Node)) {
        setShowEllipsisMenu(false);
      }
    };

    if (showSprintMenu || showEllipsisMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSprintMenu, showEllipsisMenu]);

  const getSelectedSprintName = () => {
    if (!selectedSprintId) {
      // If no sprint selected but there's an active sprint, show active sprint name
      return activeSprint ? activeSprint.name : 'All Sprints';
    }
    const sprint = sprints.find(s => s.id === selectedSprintId);
    return sprint ? sprint.name : 'All Sprints';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {project && project.organization && (
            <ProjectSelector 
              currentProject={{
                id: project.id,
                name: project.name,
                organization: project.organization
              }} 
              currentProjectId={currentProjectId}
            />
          )}
          
          {/* Sprint Selector and Copy AI Link Button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
            {/* Sprint Selector */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowSprintMenu(!showSprintMenu)}
                className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 w-full sm:w-auto text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {getSelectedSprintName()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showSprintMenu && (
                <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                {/* Sprint Options */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      onSprintSelect(null);
                      setShowSprintMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                      selectedSprintId === null 
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Sprints
                  </button>
                  
                  {sprints.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      {sprints.map((sprint) => (
                        <button
                          key={sprint.id}
                          onClick={() => {
                            onSprintSelect(sprint.id);
                            setShowSprintMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors mb-1 ${
                            selectedSprintId === sprint.id 
                              ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{sprint.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              sprint.isActive 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {sprint.isActive ? 'Active' : 'Completed'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                {/* Management Options */}
                <div className="p-2 space-y-1">
                  {activeSprint && (
                    <button
                      onClick={() => {
                        onCloseAndStartNext?.();
                        setShowSprintMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Close & Start Next Sprint
                    </button>
                  )}
                  
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
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {(isRefreshing || isSyncing) && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="hidden md:inline">{isSyncing ? 'Git Syncing...' : 'Syncing...'}</span>
            </div>
          )}
          <div className="relative" ref={ellipsisMenuRef}>
            <button 
              onClick={() => setShowEllipsisMenu(!showEllipsisMenu)}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              <MoreVertical className="h-3 w-3" />
            </button>
            
            {showEllipsisMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      onManualSync?.();
                      setShowEllipsisMenu(false);
                    }}
                    disabled={isSyncing}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <GitBranch className="h-4 w-4" />
                    Manual Git Sync
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}