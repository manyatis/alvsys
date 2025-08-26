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
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-sm md:max-w-md lg:max-w-lg max-h-[85vh] shadow-2xl transform transition-all duration-300 my-4 flex flex-col overflow-y-auto ${
            modalVisible 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Create Issue
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Acceptance Criteria
              </label>
              <textarea
                value={newCard.acceptanceCriteria}
                onChange={(e) => setNewCard({ ...newCard, acceptanceCriteria: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors resize-none"
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

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">AI Agent Access</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Allow AI agents to work on this issue</div>
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
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Assign to @claude</div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">Automatically comment to request @claude work on this issue</div>
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
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="createAnother" className="text-sm text-gray-700 dark:text-gray-300">
                Create another issue after this one
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
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