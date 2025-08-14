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
    <div className="form-group-professional">
      <div className="flex items-center justify-between mb-1">
        <label className="form-label-professional">
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
      <select
        value={selectedSprintId || ''}
        onChange={(e) => onSelectionChange(e.target.value || null)}
        disabled={disabled}
        className="select-professional-sm"
      >
        <option value="">No Sprint (Backlog)</option>
        {displaySprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.name} {sprint.isActive ? '(Active)' : '(Completed)'}
          </option>
        ))}
      </select>
    </div>
  );
}