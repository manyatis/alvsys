'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar';

export default function Features() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Features' },
    { id: 'ai', name: 'AI Integration' },
    { id: 'mobile', name: 'Mobile Experience' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'collaboration', name: 'Collaboration' },
    { id: 'security', name: 'Security & Control' }
  ];

  const features = [
    {
      category: 'ai',
      title: 'Autonomous AI Agents',
      description: 'Deploy intelligent agents that automatically pick up tasks from your backlog and execute them 24/7.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      details: [
        'Automatic task selection based on priority',
        'Real-time status updates and progress tracking',
        'Intelligent error handling and retry logic',
        'Multi-agent coordination for complex tasks'
      ]
    },
    {
      category: 'ai',
      title: 'AI-Powered Task Management',
      description: 'Let AI agents handle your development tasks while you focus on strategy and review.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      details: [
        'Intelligent task routing to appropriate agents',
        'Progress estimation and deadline tracking',
        'Automatic blocker detection and escalation',
        'Performance analytics and insights'
      ]
    },
    {
      category: 'mobile',
      title: 'Mobile-First Backlog Creation',
      description: 'Create and manage your entire backlog from your phone, anywhere, anytime.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      details: [
        'Responsive mobile interface',
        'Voice-to-text task creation',
        'Offline mode with sync',
        'Quick actions and shortcuts'
      ]
    },
    {
      category: 'mobile',
      title: 'Commute-Friendly Planning',
      description: 'Turn your commute into productive planning time with our mobile-optimized interface.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      details: [
        'One-handed operation design',
        'Quick task templates',
        'Batch task creation',
        'Smart prioritization suggestions'
      ]
    },
    {
      category: 'productivity',
      title: 'Set and Forget Workflow',
      description: 'Queue up tasks and let AI agents work while you sleep, returning to completed features.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      details: [
        'Automated task execution',
        'Smart scheduling and prioritization',
        'Progress notifications',
        'Daily summary reports'
      ]
    },
    {
      category: 'productivity',
      title: 'Intelligent Task Prioritization',
      description: 'AI-powered priority suggestions ensure the most important work gets done first.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      ),
      details: [
        'Smart priority recommendations',
        'Dependency tracking',
        'Deadline awareness',
        'Impact analysis'
      ]
    },
    {
      category: 'collaboration',
      title: 'Real-Time Progress Updates',
      description: 'Stay informed with live updates as AI agents work on your tasks.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      details: [
        'Live status updates',
        'Progress percentage tracking',
        'Activity timeline',
        'Smart notifications'
      ]
    },
    {
      category: 'collaboration',
      title: 'Team Coordination',
      description: 'Seamlessly coordinate between human developers and AI agents.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      details: [
        'Clear ownership assignment',
        'Human review workflows',
        'Comment threads',
        'Handoff protocols'
      ]
    },
    {
      category: 'security',
      title: 'Complete Audit Trail',
      description: 'Full visibility into every action taken by AI agents with comprehensive logging.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      details: [
        'Detailed activity logs',
        'Change history tracking',
        'Performance metrics',
        'Compliance reporting'
      ]
    },
    {
      category: 'security',
      title: 'Granular Access Control',
      description: 'Fine-grained permissions to control exactly what AI agents can and cannot do.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      details: [
        'Task-level AI permissions',
        'Project access controls',
        'API rate limiting',
        'Security boundaries'
      ]
    },
    {
      category: 'productivity',
      title: 'API-First Architecture',
      description: 'Purpose-built APIs designed specifically for AI agent integration.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      details: [
        'RESTful API endpoints',
        'Webhook notifications',
        'Rate limiting and quotas',
        'Comprehensive documentation'
      ]
    },
    {
      category: 'productivity',
      title: 'Intelligent Error Recovery',
      description: 'AI agents automatically handle errors and retry failed operations.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      details: [
        'Automatic retry logic',
        'Error classification',
        'Smart escalation',
        'Self-healing workflows'
      ]
    }
  ];

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                Everything You Need for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI-Powered Development
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Discover the comprehensive features that make our platform the ultimate tool for managing development with AI agents.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-16 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:shadow-lg"
                >
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      feature.category === 'ai' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      feature.category === 'mobile' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                      feature.category === 'productivity' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      feature.category === 'collaboration' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {categories.find(c => c.id === feature.category)?.name}
                    </span>
                  </div>
                  
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Section */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
                And Much More...
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Customizable Workflows</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tailor the platform to match your team&apos;s unique development process.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Advanced Analytics</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Gain insights into productivity, bottlenecks, and team performance.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Unlimited Storage</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Store unlimited tasks, comments, and activity history.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Continuous Improvement</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Regular updates with new features based on user feedback.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience the Future of Development
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are building faster with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                Start Free Trial
              </button>
              <button className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="py-12 bg-slate-900 text-slate-400">
          <div className="container mx-auto px-6 text-center">
            <p>&copy; 2024 VibeHero. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}