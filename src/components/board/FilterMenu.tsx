'use client';

import { Card, Label } from '@/types/card';
import { FilterState, hasActiveFilters, getUniqueAssignees, createClearFilters } from '@/utils/board-utils';

interface FilterMenuProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  labels: Label[];
  cards: Card[];
  isCollapsed?: boolean;
}

export default function FilterMenu({
  filters,
  setFilters,
  labels,
  cards,
  isCollapsed = false,
}: FilterMenuProps) {
  const clearFilters = createClearFilters(setFilters);

  const containerClasses = isCollapsed 
    ? "absolute left-full top-0 ml-2 w-64 md:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-40 p-3 md:p-4"
    : "absolute left-0 top-full mt-1 w-64 md:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-40 p-3 md:p-4";

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters(filters) && (
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search
        </label>
        <input
          type="text"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      {/* Priority */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Priority
        </label>
        <select
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All priorities</option>
          <option value="1">P1 (Highest)</option>
          <option value="2">P2 (High)</option>
          <option value="3">P3 (Medium)</option>
          <option value="4">P4 (Low)</option>
          <option value="5">P5 (Lowest)</option>
        </select>
      </div>
      
      {/* Assignee */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Assignee
        </label>
        <select
          value={filters.assigneeId}
          onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
        >
          <option value="">All assignees</option>
          {getUniqueAssignees(cards).map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name || assignee.email}
            </option>
          ))}
        </select>
      </div>
      
      {/* AI Allowed */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          AI Tasks
        </label>
        <select
          value={filters.aiAllowed}
          onChange={(e) => setFilters(prev => ({ ...prev, aiAllowed: e.target.value as 'all' | 'ai-only' | 'human-only' }))}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All issues</option>
          <option value="ai-only">AI allowed only</option>
          <option value="human-only">Human only</option>
        </select>
      </div>
      
      {/* Labels */}
      {labels.length > 0 && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Labels
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {labels.map((label) => (
              <label key={label.id} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.labelIds.includes(label.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters(prev => ({
                        ...prev,
                        labelIds: [...prev.labelIds, label.id]
                      }));
                    } else {
                      setFilters(prev => ({
                        ...prev,
                        labelIds: prev.labelIds.filter(id => id !== label.id)
                      }));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: label.color + '20',
                    color: label.color,
                    border: `1px solid ${label.color}40`
                  }}
                >
                  {label.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}