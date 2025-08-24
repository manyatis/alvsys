'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Zap,
  FileText,
  TestTube
} from 'lucide-react';
import { CardStatus } from '@/types/card';
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

// Create modal typing content
const CREATE_MODAL_CONTENT = [
  'Add user authentication',
  'Create payment integration', 
  'Build analytics dashboard',
  'Optimize database queries',
  'Mobile responsive design'
];

interface AnimatedBoardDemoProps {
  autoPlay?: boolean;
}

export default function AnimatedBoardDemo({ 
  autoPlay = true
}: AnimatedBoardDemoProps) {
  const [cards, setCards] = useState<Array<{
    id: number;
    title: string;
    description: string;
    priority: number;
    storyPoints: number;
    status: CardStatus;
    position: number; // 0-4 for the 5 columns
  }>>([]);
  const [nextCardId, setNextCardId] = useState(1);
  const [createModalText, setCreateModalText] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  // Continuous create modal typing
  useEffect(() => {
    if (!autoPlay) return;

    let currentTextIndex = 0;
    let currentCharIndex = 0;
    
    const typeInterval = setInterval(() => {
      const currentText = CREATE_MODAL_CONTENT[currentTextIndex];
      
      if (currentCharIndex <= currentText.length) {
        setCreateModalText(currentText.slice(0, currentCharIndex));
        currentCharIndex++;
      } else {
        // Pause at end, then move to next text
        setTimeout(() => {
          currentTextIndex = (currentTextIndex + 1) % CREATE_MODAL_CONTENT.length;
          currentCharIndex = 0;
          setCreateModalText('');
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [autoPlay]);

  // Continuous card creation and movement
  useEffect(() => {
    if (!autoPlay) return;

    // Create new cards periodically
    const createInterval = setInterval(() => {
      const template = DEMO_CARDS[(nextCardId - 1) % DEMO_CARDS.length];
      const newCard = {
        id: nextCardId,
        title: template.title,
        description: template.description,
        priority: template.priority,
        storyPoints: template.storyPoints,
        status: 'REFINEMENT' as CardStatus,
        position: 0
      };
      
      setCards(prev => [...prev, newCard]);
      setNextCardId(prev => prev + 1);
    }, 4000);

    // Move cards through columns
    const moveInterval = setInterval(() => {
      setCards(prev => prev.map(card => {
        const nextPosition = card.position + 1;
        if (nextPosition >= 5) {
          // Remove completed cards
          return null;
        }
        return {
          ...card,
          position: nextPosition,
          status: DEMO_COLUMNS[nextPosition].status
        };
      }).filter(Boolean) as typeof prev);
    }, 2000);

    return () => {
      clearInterval(createInterval);
      clearInterval(moveInterval);
    };
  }, [autoPlay, nextCardId]);

  // Continuous terminal activity
  useEffect(() => {
    if (!autoPlay) return;

    const terminalCommands = [
      'claude-agent pickup task',
      'Found task: "Add authentication"',
      'git checkout -b auth-feature',
      'npm install next-auth',
      'Setting up OAuth providers...',
      'Running tests... ✓',
      'git push origin auth-feature',
      'Task moved to review',
      'Code review approved',
      'git merge auth-feature',
      'Deployment successful ✓',
      'Task completed',
      '---',
      'claude-agent pickup task',
      'Found task: "Create payment integration"',
      'git checkout -b payments',
      'npm install stripe',
      'Setting up webhooks...',
    ];

    let commandIndex = 0;
    const terminalInterval = setInterval(() => {
      const command = terminalCommands[commandIndex % terminalCommands.length];
      
      setTerminalLines(prev => {
        const newLines = [...prev, `$ ${command}`];
        // Keep only last 8 lines
        return newLines.slice(-8);
      });
      
      commandIndex++;
    }, 1500);

    return () => clearInterval(terminalInterval);
  }, [autoPlay]);

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

  // const getPriorityText = (priority: number) => {
  //   switch (priority) {
  //     case 1:
  //       return 'High';
  //     case 2:
  //       return 'Medium';
  //     case 3:
  //       return 'Normal';
  //     case 4:
  //     case 5:
  //       return 'Low';
  //     default:
  //       return 'Normal';
  //   }
  // };

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* Create Modal Area - Top - Always visible */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
          <h3 className="text-xs font-medium text-slate-900 dark:text-white">Create New Issue</h3>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <div className="border border-slate-300 dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-700 min-h-[18px]">
              <span className="text-xs text-slate-900 dark:text-white">
                {createModalText}
                <span className="animate-pulse">|</span>
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">Cancel</button>
            <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
          </div>
        </div>
      </div>

      {/* Kanban Board Area - Middle - Cards moving left to right */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 overflow-hidden">
        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-1 mb-3">
          {DEMO_COLUMNS.map((column) => (
            <div key={column.status} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <column.icon className={`w-2.5 h-2.5 ${column.textColor}`} />
                <span className={`text-xs font-medium ${column.textColor} truncate`}>
                  {column.title}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cards Container */}
        <div className="grid grid-cols-5 gap-1 min-h-[100px]">
          {DEMO_COLUMNS.map((column, columnIndex) => (
            <div key={column.status} className={`${column.bgColor} rounded-lg p-1.5 min-h-[100px]`}>
              {cards.filter(card => card.position === columnIndex).map(card => (
                <div
                  key={card.id}
                  className="bg-white dark:bg-slate-700 rounded p-1.5 shadow-sm mb-1 transition-all duration-500 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-1 py-0.5 rounded font-medium ${getPriorityColor(card.priority)}`}>
                      P{card.priority}
                    </span>
                    <Zap className="w-2 h-2 text-blue-500" />
                  </div>
                  <h4 className="text-xs font-medium text-slate-900 dark:text-white mb-1 truncate">
                    {card.title}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {card.storyPoints} pts
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Area - Bottom - Always active */}
      <div className="bg-black rounded-lg p-3 font-mono text-xs min-h-[120px]">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-2 border-b border-gray-600 pb-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-xs">AI Agent Terminal</span>
        </div>
        
        {/* Terminal Content */}
        <div className="text-green-400 whitespace-pre leading-relaxed">
          {terminalLines.map((line, index) => (
            <div key={index} className="opacity-90 truncate">
              {line}
            </div>
          ))}
          <span className="animate-pulse">▊</span>
        </div>
      </div>
    </div>
  );
}