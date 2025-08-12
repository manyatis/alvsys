'use client';

import React from 'react';
import { MoreVertical, Bot } from 'lucide-react';
import { Card, Label } from '@/types/card';
import { getPriorityColor, getInitials } from '@/utils/board-utils';
import InlineLabelEditor from '@/components/InlineLabelEditor';

interface KanbanCardProps {
  card: Card;
  onClick: (card: Card) => void;
  labels: Label[];
  inlineLabelEditorOpen: string | null;
  onToggleLabelEditor: (cardId: string) => void;
  onLabelAdd: (cardId: string, labelId: string) => void;
  onLabelRemove: (cardId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: string) => void;
  onDragStart: (card: Card) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  onTouchStart: (card: Card, element: HTMLElement, touch: React.Touch) => void;
}

export default function KanbanCard({
  card,
  onClick,
  labels,
  inlineLabelEditorOpen,
  onToggleLabelEditor,
  onLabelAdd,
  onLabelRemove,
  onCreateLabel,
  onDragStart,
  onDragEnd,
  isDragging,
  onTouchStart
}: KanbanCardProps) {
  const [dragStarted, setDragStarted] = React.useState(false);


  const handleClick = () => {
    if (!dragStarted) {
      onClick(card);
    }
    setDragStarted(false);
  };

  return (
    <div
      key={card.id}
      className={`group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-2 md:p-3 mb-2 cursor-move hover:shadow-sm dark:hover:bg-gray-600 transition-all duration-200 select-none ${
        isDragging ? 'opacity-50 scale-105 rotate-2' : ''
      }`}
      onClick={handleClick}
      draggable="true"
      onDragStart={(e) => {
        e.stopPropagation();
        setDragStarted(true);
        
        // Set drag data
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.id);
        
        onDragStart(card);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEnd();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        const element = e.currentTarget as HTMLElement;
        onTouchStart(card, element, touch);
      }}
    >
      <div className="flex justify-between items-start pointer-events-none">
        <h4 className="text-sm md:text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {card.title}
        </h4>
        <button 
          className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-opacity pointer-events-auto"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreVertical className="h-3 w-3" />
        </button>
      </div>
      
      {card.description && (
        <p className="text-sm md:text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1 pointer-events-none">
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