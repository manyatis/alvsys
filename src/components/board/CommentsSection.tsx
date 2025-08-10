'use client';

import React from 'react';
import { MessageCircle, Loader2, Send } from 'lucide-react';
import { Comment } from '@/types/card';
import { getInitials, formatCommentDate } from '@/utils/board-utils';

interface CommentsSectionProps {
  comments: Comment[];
  loadingComments: boolean;
  newComment: string;
  onNewCommentChange: (comment: string) => void;
  onAddComment: (e: React.FormEvent) => void;
  isAddingComment: boolean;
}

export default function CommentsSection({
  comments,
  loadingComments,
  newComment,
  onNewCommentChange,
  onAddComment,
  isAddingComment
}: CommentsSectionProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
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

      {/* Add Comment Form */}
      <form onSubmit={onAddComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => onNewCommentChange(e.target.value)}
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
  );
}