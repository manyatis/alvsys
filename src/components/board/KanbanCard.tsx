'use client';

import React from 'react';
import { MoreVertical, Bot } from 'lucide-react';
import { Card, Label } from '@/types/card';
import { getPriorityColor, getInitials } from '@/utils/board-utils';
import InlineLabelEditor from '@/components/InlineLabelEditor';

interface KanbanCardProps {
  card: Card;
  onClick: (card: Card) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>, card: Card) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  isDragged: boolean;
  isTouched: boolean;
  labels: Label[];
  inlineLabelEditorOpen: string | null;
  onToggleLabelEditor: (cardId: string) => void;
  onLabelAdd: (cardId: string, labelId: string) => void;
  onLabelRemove: (cardId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: string) => void;
}

export default function KanbanCard({
  card,
  onClick,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isDragged,
  isTouched,
  labels,
  inlineLabelEditorOpen,
  onToggleLabelEditor,
  onLabelAdd,
  onLabelRemove,
  onCreateLabel
}: KanbanCardProps) {
  return (
    <div
      key={card.id}
      data-card-id={card.id}
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onTouchStart={(e) => onTouchStart(e, card)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-2 md:p-3 mb-2 cursor-pointer hover:shadow-sm dark:hover:bg-gray-600 transition-all duration-200 select-none ${
        isDragged 
          ? 'opacity-50 transform rotate-2 shadow-lg z-50' 
          : isTouched 
            ? 'opacity-70 transform scale-105 shadow-md z-40' 
            : ''
      }`}
      style={{
        transform: isDragged 
          ? 'rotate(3deg) scale(1.02)' 
          : isTouched 
            ? 'scale(1.02)' 
            : undefined
      }}
      onClick={() => onClick(card)}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-sm md:text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {card.title}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-opacity">
          <MoreVertical className="h-3 w-3" />
        </button>
      </div>
      
      {card.description && (
        <p className="text-sm md:text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
          {card.description}
        </p>
      )}

      {/* Labels */}
      <div className="flex flex-wrap gap-1 mb-2 items-center">
        {card.labels && card.labels.slice(0, 3).map((cardLabel) => (
          <button
            key={cardLabel.id}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLabelEditor(card.id);
            }}
            className="px-1.5 py-0.5 text-xs rounded-full text-white font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: cardLabel.label.color }}
          >
            {cardLabel.label.name}
          </button>
        ))}
        {card.labels && card.labels.length > 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLabelEditor(card.id);
            }}
            className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            +{card.labels.length - 3}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLabelEditor(card.id);
          }}
          className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition-all flex items-center justify-center text-xs font-bold"
        >
          +
        </button>

        {inlineLabelEditorOpen === card.id && (
          <InlineLabelEditor
            availableLabels={labels}
            selectedLabelIds={card.labels?.map(cl => cl.labelId) || []}
            onLabelAdd={async (labelId) => onLabelAdd(card.id, labelId)}
            onLabelRemove={async (labelId) => onLabelRemove(card.id, labelId)}
            onCreateLabel={async (name, color) => onCreateLabel(name, color)}
            isOpen={true}
            onToggle={() => {}}
            onClose={() => onToggleLabelEditor('')}
          />
        )}
      </div>

      {/* Bottom row - Priority, Effort, AI Badge, Assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Priority badge */}
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded border ${getPriorityColor(card.priority)}`}>
            P{card.priority}
          </span>
          
          {/* Effort Points badge */}
          <span className="px-1.5 py-0.5 text-xs font-medium rounded border bg-blue-100 text-blue-600 border-blue-200">
            {card.effortPoints}pt
          </span>
          
          {/* AI Allowed Task badge */}
          {card.isAiAllowedTask && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded border bg-purple-100 text-purple-600 border-purple-200">
              <Bot className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">AI</span>
            </div>
          )}
        </div>
        
        {/* Assignee (currently showing creator) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {card.createdBy && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {getInitials(card.createdBy.email || null, card.createdBy.name || null)}
              </div>
              <span className="hidden sm:inline truncate max-w-16">
                {card.createdBy.name || card.createdBy.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}