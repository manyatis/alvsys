'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/login-modal';
import Navbar from '@/components/navbar';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Add padding top to account for fixed navbar */}
      <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI-Powered Development
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Bring Structure to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Vibe Coding
              </span>
            </h1>
            
            <p className="text-base md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform chaotic &quot;vibe coding&quot; into structured, asynchronous development. 
              Create organized backlogs, enable AI agents, and watch work happen automatically 
              while you sleep, travel, or focus on strategy.
            </p>
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl p-6 mb-12 max-w-4xl mx-auto">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-purple-700 dark:text-purple-400">Stop the chaos:</span> No more scattered ideas, forgotten tasks, or waiting around for AI responses. 
                VibeHero brings real software engineering practices to AI-assisted development.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                Join Free
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all">
                View Pricing
              </button>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Structured Task Creation
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Transform scattered ideas into well-defined user stories with clear acceptance criteria. 
                Create organized backlogs from anywhere - mobile, desktop, or on-the-go.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Asynchronous AI Workflow
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                No more prompting AI for every single task. Agents automatically pick up work, 
                follow your requirements, and deliver results while you&apos;re away. True async development.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Real Engineering Practices
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Bring agile methodologies to AI development. Proper prioritization, status tracking, 
                code review processes, and full audit trails for professional-grade development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                From Chaos to Structure
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Stop the endless cycle of prompting AI agents and losing track of work. 
                VibeHero brings professional development practices to the AI era.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Queue Work, Walk Away
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Line up a week&apos;s worth of structured tasks, enable AI agents, and let them work 
                      asynchronously. No more babysitting AI or losing context between sessions.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Professional Development Process
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Replace chaotic &quot;vibe coding&quot; with proper user stories, acceptance criteria, 
                      priority management, and code review workflows that scale.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Full Traceability & Control
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Every AI action is logged, every decision is traceable, and you maintain 
                      complete control over your codebase with human review gates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-8">
                <div className="h-full bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
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
              Eating Our Own Dog Food
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold text-yellow-300 mb-2">247</div>
                <div className="text-lg text-white font-semibold mb-2">Tasks Completed</div>
                <div className="text-blue-200 text-sm">By AI agents while building VibeHero</div>
              </div>
              
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
                  <strong className="text-white">The Challenge:</strong> We were tired of the chaotic &quot;vibe coding&quot; approach - 
                  scattered ideas, constant AI prompting, and lost context between sessions. 
                  We needed structure without losing the creative flow.
                </p>
                <p>
                  <strong className="text-white">The Solution:</strong> We built VibeHero to solve our own problems. 
                  Every user story, every bug fix, every new feature was managed through our own platform.
                  AI agents worked asynchronously while we slept, creating the very tool you&apos;re using now.
                </p>
                <p>
                  <strong className="text-white">The Result:</strong> A development process that scales. 
                  We went from chaotic late-night coding sessions to structured, predictable progress. 
                  Our AI agents became reliable team members, not just occasional helpers.
                </p>
              </div>
            </div>

            {/* Live Board Link */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                See Our Live Development Board
              </h3>
              <p className="text-gray-800 mb-6 leading-relaxed">
                Watch real AI agents working on VibeHero features in real-time. 
                See the structured approach that built the platform you&apos;re using right now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/projects/cme0a0fir000ol304w0cvo38m/board"
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  🔴 View Live Board
                </a>
                <a
                  href="/example-workflow"
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-gray-900 font-semibold rounded-xl hover:bg-white/30 transition-colors border border-gray-800/20"
                >
                  📖 See How We Did It
                </a>
              </div>
            </div>

            {/* Bottom Message */}
            <div className="mt-12 text-center">
              <p className="text-xl text-blue-100 italic">
                &quot;If VibeHero can build VibeHero, imagine what it can do for your project.&quot;
              </p>
              <div className="mt-4 text-blue-200">
                — The VibeHero Team
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
                  <span className="text-slate-600 dark:text-slate-300">8 AI tasks per day</span>
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
              
              <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
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
              
              <button className="w-full px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-semibold rounded-lg cursor-not-allowed" disabled>
                Coming Soon
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
              
              <button className="w-full px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-semibold rounded-lg cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join developers who create backlogs on the go and wake up to completed features. 
            Never let distance from your computer slow down development again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              Join Free
            </button>
            <button className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all">
              View Pricing
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
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}