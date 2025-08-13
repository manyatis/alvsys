'use client';

import { useState } from 'react';
import { X, Calendar, BarChart3, Clock } from 'lucide-react';
import { Sprint } from '@/hooks/useSprints';

interface ViewOldSprintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprints: Sprint[];
}

export default function ViewOldSprintsModal({
  isOpen,
  onClose,
  sprints,
}: ViewOldSprintsModalProps) {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  
  if (!isOpen) return null;

  const oldSprints = sprints.filter(sprint => !sprint.isActive);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = (startDate: Date | string, endDate: Date | string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Old Sprints
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {oldSprints.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No old sprints found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Completed sprints will appear here once you finish your first sprint.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {oldSprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedSprint(selectedSprint?.id === sprint.id ? null : sprint)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {sprint.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {calculateDuration(sprint.startDate, sprint.endDate)} days
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          {sprint._count?.cards || 0} cards
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Completed
                      </span>
                    </div>
                  </div>
                  
                  {selectedSprint?.id === sprint.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="mb-2">
                          <strong>Goal:</strong> {sprint.goal || 'No goal specified'}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                          <div>
                            <span className="font-medium">Start Date:</span><br />
                            {formatDate(sprint.startDate)}
                          </div>
                          <div>
                            <span className="font-medium">End Date:</span><br />
                            {formatDate(sprint.endDate)}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span><br />
                            {calculateDuration(sprint.startDate, sprint.endDate)} days
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium">Cards Completed:</span> {sprint._count?.cards || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}