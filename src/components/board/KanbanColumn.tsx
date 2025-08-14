'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardStatus, Label } from '@/types/card';
import KanbanCard from './KanbanCard';

export interface ColumnConfig {
  status: CardStatus;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: React.ComponentType<{className?: string}>;
}

interface KanbanColumnProps {
  column: ColumnConfig;
  cards: Card[];
  onCreateIssue: (status: CardStatus) => void;
  onCardClick: (card: Card) => void;
  labels: Label[];
  inlineLabelEditorOpen: string | null;
  onToggleLabelEditor: (cardId: string) => void;
  onLabelAdd: (cardId: string, labelId: string) => void;
  onLabelRemove: (cardId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: string) => void;
  onDragStart: (card: Card) => void;
  onDragEnd: () => void;
  onDrop: (status: CardStatus) => void;
  onDragOver: (status: CardStatus) => void;
  onDragLeave: () => void;
  isDraggedOver: boolean;
  draggedCard: Card | null;
  onTouchStart: (card: Card, element: HTMLElement, touch: React.Touch) => void;
}

export default function KanbanColumn({
  column,
  cards,
  onCreateIssue,
  onCardClick,
  labels,
  inlineLabelEditorOpen,
  onToggleLabelEditor,
  onLabelAdd,
  onLabelRemove,
  onCreateLabel,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDragLeave,
  isDraggedOver,
  draggedCard,
  onTouchStart
}: KanbanColumnProps) {
  const Icon = column.icon;

  return (
    <div
      key={column.status}
      data-column-status={column.status}
      className={`w-40 sm:w-48 md:w-56 lg:w-64 min-w-40 sm:min-w-48 md:min-w-56 lg:min-w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border shadow-sm h-full flex flex-col transition-all duration-200 ${
        isDraggedOver 
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-700' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(column.status);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(column.status);
      }}
    >
      <div className={`px-1.5 sm:px-2 md:px-3 py-2 border-b border-gray-200 dark:border-gray-700 ${column.bgColor} flex-shrink-0 rounded-t-xl md:rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 dark:text-gray-300" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
              {column.title}
            </span>
            <span className={`px-1 sm:px-1.5 py-0.5 text-xs font-medium rounded-full bg-white dark:bg-gray-700 ${column.textColor} dark:text-gray-300 flex-shrink-0`}>
              {cards.length}
            </span>
          </div>
          <button
            onClick={() => onCreateIssue(column.status)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded transition-all duration-200"
          >
            <Plus className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Cards Container */}
      <div 
        className="flex-1 p-1.5 sm:p-2 md:p-3 overflow-y-auto min-h-32 relative group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
        onDoubleClick={() => onCreateIssue(column.status)}
        title="Double-click to create new issue"
      >
        {cards.map((card) => {
          return (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={onCardClick}
              labels={labels}
              inlineLabelEditorOpen={inlineLabelEditorOpen}
              onToggleLabelEditor={onToggleLabelEditor}
              onLabelAdd={onLabelAdd}
              onLabelRemove={onLabelRemove}
              onCreateLabel={onCreateLabel}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggedCard?.id === card.id}
              onTouchStart={onTouchStart}
            />
          );
        })}
        
        {cards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">No cards</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Double-click to create new issue</p>
            <button
              onClick={() => onCreateIssue(column.status)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Create first card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}