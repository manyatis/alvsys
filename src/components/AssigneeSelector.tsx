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
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
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
      } else {
        // If current user is not found in organization members, still add "Assign to me" option
        // This handles edge cases where the user might not be in the fetched members list
        options.push({
          id: currentUserId,
          name: 'Assign to me',
          type: 'self'
        });
      }
    } else {
      // If no currentUserId but we have organization members, show all members
      // This ensures users can still assign tasks even if currentUserId is not set
      console.debug('AssigneeSelector: No currentUserId provided');
    }

    // Add organization members (excluding the current user to avoid duplication)
    organizationMembers.forEach(member => {
      if (member.id !== currentUserId) {
        options.push({
          id: member.id,
          name: member.name || member.email.split('@')[0] || 'Unknown User',
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
    <div className="form-group-professional relative" ref={dropdownRef}>
      <label className="form-label-professional">
        Assignee
      </label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="select-professional-sm text-left"
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
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div className="p-1">
            {/* Clear selection option */}
            <button
              type="button"
              onClick={clearAssignee}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors text-left"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="w-4 h-4" /> {/* Spacer for alignment */}
              <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>
            </button>

            {/* Separator */}
            <div className="my-1" style={{ borderTop: '1px solid var(--border-subtle)' }}></div>

            {/* Assignee options */}
            {assigneeOptions.map((option) => (
              <button
                key={`${option.type}-${option.id}`}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors text-left"
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {option.type === 'agent' ? (
                  <Bot className="h-4 w-4 text-purple-600 flex-shrink-0" />
                ) : (
                  <User className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {option.name}
                    </span>
                    {option.type === 'agent' && (
                      <span className="text-xs text-purple-600 flex-shrink-0">(AI)</span>
                    )}
                    {option.type === 'self' && (
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--accent-primary)' }}>(You)</span>
                    )}
                  </div>
                  {option.email && (
                    <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {option.email}
                    </div>
                  )}
                </div>
              </button>
            ))}

            {assigneeOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                No assignees available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}