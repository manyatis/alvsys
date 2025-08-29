'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, ChevronDown } from 'lucide-react';
import { Label } from '@/types/card';

interface LabelSelectorProps {
  availableLabels: Label[];
  selectedLabelIds: string[];
  onSelectionChange: (labelIds: string[]) => void;
  onCreateLabel: (name: string, color: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280'
];

export default function LabelSelector({
  availableLabels,
  selectedLabelIds,
  onSelectionChange,
  onCreateLabel
}: LabelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
  }, [isOpen]);

  const selectedLabels = availableLabels.filter(label => selectedLabelIds.includes(label.id));

  const toggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      onSelectionChange(selectedLabelIds.filter(id => id !== labelId));
    } else {
      onSelectionChange([...selectedLabelIds, labelId]);
    }
  };

  const removeLabel = (labelId: string) => {
    onSelectionChange(selectedLabelIds.filter(id => id !== labelId));
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
    <div className="form-group-professional relative" ref={dropdownRef}>
      <label className="form-label-professional">
        Labels
      </label>

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
                border: `1px solid ${label.color}40`
              }}
            >
              {label.name}
              <button
                type="button"
                onClick={() => removeLabel(label.id)}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="select-professional-sm text-left"
      >
        <span className="text-gray-500 dark:text-gray-400">
          {selectedLabels.length === 0 ? 'Select labels...' : `${selectedLabels.length} selected`}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          {/* Available Labels */}
          <div className="p-2">
            {availableLabels.length === 0 ? (
              <p className="text-sm text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
                No labels yet
              </p>
            ) : (
              availableLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center justify-center w-4 h-4 border rounded" style={{ borderColor: 'var(--border-default)' }}>
                    {selectedLabelIds.includes(label.id) && (
                      <Check className="h-3 w-3" style={{ color: 'var(--accent-primary)' }} />
                    )}
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
            <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded transition-colors"
                  style={{ color: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:outline-none"
                    style={{ 
                      background: 'var(--surface-elevated)', 
                      borderColor: 'var(--border-default)', 
                      color: 'var(--text-primary)',
                      '--tw-ring-color': 'var(--accent-primary)'
                    }}
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
                        className="w-6 h-6 rounded border-2"
                        style={{ 
                          backgroundColor: color,
                          borderColor: selectedColor === color 
                            ? 'var(--text-primary)' 
                            : 'var(--border-default)'
                        }}
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
                      className="flex-1 px-2 py-1.5 text-xs border rounded transition-colors"
                      style={{ 
                        color: 'var(--text-secondary)', 
                        borderColor: 'var(--border-default)', 
                        background: 'var(--surface-elevated)' 
                      }}
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
                      className="flex-1 px-2 py-1.5 text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ 
                        background: 'var(--accent-primary)', 
                        color: 'black' 
                      }}
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