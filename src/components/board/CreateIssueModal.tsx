'use client';

import { Loader2 } from 'lucide-react';
import { CardStatus, Label } from '@/types/card';
import LabelSelector from '@/components/LabelSelector';
import AssigneeSelector from '@/components/AssigneeSelector';
import SprintSelector from '@/components/SprintSelector';
import { OrganizationMember } from '@/utils/board-utils';
import { Sprint } from '@/hooks/useSprints';

interface NewCard {
  title: string;
  description: string;
  acceptanceCriteria: string;
  status: CardStatus;
  priority: number;
  effortPoints: number;
  isAiAllowedTask: boolean;
  assigneeId: string | null;
  labelIds: string[];
  sprintId: string | null;
  assignToClaudeOnCreate?: boolean;
}

interface CreateIssueModalProps {
  showModal: boolean;
  modalVisible: boolean;
  newCard: NewCard;
  setNewCard: (card: NewCard) => void;
  createAnother: boolean;
  setCreateAnother: (value: boolean) => void;
  isCreating: boolean;
  labels: Label[];
  organizationMembers: OrganizationMember[];
  currentUserId: string | null;
  sprints: Sprint[];
  statusColumns: Array<{
    status: CardStatus;
    title: string;
    color: string;
    bgColor: string;
    textColor: string;
    icon: React.ComponentType<{className?: string}>;
  }>;
  onClose: () => void;
  onCreate: (e: React.FormEvent) => void;
  onCreateLabel: (name: string, color: string) => Promise<void>;
}

export default function CreateIssueModal({
  showModal,
  modalVisible,
  newCard,
  setNewCard,
  createAnother,
  setCreateAnother,
  isCreating,
  labels,
  organizationMembers,
  currentUserId,
  sprints,
  statusColumns,
  onClose,
  onCreate,
  onCreateLabel,
}: CreateIssueModalProps) {
  if (!showModal) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          modalVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
        <div
          className={`rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-sm md:max-w-md lg:max-w-lg max-h-[85vh] shadow-2xl transform transition-all duration-300 my-4 flex flex-col overflow-y-auto ${
            modalVisible 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
          style={{ background: 'var(--surface-elevated)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Create Issue
            </h2>
            <button 
              onClick={onClose}
              className="transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1">
            <form onSubmit={onCreate} className="space-y-4">
              <div className="form-group-professional">
                <label className="form-label-professional form-label-professional-required">
                  Summary
                </label>
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  className="input-professional"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="form-group-professional">
                <label className="form-label-professional">
                  Description
                </label>
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  className="textarea-professional"
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="form-group-professional">
                  <label className="form-label-professional">
                    Status
                  </label>
                  <select
                    value={newCard.status}
                    onChange={(e) => setNewCard({ ...newCard, status: e.target.value as CardStatus })}
                    className="select-professional-sm"
                  >
                    {statusColumns.map((col) => (
                      <option key={col.status} value={col.status}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-professional">
                  <label className="form-label-professional">
                    Priority
                  </label>
                  <select
                    value={newCard.priority}
                    onChange={(e) => setNewCard({ ...newCard, priority: parseInt(e.target.value) })}
                    className="select-professional-sm"
                  >
                    <option value={1}>Highest</option>
                    <option value={2}>High</option>
                    <option value={3}>Medium</option>
                    <option value={4}>Low</option>
                    <option value={5}>Lowest</option>
                  </select>
                </div>

                <div className="form-group-professional">
                  <label className="form-label-professional">
                    Effort Points
                  </label>
                  <select
                    value={newCard.effortPoints}
                    onChange={(e) => setNewCard({ ...newCard, effortPoints: parseInt(e.target.value) })}
                    className="select-professional-sm"
                  >
                    <option value={1}>1 point</option>
                    <option value={3}>3 points</option>
                    <option value={5}>5 points</option>
                    <option value={8}>8 points</option>
                  </select>
                </div>
              </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Acceptance Criteria
              </label>
              <textarea
                value={newCard.acceptanceCriteria}
                onChange={(e) => setNewCard({ ...newCard, acceptanceCriteria: e.target.value })}
                className="textarea-professional"
                rows={3}
                placeholder="Define what done means..."
              />
            </div>

            <div>
              <LabelSelector
                availableLabels={labels}
                selectedLabelIds={newCard.labelIds}
                onSelectionChange={(labelIds) => setNewCard({ ...newCard, labelIds })}
                onCreateLabel={onCreateLabel}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AssigneeSelector
                  currentUserId={currentUserId || undefined}
                  organizationMembers={organizationMembers}
                  selectedAssigneeId={newCard.assigneeId || undefined}
                  onSelectionChange={(assigneeId) => setNewCard({ ...newCard, assigneeId })}
                  isAiAllowedTask={newCard.isAiAllowedTask}
                />
              </div>

              <div>
                <SprintSelector
                  sprints={sprints}
                  selectedSprintId={newCard.sprintId}
                  onSelectionChange={(sprintId) => setNewCard({ ...newCard, sprintId })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI Agent Access</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Allow AI agents to work on this issue</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCard.isAiAllowedTask}
                  onChange={(e) => setNewCard({ ...newCard, isAiAllowedTask: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {newCard.isAiAllowedTask && (
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-primary)' }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>Assign to @claude</div>
                  <div className="text-xs" style={{ color: 'var(--accent-secondary)' }}>Automatically comment to request @claude work on this issue</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCard.assignToClaudeOnCreate || false}
                    onChange={(e) => setNewCard({ ...newCard, assignToClaudeOnCreate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}

            <div className="flex items-center gap-2 p-3">
              <input
                type="checkbox"
                id="createAnother"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="w-4 h-4 accent-green-500"
              />
              <label htmlFor="createAnother" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Create another issue after this one
              </label>
            </div>

            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-professional-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="btn-professional-primary flex items-center justify-center gap-2"
              >
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCreating ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </>
  );
}