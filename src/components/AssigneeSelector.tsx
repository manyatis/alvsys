'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Bot } from 'lucide-react';

interface AssigneeOption {
  id: string;
  name: string;
  email?: string;
  type: 'user' | 'agent' | 'self';
}

interface AssigneeSelectorProps {
  currentUserId?: string;
  organizationMembers: Array<{
    id: string;
    name?: string;
    email?: string;
  }>;
  selectedAssigneeId?: string;
  onSelectionChange: (assigneeId: string | null) => void;
  isAiAllowedTask: boolean;
}

export default function AssigneeSelector({
  currentUserId,
  organizationMembers,
  selectedAssigneeId,
  onSelectionChange,
  isAiAllowedTask
}: AssigneeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Build assignee options
  const buildAssigneeOptions = (): AssigneeOption[] => {
    const options: AssigneeOption[] = [];

    // Add "Assign to me" option if current user is available
    if (currentUserId) {
      const currentUser = organizationMembers.find(member => member.id === currentUserId);
      if (currentUser) {
        options.push({
          id: currentUserId,
          name: 'Assign to me',
          email: currentUser.email,
          type: 'self'
        });
      }
    }

    // Add organization members
    organizationMembers.forEach(member => {
      if (member.id !== currentUserId) { // Don't duplicate current user
        options.push({
          id: member.id,
          name: member.name || member.email?.split('@')[0] || 'Unknown User',
          email: member.email,
          type: 'user'
        });
      }
    });

    // Add Agent option for AI allowed tasks
    if (isAiAllowedTask) {
      options.push({
        id: 'agent',
        name: 'Agent',
        type: 'agent'
      });
    }

    return options;
  };

  const assigneeOptions = buildAssigneeOptions();
  
  // Find selected assignee
  const selectedAssignee = selectedAssigneeId 
    ? assigneeOptions.find(option => 
        selectedAssigneeId === 'agent' ? option.id === 'agent' : option.id === selectedAssigneeId
      )
    : null;

  const handleOptionSelect = (option: AssigneeOption) => {
    if (option.id === 'agent') {
      onSelectionChange('agent');
    } else {
      onSelectionChange(option.id);
    }
    setIsOpen(false);
  };

  const clearAssignee = () => {
    onSelectionChange(null);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Assignee
      </label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white transition-colors"
      >
        {selectedAssignee ? (
          <div className="flex items-center gap-2">
            {selectedAssignee.type === 'agent' ? (
              <Bot className="h-4 w-4 text-purple-600" />
            ) : (
              <User className="h-4 w-4 text-gray-500" />
            )}
            <span className="truncate">
              {selectedAssignee.name}
              {selectedAssignee.type === 'agent' && (
                <span className="ml-1 text-xs text-purple-600">(AI)</span>
              )}
            </span>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
        )}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-1">
            {/* Clear selection option */}
            <button
              type="button"
              onClick={clearAssignee}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors text-left"
            >
              <div className="w-4 h-4" /> {/* Spacer for alignment */}
              <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
            </button>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

            {/* Assignee options */}
            {assigneeOptions.map((option) => (
              <button
                key={`${option.type}-${option.id}`}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors text-left"
              >
                {option.type === 'agent' ? (
                  <Bot className="h-4 w-4 text-purple-600 flex-shrink-0" />
                ) : (
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium truncate">
                      {option.name}
                    </span>
                    {option.type === 'agent' && (
                      <span className="text-xs text-purple-600 flex-shrink-0">(AI)</span>
                    )}
                    {option.type === 'self' && (
                      <span className="text-xs text-blue-600 flex-shrink-0">(You)</span>
                    )}
                  </div>
                  {option.email && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {option.email}
                    </div>
                  )}
                </div>
              </button>
            ))}

            {assigneeOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                No assignees available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}