'use client';

import React, { useState } from 'react';
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
              {/* Board Management Video */}
              {activeFeature === 0 && (
                <video 
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  autoPlay
                >
                  <source src="/Board Clip.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* GitHub Integration Video */}
              {activeFeature === 1 && (
                <video 
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  autoPlay
                >
                  <source src="/Github_Integration.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* MCP Support Video */}
              {activeFeature === 2 && (
                <video 
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  autoPlay
                >
                  <source src="/mcp_tool_clip.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* Dev Mode Video */}
              {activeFeature === 3 && (
                <video 
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  autoPlay
                >
                  <source src="/dev_mode_clip.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}