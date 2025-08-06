'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, ChevronDown } from 'lucide-react';
import { Label } from '@/types/card';

interface InlineLabelEditorProps {
  availableLabels: Label[];
  selectedLabelIds: string[];
  onLabelAdd: (labelId: string) => Promise<void>;
  onLabelRemove: (labelId: string) => Promise<void>;
  onCreateLabel: (name: string, color: string) => Promise<void>;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280'
];

export default function InlineLabelEditor({
  availableLabels,
  selectedLabelIds,
  onLabelAdd,
  onLabelRemove,
  onCreateLabel,
  isOpen,
  onToggle,
  onClose
}: InlineLabelEditorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
        setShowCreateForm(false);
        setNewLabelName('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLabelToggle = async (labelId: string) => {
    setIsUpdating(labelId);
    try {
      if (selectedLabelIds.includes(labelId)) {
        await onLabelRemove(labelId);
      } else {
        await onLabelAdd(labelId);
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateLabel(newLabelName.trim(), selectedColor);
      setNewLabelName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating label:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* Available Labels */}
          <div className="p-2">
            {availableLabels.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No labels yet
              </p>
            ) : (
              availableLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => handleLabelToggle(label.id)}
                  disabled={isUpdating === label.id}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-center w-4 h-4 border border-gray-300 dark:border-gray-600 rounded">
                    {isUpdating === label.id ? (
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : selectedLabelIds.includes(label.id) ? (
                      <Check className="h-3 w-3 text-blue-600" />
                    ) : null}
                  </div>
                  <span
                    className="flex-1 text-left px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: label.color + '20',
                      color: label.color,
                      border: `1px solid ${label.color}40`
                    }}
                  >
                    {label.name}
                  </span>
                </button>
              ))
            )}

            {/* Create New Label */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create new label
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateLabel();
                      }
                    }}
                  />
                  
                  {/* Color Picker */}
                  <div className="grid grid-cols-6 gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedColor(color);
                        }}
                        className={`w-6 h-6 rounded border-2 ${
                          selectedColor === color 
                            ? 'border-gray-400 dark:border-gray-300' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowCreateForm(false);
                        setNewLabelName('');
                      }}
                      className="flex-1 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateLabel();
                      }}
                      disabled={!newLabelName.trim() || isCreating}
                      className="flex-1 px-2 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}