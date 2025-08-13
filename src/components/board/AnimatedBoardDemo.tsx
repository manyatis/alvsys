'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Zap,
  FileText,
  TestTube,
  Rocket
} from 'lucide-react';
import { CardStatus, Card } from '@/types/card';
import { ColumnConfig } from './KanbanColumn';

// Demo card templates
const DEMO_CARDS = [
  {
    title: "Add user authentication",
    description: "Implement OAuth login with Google and GitHub",
    priority: 1, // 1 = High priority
    storyPoints: 5,
  },
  {
    title: "Create payment integration", 
    description: "Set up Stripe payments for premium subscriptions",
    priority: 2, // 2 = Medium priority
    storyPoints: 8,
  },
  {
    title: "Build analytics dashboard",
    description: "Real-time user metrics and engagement tracking",
    priority: 1, // 1 = High priority
    storyPoints: 13,
  },
  {
    title: "Optimize database queries",
    description: "Improve performance for large datasets", 
    priority: 3, // 3 = Medium-low priority
    storyPoints: 3,
  },
  {
    title: "Mobile responsive design",
    description: "Ensure app works perfectly on all devices",
    priority: 4, // 4 = Lower priority
    storyPoints: 5,
  }
];

// Column configurations matching the main board
const DEMO_COLUMNS: ColumnConfig[] = [
  {
    status: 'REFINEMENT' as CardStatus,
    title: 'Refinement',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: FileText,
  },
  {
    status: 'READY' as CardStatus,
    title: 'To Do',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: Clock,
  },
  {
    status: 'IN_PROGRESS' as CardStatus,
    title: 'In Progress',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: RefreshCw,
  },
  {
    status: 'READY_FOR_REVIEW' as CardStatus,
    title: 'Review',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900',
    textColor: 'text-purple-700 dark:text-purple-300',
    icon: TestTube,
  },
  {
    status: 'COMPLETED' as CardStatus,
    title: 'Done',
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
    icon: CheckCircle,
  },
];

interface AnimatedCard extends Omit<Card, 'createdAt' | 'updatedAt' | 'agentInstructions'> {
  animationKey: string;
  isAnimating: boolean;
  agentInstructions: never[]; // Empty array for demo
}

interface AnimatedBoardDemoProps {
  autoPlay?: boolean;
  speed?: number; // milliseconds between transitions
  showControls?: boolean;
}

export default function AnimatedBoardDemo({ 
  autoPlay = true, 
  speed = 3000,
  showControls = true 
}: AnimatedBoardDemoProps) {
  const [cards, setCards] = useState<AnimatedCard[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);

  // Create a new card
  const createCard = useCallback((index: number) => {
    const template = DEMO_CARDS[index % DEMO_CARDS.length];
    const newCard: AnimatedCard = {
      id: `demo-card-${index}`,
      animationKey: `${index}-${Date.now()}`,
      title: template.title,
      description: template.description,
      status: 'REFINEMENT' as CardStatus,
      priority: template.priority,
      storyPoints: template.storyPoints,
      projectId: 'demo-project',
      assigneeId: undefined,
      sprintId: undefined,
      isAiAllowedTask: true,
      agentInstructions: [],
      isAnimating: true,
    };

    setCards(prev => [...prev, newCard]);
    return newCard.id;
  }, []);

  // Move card to next status
  const moveCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;

      const currentIndex = DEMO_COLUMNS.findIndex(col => col.status === card.status);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex >= DEMO_COLUMNS.length) {
        // Remove completed cards after a delay
        setTimeout(() => {
          setCards(prev => prev.filter(c => c.id !== cardId));
        }, 2000);
        return card;
      }

      return {
        ...card,
        status: DEMO_COLUMNS[nextIndex].status,
        isAnimating: true,
      };
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (animationStep % 2 === 0) {
        // Create new card
        createCard(currentCardIndex);
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // Move existing cards
        setCards(prev => {
          const cardsToMove = prev.filter(card => card.status !== 'COMPLETED');
          if (cardsToMove.length > 0) {
            const cardToMove = cardsToMove[0]; // Move the oldest card
            moveCard(cardToMove.id);
          }
          return prev;
        });
      }
      
      setAnimationStep(prev => prev + 1);
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, animationStep, currentCardIndex, speed, createCard, moveCard]);

  // Stop animation after a delay
  useEffect(() => {
    setCards(prev => prev.map(card => ({
      ...card,
      isAnimating: false
    })));
  }, [cards]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 2:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 3:
      case 4:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1:
        return 'High';
      case 2:
        return 'Medium';
      case 3:
        return 'Normal';
      case 4:
      case 5:
        return 'Low';
      default:
        return 'Normal';
    }
  };

  return (
    <div className="relative">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isPlaying ? <Zap className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
            {isPlaying ? 'Pause Demo' : 'Start Demo'}
          </button>
          
          <button
            onClick={() => {
              setCards([]);
              setCurrentCardIndex(0);
              setAnimationStep(0);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Cards: {cards.length} | Speed: {speed/1000}s
          </div>
        </div>
      )}

      {/* Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {DEMO_COLUMNS.map((column) => {
          const columnCards = cards.filter(card => card.status === column.status);
          
          return (
            <div
              key={column.status}
              className={`rounded-lg p-4 min-h-[400px] ${column.bgColor} border border-slate-200 dark:border-slate-700`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <column.icon className={`w-5 h-5 ${column.textColor}`} />
                  <h3 className={`font-semibold ${column.textColor}`}>
                    {column.title}
                  </h3>
                  <span className={`w-6 h-6 rounded-full ${column.color} text-white text-xs flex items-center justify-center font-medium`}>
                    {columnCards.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnCards.map((card) => (
                  <div
                    key={`${card.id}-${card.animationKey}`}
                    className={`p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:shadow-md transition-all duration-500 ${
                      card.isAnimating ? 'animate-pulse scale-105' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                        {card.title}
                      </h4>
                      {card.isAiAllowedTask && (
                        <div className="flex-shrink-0 ml-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {card.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(card.priority)}`}>
                        {getPriorityText(card.priority)}
                      </span>
                      
                      {card.storyPoints && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {card.storyPoints} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              AI-Powered Workflow Demo
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Watch as VibeHero creates tasks and AI agents automatically move them through your development workflow. 
              Each card with a ⚡ icon can be processed by AI agents autonomously.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}