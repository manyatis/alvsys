'use client';

import { X, Loader2, Send, MessageCircle, Bot } from 'lucide-react';
import { Card, CardStatus, Label, Comment } from '@/types/card';
import LabelSelector from '@/components/LabelSelector';
import AssigneeSelector from '@/components/AssigneeSelector';
import SprintSelector from '@/components/SprintSelector';
import { OrganizationMember, getInitials, formatCommentDate } from '@/utils/board-utils';
import { Sprint } from '@/hooks/useSprints';

interface EditIssueModalProps {
  showModal: boolean;
  modalVisible: boolean;
  selectedCard: Card;
  setSelectedCard: (card: Card) => void;
  selectedCardLabelIds: string[];
  setSelectedCardLabelIds: (labelIds: string[]) => void;
  selectedCardAssigneeId: string | null;
  setSelectedCardAssigneeId: (assigneeId: string | null) => void;
  isUpdating: boolean;
  comments: Comment[];
  loadingComments: boolean;
  newComment: string;
  setNewComment: (comment: string) => void;
  isAddingComment: boolean;
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
  onUpdate: (e: React.FormEvent) => void;
  onAddComment: (e: React.FormEvent) => void;
  onCreateLabel: (name: string, color: string) => Promise<void>;
  onEngageClaudeFlow?: () => void;
  isEngagingClaudeFlow?: boolean;
}

export default function EditIssueModal({
  showModal,
  modalVisible,
  selectedCard,
  setSelectedCard,
  selectedCardLabelIds,
  setSelectedCardLabelIds,
  selectedCardAssigneeId,
  setSelectedCardAssigneeId,
  isUpdating,
  comments,
  loadingComments,
  newComment,
  setNewComment,
  isAddingComment,
  labels,
  organizationMembers,
  currentUserId,
  sprints,
  statusColumns,
  onClose,
  onUpdate,
  onAddComment,
  onCreateLabel,
  onEngageClaudeFlow,
  isEngagingClaudeFlow = false,
}: EditIssueModalProps) {
  if (!showModal || !selectedCard) return null;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className={`bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-h-[85vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${
            modalVisible 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={onUpdate} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Issue</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Summary *
              </label>
              <input
                type="text"
                value={selectedCard.title}
                onChange={(e) => setSelectedCard({ ...selectedCard, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={selectedCard.status}
                    onChange={(e) => setSelectedCard({ ...selectedCard, status: e.target.value as CardStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                  >
                    {statusColumns.map((col) => (
                      <option key={col.status} value={col.status}>
                        {col.title}
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

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={selectedCard.priority}
                    onChange={(e) => setSelectedCard({ ...selectedCard, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <option value={1}>Highest</option>
                    <option value={2}>High</option>
                    <option value={3}>Medium</option>
                    <option value={4}>Low</option>
                    <option value={5}>Lowest</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Effort Points
                </label>
                <div className="relative">
                  <select
                    value={selectedCard.storyPoints}
                    onChange={(e) => setSelectedCard({ ...selectedCard, storyPoints: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <option value={1}>1 point</option>
                    <option value={3}>3 points</option>
                    <option value={5}>5 points</option>
                    <option value={8}>8 points</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={selectedCard.description || ''}
                onChange={(e) => setSelectedCard({ ...selectedCard, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors resize-none"
                placeholder="Add a description..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Acceptance Criteria
              </label>
              <textarea
                value={selectedCard.acceptanceCriteria || ''}
                onChange={(e) => setSelectedCard({ ...selectedCard, acceptanceCriteria: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors resize-none"
                placeholder="Define what done means..."
              />
            </div>

            <div>
              <LabelSelector
                availableLabels={labels}
                selectedLabelIds={selectedCardLabelIds}
                onSelectionChange={setSelectedCardLabelIds}
                onCreateLabel={onCreateLabel}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <AssigneeSelector
                  currentUserId={currentUserId || undefined}
                  organizationMembers={organizationMembers}
                  selectedAssigneeId={selectedCardAssigneeId || undefined}
                  onSelectionChange={setSelectedCardAssigneeId}
                  isAiAllowedTask={selectedCard?.isAiAllowedTask || false}
                />
              </div>

              <div>
                <SprintSelector
                  sprints={sprints}
                  selectedSprintId={selectedCard.sprintId || null}
                  onSelectionChange={(sprintId) => setSelectedCard({ ...selectedCard, sprintId: sprintId || undefined })}
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
                  checked={selectedCard.isAiAllowedTask}
                  onChange={(e) => setSelectedCard({ ...selectedCard, isAiAllowedTask: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Engage Claude Flow Button */}
            {selectedCard.isAiAllowedTask && onEngageClaudeFlow && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <button
                  type="button"
                  onClick={onEngageClaudeFlow}
                  disabled={isEngagingClaudeFlow}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-800/50 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isEngagingClaudeFlow ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Engaging @claude...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      Engage @claude GitHub Flow
                    </>
                  )}
                </button>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 text-center">
                  Ask @claude to work on this issue via GitHub comment
                </p>
              </div>
            )}

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
                disabled={isUpdating}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUpdating ? 'Updating...' : 'Update Issue'}
              </button>
            </div>
          </form>
          
          {/* Comments Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h3>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                  No comments yet
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="flex-shrink-0">
                      {comment.isAiComment ? (
                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">
                          AI
                        </div>
                      ) : (
                        <div 
                          className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-medium"
                          title={comment.author?.name || comment.author?.email || 'Unknown'}
                        >
                          {getInitials(comment.author?.email || null, comment.author?.name || null)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {comment.isAiComment 
                            ? 'AI Agent' 
                            : (comment.author?.name || comment.author?.email?.split('@')[0] || 'Unknown')
                          }
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={onAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isAddingComment}
                className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                {isAddingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}