'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, GitBranch, Zap, Bot, ArrowRight, ChevronRight } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  details: string[];
  image: string;
}

const features: Feature[] = [
  {
    id: 'board-management',
    title: 'Board & Task Management',
    icon: CheckCircle,
    description: 'Powerful Kanban boards with sprint management and seamless GitHub integration.',
    details: [
      'Intuitive drag-and-drop Kanban boards',
      'Sprint planning and tracking',
      'Priority-based task organization',
      'Real-time collaboration',
      'Custom labels and filtering'
    ],
    image: '/images/board-demo.png'
  },
  {
    id: 'github-integration',
    title: 'GitHub Integration',
    icon: GitBranch,
    description: 'Excellent visual representation of GitHub issues with seamless two-way sync.',
    details: [
      'Two-way GitHub issue synchronization',
      'Sync issue status, comments, labels', 
      'Visual GitHub workflow representation',
      'Automatic branch and PR creation',
      'Status sync between platforms',
      'GitHub Actions integration'
    ],
    image: '/images/github-demo.png'
  },
  {
    id: 'mcp-support',
    title: 'AI Native MCP Support',
    icon: Bot,
    description: 'Total connection with AI agents - get tasks, update issues, and manage projects.',
    details: [
      'Model Context Protocol (MCP) integration',
      'Direct AI agent communication',
      'Task fetching and updating via MCP',
      'Project management from any MCP tool',
      'Environment variable configuration'
    ],
    image: '/images/mcp-demo.png'
  },
  {
    id: 'dev-mode',
    title: 'Dev Mode',
    icon: Zap,
    description: 'Switch any agent into dev mode and watch it autonomously work on tasks.',
    details: [
      'Autonomous task execution',
      'Continuous development loops',
      'Automatic code generation and testing',
      'Real-time progress tracking',
      'Branch management and commits'
    ],
    image: '/images/dev-mode-demo.png'
  }
];

export default function FeatureViewer() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState({ board: false, github: false });
  const boardVideoRef = useRef<HTMLVideoElement>(null);
  const githubVideoRef = useRef<HTMLVideoElement>(null);

  // Pause inactive videos to save resources
  useEffect(() => {
    if (boardVideoRef.current) {
      if (activeFeature === 0) {
        boardVideoRef.current.play();
      } else {
        boardVideoRef.current.pause();
      }
    }
    if (githubVideoRef.current) {
      if (activeFeature === 1) {
        githubVideoRef.current.play();
      } else {
        githubVideoRef.current.pause();
      }
    }
  }, [activeFeature]);

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      {/* Feature List */}
      <div className="space-y-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isActive = activeFeature === index;
          
          return (
            <div
              key={feature.id}
              className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                isActive
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-2 border-purple-500'
                  : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setActiveFeature(index)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isActive ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  {isActive && (
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <ChevronRight className="h-4 w-4 text-purple-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <ArrowRight className={`h-5 w-5 transition-transform ${
                  isActive ? 'rotate-90 text-purple-500' : 'text-gray-400'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Visualization */}
      <div className="lg:sticky lg:top-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {features[activeFeature].title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {features[activeFeature].description}
            </p>
          </div>
          
          <div className="p-6">
            {/* Feature demo video */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative">
              {/* Loading indicator */}
              {(!videosLoaded.board || !videosLoaded.github) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading videos...</p>
                  </div>
                </div>
              )}
              
              {/* Board Management Video - always mounted */}
              <video 
                ref={boardVideoRef}
                className={`w-full h-full object-cover absolute inset-0 ${activeFeature === 0 ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setVideosLoaded(prev => ({ ...prev, board: true }))}
              >
                <source src="/Board Clip.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* GitHub Integration Video - always mounted */}
              <video 
                ref={githubVideoRef}
                className={`w-full h-full object-cover absolute inset-0 ${activeFeature === 1 ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setVideosLoaded(prev => ({ ...prev, github: true }))}
              >
                <source src="/Github_Integration.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Placeholder for other features */}
              <div className={`w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center absolute inset-0 ${(activeFeature === 2 || activeFeature === 3) ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeFeature >= 2 && React.createElement(features[activeFeature].icon, { 
                      className: "h-8 w-8 text-white" 
                    })}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeFeature >= 2 ? features[activeFeature].title : ''} Demo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}