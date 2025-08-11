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
  dragOverColumn: CardStatus | null;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, status: CardStatus) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: CardStatus) => void;
  draggedCard: Card | null;
  touchStartCard: Card | null;
  isDragging: boolean;
  onCardTouchStart: (e: React.TouchEvent<HTMLDivElement>, card: Card) => void;
  onCardTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onCardTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  labels: Label[];
  inlineLabelEditorOpen: string | null;
  onToggleLabelEditor: (cardId: string) => void;
  onLabelAdd: (cardId: string, labelId: string) => void;
  onLabelRemove: (cardId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: string) => void;
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  onCardDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function KanbanColumn({
  column,
  cards,
  onCreateIssue,
  onCardClick,
  dragOverColumn,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedCard,
  touchStartCard,
  isDragging,
  onCardTouchStart,
  onCardTouchMove,
  onCardTouchEnd,
  labels,
  inlineLabelEditorOpen,
  onToggleLabelEditor,
  onLabelAdd,
  onLabelRemove,
  onCreateLabel,
  onCardDragStart,
  onCardDragEnd
}: KanbanColumnProps) {
  const Icon = column.icon;

  return (
    <div
      key={column.status}
      className="w-48 sm:w-56 md:w-64 min-w-48 sm:min-w-56 md:min-w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col"
    >
      <div className={`px-2 md:px-3 py-2 border-b border-gray-200 dark:border-gray-700 ${column.bgColor} flex-shrink-0 rounded-t-xl md:rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
            <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200">
              {column.title}
            </span>
            <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full bg-white dark:bg-gray-700 ${column.textColor} dark:text-gray-300`}>
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
        className={`flex-1 p-2 md:p-3 overflow-y-auto min-h-32 ${
          dragOverColumn === column.status && !isDragging
            ? 'bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-300 dark:border-blue-600'
            : ''
        }`}
        data-column-status={column.status}
        onDragOver={(e) => onDragOver(e, column.status)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, column.status)}
        onDragEnter={(e) => {
          // Prevent default to allow drop
          e.preventDefault();
          e.stopPropagation();
        }}
        // Additional attributes for better browser support
        style={{
          minHeight: '8rem',
          position: 'relative'
        }}
      >
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onClick={onCardClick}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            isDragged={draggedCard?.id === card.id}
            isTouched={touchStartCard?.id === card.id && isDragging}
            onTouchStart={onCardTouchStart}
            onTouchMove={onCardTouchMove}
            onTouchEnd={onCardTouchEnd}
            labels={labels}
            inlineLabelEditorOpen={inlineLabelEditorOpen}
            onToggleLabelEditor={onToggleLabelEditor}
            onLabelAdd={onLabelAdd}
            onLabelRemove={onLabelRemove}
            onCreateLabel={onCreateLabel}
          />
        ))}
        
        {cards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">No cards</p>
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