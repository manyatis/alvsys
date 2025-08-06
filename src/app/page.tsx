'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginModal from '@/components/login-modal';

export default function Home() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const getUserDisplayName = (email: string) => {
    return email.split('@')[0];
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent">
                VibeHero
              </button>
            </div>
            
            {/* Center Navigation */}
            <div className="hidden md:flex items-center h-full">
              {session ? (
                <Link 
                  href="/projects"
                  className="px-6 h-full flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-white font-medium hover:bg-purple-700 rounded-lg transition-all duration-500"
                >
                  Projects
                </Link>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 h-full flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-white font-medium hover:bg-purple-700 rounded-lg transition-all duration-500"
                >
                  Projects
                </button>
              )}
              <button className="px-6 h-full flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-white font-medium hover:bg-purple-700 rounded-lg transition-all duration-500">
                Features
              </button>
              <button className="px-6 h-full flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-white font-medium hover:bg-purple-700 rounded-lg transition-all duration-500">
                Pricing
              </button>
              
              {/* Guide Dropdown */}
              <div 
                className="relative h-full"
                onMouseEnter={() => setIsGuideOpen(true)}
                onMouseLeave={() => setIsGuideOpen(false)}
              >
                <button className="flex items-center gap-1 px-6 h-full text-sm text-slate-600 dark:text-slate-300 hover:text-white font-medium hover:bg-purple-700 rounded-lg transition-all duration-500">
                  Guide
                  <svg className={`w-4 h-4 transition-transform ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-2 w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-500 ${
                  isGuideOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}>
                  <div className="py-2 px-2 space-y-1">
                    <button className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-500">
                      Product Guide
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-500">
                      Best Practices
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-500">
                      Example Workflow
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center">
              {session ? (
                <div 
                  className="relative h-full"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button className="flex items-center gap-2 px-6 h-full text-sm text-slate-600 dark:text-slate-300 hover:text-white font-medium hover:bg-purple-700 rounded-lg transition-all duration-500">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {session.user?.email ? getUserDisplayName(session.user.email).charAt(0).toUpperCase() : 'U'}
                    </div>
                    {session.user?.email ? getUserDisplayName(session.user.email) : 'User'}
                    <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  <div className={`absolute top-full right-0 mt-2 w-56 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-500 ${
                    isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}>
                    <div className="py-2 px-2 space-y-1">
                      <button 
                        onClick={() => {
                          router.push('/account');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-500"
                      >
                        Account Settings
                      </button>
                      <button 
                        onClick={() => {
                          router.push('/projects');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-500"
                      >
                        Projects
                      </button>
                      <button 
                        onClick={() => {
                          router.push('/projects');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-500"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={() => {
                          router.push('/organization');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-500"
                      >
                        Organization Settings
                      </button>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                      <button 
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-500"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-6 py-4 space-y-2">
            {session ? (
              <Link 
                href="/projects"
                className="block w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg font-medium transition-all duration-300"
              >
                Projects
              </Link>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="block w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg font-medium transition-all duration-300"
              >
                Projects
              </button>
            )}
            <button className="block w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg font-medium transition-all duration-300">
              Features
            </button>
            <button className="block w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg font-medium transition-all duration-300">
              Pricing
            </button>
            
            {/* Mobile Guide Section */}
            <div className="space-y-1">
              <button 
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className="flex items-center justify-between w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg font-medium transition-all duration-300"
              >
                Guide
                <svg className={`w-4 h-4 transition-transform ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Mobile Guide Dropdown */}
              <div className={`pl-4 space-y-1 transition-all duration-300 ${
                isGuideOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
              }`}>
                <button className="block w-full text-left px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-300">
                  Product Guide
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-300">
                  Best Practices
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-300">
                  Example Workflow
                </button>
              </div>
            </div>
            
            {/* Mobile Auth Section */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {session.user?.email ? getUserDisplayName(session.user.email).charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {session.user?.email ? getUserDisplayName(session.user.email) : 'User'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      router.push('/account');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-300"
                  >
                    Account Settings
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/projects');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-300"
                  >
                    Projects
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/projects');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-300"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/organization');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-white hover:bg-purple-700 rounded-lg transition-all duration-300"
                  >
                    Organization Settings
                  </button>
                  <button 
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="block w-full text-left px-4 py-3 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
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
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Issue Tracking Built for the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI Era
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Set up your backlog anywhere, anytime. Turn on AI agents and let them get to work 
              while you&apos;re away from your computer. Come back to completed tasks and progress updates.
            </p>
            
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
              Designed for Modern Development
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Create tasks from anywhere, activate AI agents, and watch work happen automatically
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Mobile Backlog Management
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Create and organize tasks from your phone while commuting. Set priorities, 
                write acceptance criteria, and enable AI automation with a few taps.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Autonomous AI Execution
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                AI agents automatically pick up ready tasks, implement features, and update status. 
                Get work done 24/7 without being at your computer.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Progress Monitoring
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Return to detailed progress updates, completed features, and clear status reports. 
                Full visibility into what happened while you were away.
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
                Why Teams Choose Our Platform
              </h2>
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
                      Set and Forget Workflow
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Create your backlog from anywhere - commuting, traveling, or during meetings. 
                      AI agents work while you sleep, delivering results by morning.
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
                      Intelligent API Endpoints
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Purpose-built APIs for AI agents to receive instructions, update progress, 
                      and collaborate seamlessly.
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
                      Complete Visibility
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Track every AI action, maintain audit logs, and keep full control 
                      over your development process.
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

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  <span className="text-slate-600 dark:text-slate-300">5 AI tasks per day</span>
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