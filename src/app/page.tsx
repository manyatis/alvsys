'use client';

import { useState } from 'react';
import LoginModal from '@/components/login-modal';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import AnimatedBoardDemo from '@/components/board/AnimatedBoardDemo';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Add padding top to account for fixed navbar */}
      <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <a 
              href="https://github.com/slightlymikey/vibehero" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-8 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
GitHub
            </a>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-12">
              Your AI Agent&apos;s{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Project Manager
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Set up tasks, walk away, and let your AI agents get to work. VibeHero manages the queue, 
              tracks progress, and keeps your development organized while you focus on what matters. 
            </p>
            
            {/* Video - Large and centered */}
            <div className="max-w-5xl mx-auto mb-12">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                <video 
                  className="w-full h-auto"
                  controls
                  muted
                  autoPlay
                  loop
                  playsInline
                  controlsList="nodownload"
                >
                  <source src="/VibeHero Demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-purple-700 dark:text-purple-400">The better way:</span> Create tasks when inspiration strikes, 
                then delegate everything to your AI agents. They pick up work automatically, follow your requirements, 
                and deliver results while you&apos;re away. True delegation, not micromanagement.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => window.location.href = '/projects'}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Join Free
              </button>
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all"
              >
                View Pricing
              </button>
            </div>
          
            {/* Privacy box */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-semibold text-green-700 dark:text-green-400">Total Privacy Guaranteed</span>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed text-center">
                  We <strong>never access your API keys</strong> and <strong>never access your code</strong>. 
                  VibeHero provides a secure management layer for your AI agents while ensuring complete privacy of your development work.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              See Your Board in Action
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Experience the power of structured, AI-native project management
            </p>
            
            {/* Board Preview */}
            <div className="max-w-5xl mx-auto mb-12">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
                {/* Board Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Awesome Project</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    AI agents active
                  </div>
                </div>
                
                {/* Kanban Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                  {/* Refinement */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Refinement</span>
                      <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-full">3</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-sm">
                        <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">User Authentication</div>
                        <div className="text-slate-500 dark:text-slate-400">P2 • 🤖 AI Ready</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-sm">
                        <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">Database Schema</div>
                        <div className="text-slate-500 dark:text-slate-400">P3 • 👤 Human</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ready */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Ready</span>
                      <span className="text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded-full">2</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-sm border-l-2 border-blue-500">
                        <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">Login API Endpoint</div>
                        <div className="text-slate-500 dark:text-slate-400">P1 • 🤖 AI Ready</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-sm">
                        <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">Error Handling</div>
                        <div className="text-slate-500 dark:text-slate-400">P2 • 🤖 AI Ready</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* In Progress */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">In Progress</span>
                      <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-1.5 py-0.5 rounded-full">1</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-sm border-l-2 border-yellow-500">
                      <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">User Dashboard</div>
                      <div className="text-slate-500 dark:text-slate-400 mb-2">P1 • 🤖 Claude AI</div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ✓ Created components<br/>
                        🔄 Adding API integration...
                      </div>
                    </div>
                  </div>
                  
                  {/* Review */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Review</span>
                      <span className="text-xs bg-purple-200 dark:bg-purple-800 px-1.5 py-0.5 rounded-full">2</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-sm border-l-2 border-purple-500">
                        <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">Settings Page</div>
                        <div className="text-slate-500 dark:text-slate-400">P2 • 🤖 Complete</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Done */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Done</span>
                      <span className="text-xs bg-green-200 dark:bg-green-800 px-1.5 py-0.5 rounded-full">5</span>
                    </div>
                    <div className="space-y-1">
                      <div className="bg-white dark:bg-slate-800 p-1.5 rounded text-xs shadow-sm">
                        <div className="font-medium text-slate-800 dark:text-slate-200">Landing Page</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-1.5 rounded text-xs shadow-sm">
                        <div className="font-medium text-slate-800 dark:text-slate-200">Nav Component</div>
                      </div>
                      <div className="text-xs text-slate-400 text-center pt-1">+3 more</div>
                    </div>
                  </div>
                  
                  {/* Blocked */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">Blocked</span>
                      <span className="text-xs bg-red-200 dark:bg-red-800 px-1.5 py-0.5 rounded-full">1</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-xs shadow-sm border-l-2 border-red-500">
                      <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">Payment Integration</div>
                      <div className="text-slate-500 dark:text-slate-400 mb-1">P3 • 👤 Human</div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        ⚠ Need API keys
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Board Footer */}
                <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <div>Last updated: 2 minutes ago</div>
                  <div className="flex items-center gap-4">
                    <span>👤 3 humans</span>
                    <span>🤖 2 AI agents</span>
                    <span>⚡ 12 tasks completed this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature cards removed as requested */}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                How It Works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                VibeHero acts as your AI agent&apos;s project manager, handling the coordination so you don&apos;t have to:
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      1. Create Your Work Queue
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong className="text-blue-600 dark:text-blue-400">Add tasks when inspiration strikes</strong> - 
                      feature requests, bug fixes, improvements. Assign to humans, AI agents, or leave open. 
                      Everyone works together on prioritized tasks.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      2. Connect Your AI Agent
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong className="text-blue-600 dark:text-blue-400">Connect AI agents to work alongside your team.</strong> 
                      They automatically fetch AI-enabled tasks, update status, and work through the backlog. 
                      Humans and AI agents collaborate seamlessly on the same board.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      3. Review When Convenient
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong className="text-blue-600 dark:text-blue-400">Return to completed work</strong> - 
                      agents move tasks to review status when done. You can check progress anytime, 
                      provide feedback, or approve. Full autonomy with human oversight.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Live Animated Demo */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <AnimatedBoardDemo 
                  autoPlay={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meta Section - Built with VibeHero */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 dark:from-purple-800 dark:via-blue-800 dark:to-indigo-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Built with VibeHero
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              VibeHero Was Built{" "}
              <span className="text-yellow-300">
                Using VibeHero
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Every feature you see, every page you&apos;re reading, every API endpoint was developed 
              using our own platform. We practice what we preach.
            </p>

            {/* Proof Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-yellow-300 mb-2">72%</div>
                <div className="text-lg text-white font-semibold mb-2">AI Automation</div>
                <div className="text-blue-200 text-sm">Of development tasks handled by AI</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-yellow-300 mb-2">3x</div>
                <div className="text-lg text-white font-semibold mb-2">Faster Delivery</div>
                <div className="text-blue-200 text-sm">Compared to traditional development</div>
              </div>
            </div>

            {/* The Story */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 text-left max-w-3xl mx-auto mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">The Story</h3>
              <div className="space-y-4 text-blue-100 leading-relaxed">
                <p>
                  <strong className="text-white">The Inspiration:</strong> We wanted to work on our software even when not at the computer. 
                  Waiting in line at the grocery store and have ideas to vibe code later? No problem - 
                  create tasks and get them ready, then come home, turn on the agent and let it chew through the backlog.
                </p>
                <p>
                  <strong className="text-white">The Vision:</strong> We wanted to bring structure to the vibe coding process 
                  while recognizing that not all tasks can be automated. So we built an AI-native task management board 
                  designed for both humans and robots to work together seamlessly.
                </p>
                <p>
                  <strong className="text-white">The Result:</strong> A development process that scales. 
                  We went from chaotic late-night coding sessions to structured, predictable progress. 
                  Our AI agents became reliable team members, not just occasional helpers.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Free</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-600 dark:text-slate-300">/month</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">1 Project</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">Unlimited AI tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">Basic API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">Community support</span>
                </li>
              </ul>
              
              <button 
                onClick={() => window.location.href = '/projects'}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
            
            {/* Indie Tier */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-800 border-2 border-blue-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Indie</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$10</span>
                  <span className="text-slate-600 dark:text-slate-300">/month</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">For independent developers</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">1 Project</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Unlimited AI tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">Priority API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">Email support</span>
                </li>
              </ul>
              
              <button 
                onClick={() => window.location.href = '/subscribe'}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Subscribe Now
              </button>
            </div>
            
            {/* Professional Tier */}
            <div className="relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Professional</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$99</span>
                  <span className="text-slate-600 dark:text-slate-300">/month</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">For teams and agencies</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Unlimited projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Unlimited AI tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-300">Priority support</span>
                </li>
              </ul>
              
              <button 
                onClick={() => window.location.href = '/subscribe'}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Stop Managing AI?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join developers who set up work queues and let AI agents handle the rest. 
            <strong className="text-yellow-300">True delegation</strong> means you focus on strategy while agents execute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/projects'}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Join Free
            </button>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}