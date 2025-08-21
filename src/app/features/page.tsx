'use client';

import React, { useState } from 'react';
import { CheckCircle, GitBranch, Zap, Bot, ArrowRight, ChevronRight } from 'lucide-react';

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful <span className="text-purple-600">Features</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              VibeHero combines the best of project management, GitHub integration, and AI automation 
              to create the ultimate development workflow.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 pb-20">
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
                {/* Placeholder for feature demo/screenshot */}
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      {React.createElement(features[activeFeature].icon, { 
                        className: "h-8 w-8 text-white" 
                      })}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {features[activeFeature].title} Demo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience VibeHero?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Start managing your projects with the power of AI automation and seamless GitHub integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}