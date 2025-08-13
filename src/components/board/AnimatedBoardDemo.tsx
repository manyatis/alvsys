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

// Terminal commands for different phases
const TERMINAL_COMMANDS = [
  { // REFINEMENT -> READY
    commands: [
      '$ claude-agent pickup task',
      'Found task: "Add user authentication"',
      '$ analyzing requirements...',
      'Planning OAuth implementation',
      'Ready to start development ✓'
    ]
  },
  { // READY -> IN_PROGRESS  
    commands: [
      '$ git checkout -b auth-feature',
      'Switched to new branch "auth-feature"',
      '$ npm install next-auth',
      'Installing authentication packages...',
      'Setting up OAuth providers...'
    ]
  },
  { // IN_PROGRESS -> BLOCKED
    commands: [
      '$ implementing auth routes...',
      'Creating login components...',
      'ERROR: Missing Google OAuth credentials',
      '$ updating status to BLOCKED',
      'Waiting for API keys from team'
    ]
  },
  { // BLOCKED -> READY_FOR_REVIEW
    commands: [
      '$ received OAuth credentials',
      'Configuring authentication...',
      '$ npm run test',
      'All tests passing ✓',
      '$ git push origin auth-feature',
      'Ready for code review'
    ]
  },
  { // READY_FOR_REVIEW -> COMPLETED
    commands: [
      '$ code review approved',
      '$ git checkout main',
      '$ git merge auth-feature',
      'Deployment successful ✓',
      'Task completed successfully'
    ]
  }
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
  speed?: number; // milliseconds between transitions
}

export default function AnimatedBoardDemo({ 
  autoPlay = true, 
  speed = 3000
}: AnimatedBoardDemoProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalText, setCreateModalText] = useState('');
  const [isTypingCreate, setIsTypingCreate] = useState(false);

  // Typewriter effect for create modal
  const typeCreateModal = (text: string) => {
    setShowCreateModal(true);
    setIsTypingCreate(true);
    setCreateModalText('');
    
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setCreateModalText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTypingCreate(false);
        
        // Hide create modal after completion
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateModalText('');
        }, 1000);
      }
    }, 80); // Typing speed for create modal
  };

  // Typewriter effect for terminal
  const typeText = (commands: string[]) => {
    setShowTerminal(true);
    setIsTyping(true);
    setTerminalText('');
    
    let fullText = '';
    let currentIndex = 0;
    
    // Build full text with line breaks
    commands.forEach((command, index) => {
      if (index > 0) fullText += '\n';
      fullText += command;
    });
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTerminalText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        // Hide terminal after completion
        setTimeout(() => {
          setShowTerminal(false);
          setTerminalText('');
        }, 1000);
      }
    }, 50); // Typing speed
  };

  // Single card animation - cycle through cards and their statuses
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      // Show create modal at the beginning of each new card
      if (currentStatusIndex === 0) {
        const nextCardText = CREATE_MODAL_CONTENT[currentCardIndex % CREATE_MODAL_CONTENT.length];
        typeCreateModal(nextCardText);
      }
      
      // Show terminal work before status change (except for first status)
      if (currentStatusIndex > 0 && currentStatusIndex < DEMO_COLUMNS.length && TERMINAL_COMMANDS[currentStatusIndex - 1]) {
        typeText(TERMINAL_COMMANDS[currentStatusIndex - 1].commands);
      }
      
      // Wait for animations to finish, then update status
      setTimeout(() => {
        setCurrentStatusIndex(prev => {
          const nextStatusIndex = prev + 1;
          
          // If we've completed all statuses for current card, move to next card
          if (nextStatusIndex >= DEMO_COLUMNS.length) {
            setCurrentCardIndex(prevCard => (prevCard + 1) % DEMO_CARDS.length);
            return 0; // Reset to first status
          }
          
          return nextStatusIndex;
        });
      }, currentStatusIndex === 0 ? 2500 : (currentStatusIndex > 0 ? 3000 : 0)); // Different delays for create vs terminal
    }, speed);

    return () => clearInterval(interval);
  }, [autoPlay, speed, currentStatusIndex, currentCardIndex]);

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

  // Get current card and status
  const currentCard = DEMO_CARDS[currentCardIndex];
  const currentStatus = DEMO_COLUMNS[currentStatusIndex];

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* Create Modal Area - Top */}
      <div className="min-h-[120px]">
        {showCreateModal && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Create New Issue</h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Form Content */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <div className="border border-slate-300 dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-700 min-h-[20px]">
                  <span className="text-sm text-slate-900 dark:text-white">
                    {createModalText}
                    {isTypingCreate && <span className="animate-pulse">|</span>}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400">Cancel</button>
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Card Area - Middle */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 min-h-[160px]">
        {/* Current Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <currentStatus.icon className={`w-4 h-4 ${currentStatus.textColor}`} />
            <span className={`text-xs font-medium ${currentStatus.textColor} px-2 py-1 rounded-full ${currentStatus.bgColor}`}>
              {currentStatus.title}
            </span>
          </div>
          <Zap className="w-4 h-4 text-blue-500" />
        </div>

        {/* Card Content */}
        <div className="transition-all duration-300">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
            {currentCard.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {currentCard.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(currentCard.priority)}`}>
              {getPriorityText(currentCard.priority)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentCard.storyPoints} pts
            </span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center mt-4 gap-1">
          {DEMO_COLUMNS.map((column, index) => (
            <div
              key={column.status}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStatusIndex === index
                  ? column.color
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Terminal Area - Bottom */}
      <div className="min-h-[140px]">
        {showTerminal && (
          <div className="bg-black rounded-lg p-4 font-mono text-xs overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 mb-3 border-b border-gray-600 pb-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-300 text-xs">AI Agent Terminal</span>
            </div>
            
            {/* Terminal Content */}
            <div className="text-green-400 whitespace-pre-wrap leading-relaxed max-h-20 overflow-hidden">
              {terminalText}
              {isTyping && <span className="animate-pulse">▊</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}