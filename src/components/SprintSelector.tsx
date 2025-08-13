'use client';

import { Sprint } from '@/hooks/useSprints';
import { useState } from 'react';

interface SprintSelectorProps {
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSelectionChange: (sprintId: string | null) => void;
  disabled?: boolean;
}

export default function SprintSelector({
  sprints,
  selectedSprintId,
  onSelectionChange,
  disabled = false,
}: SprintSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  
  const activeSprints = sprints.filter(sprint => sprint.isActive);
  const inactiveSprints = sprints.filter(sprint => !sprint.isActive);
  const displaySprints = showAll ? sprints : activeSprints;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Sprint
        </label>
        {inactiveSprints.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            {showAll ? 'Show Active Only' : 'Show All Sprints'}
          </button>
        )}
      </div>
      <div className="relative">
        <select
          value={selectedSprintId || ''}
          onChange={(e) => onSelectionChange(e.target.value || null)}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">No Sprint (Backlog)</option>
          {displaySprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name} {sprint.isActive ? '(Active)' : '(Completed)'}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}