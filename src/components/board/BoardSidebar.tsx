'use client';

import { useRouter } from 'next/navigation';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Settings, 
  Users, 
  Copy, 
  Check,
  Archive 
} from 'lucide-react';
import { FilterState, hasActiveFilters, copyOnboardLink } from '@/utils/board-utils';
import FilterMenu from './FilterMenu';
import { Card, Label } from '@/types/card';

interface UsageStatus {
  tier: 'FREE' | 'INDIE' | 'PROFESSIONAL';
  usage: {
    canCreateCard: boolean;
    canCreateProject: boolean;
    dailyCardsUsed: number;
    dailyCardsLimit: number;
    projectsUsed: number;
    projectsLimit: number;
    resetTime: Date;
  };
  isAtCardLimit: boolean;
  isAtProjectLimit: boolean;
}

interface BoardSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  showFilterMenu: boolean;
  setShowFilterMenu: (show: boolean) => void;
  copyFeedback: boolean;
  setCopyFeedback: (feedback: boolean) => void;
  projectId: string;
  onCreateIssue: () => void;
  labels: Label[];
  cards: Card[];
  usageStatus?: UsageStatus | null;
}

export default function BoardSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  filters,
  setFilters,
  showFilterMenu,
  setShowFilterMenu,
  copyFeedback,
  setCopyFeedback,
  projectId,
  onCreateIssue,
  labels,
  cards,
  usageStatus,
}: BoardSidebarProps) {
  const router = useRouter();
  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 sticky left-0 top-0 h-full z-10 ${
      sidebarCollapsed ? 'w-8 md:w-10' : 'w-32 sm:w-44 md:w-48'
    }`}>
      <div className="p-2 md:p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Board Actions</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="p-2 md:p-3 space-y-1">
        {!sidebarCollapsed ? (
          <>
            <div>
              {usageStatus?.isAtCardLimit && (
                <div className="mb-1 text-xs text-red-600 dark:text-red-400">
                  Daily limit: {usageStatus.usage.dailyCardsUsed}/{usageStatus.usage.dailyCardsLimit}
                </div>
              )}
              <button
                onClick={onCreateIssue}
                disabled={usageStatus?.isAtCardLimit}
                className="w-full flex items-center gap-1 md:gap-2 px-2 py-1.5 text-left text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
                Create Issue
              </button>
            </div>
            
            <button
              onClick={() => router.push(`/projects/${projectId}/backlog`)}
              className="w-full flex items-center gap-1 md:gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Archive className="h-3 w-3" />
              Backlog
            </button>
            
            <button
              onClick={() => copyOnboardLink(projectId, () => {
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
              })}
              className="w-full flex items-center gap-1 md:gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copyFeedback ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copyFeedback ? 'Copied!' : 'Copy AI Onboard Link'}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs rounded-lg transition-colors ${
                  hasActiveFilters(filters) 
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="h-3 w-3" />
                Filter
                {hasActiveFilters(filters) && (
                  <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
              
              {showFilterMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30"
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <FilterMenu
                    filters={filters}
                    setFilters={setFilters}
                    labels={labels}
                    cards={cards}
                    isCollapsed={false}
                  />
                </>
              )}
            </div>
            
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Search className="h-3 w-3" />
              Search
            </button>
            
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Users className="h-3 w-3" />
              Assignees
            </button>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-4">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="h-3 w-3" />
                Board Settings
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={onCreateIssue}
              className="w-full p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              title="Create Issue"
            >
              <Plus className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => router.push(`/projects/${projectId}/backlog`)}
              className="w-full p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Backlog"
            >
              <Archive className="h-3 w-3" />
            </button>
            
            <button
              onClick={() => copyOnboardLink(projectId, () => {
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
              })}
              className="w-full p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={copyFeedback ? 'Copied!' : 'Copy AI Onboard Link'}
            >
              {copyFeedback ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`w-full p-1.5 rounded-lg transition-colors relative ${
                  hasActiveFilters(filters) 
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Filter"
              >
                <Filter className="h-3 w-3" />
                {hasActiveFilters(filters) && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
              
              {showFilterMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30"
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <FilterMenu
                    filters={filters}
                    setFilters={setFilters}
                    labels={labels}
                    cards={cards}
                    isCollapsed={true}
                  />
                </>
              )}
            </div>
            
            <button 
              className="w-full p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Search"
            >
              <Search className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}