'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginModal from '@/components/login-modal';
import GetStartedModal from '@/components/get-started-modal';
import MemoLabLogo from '@/components/memolab-logo';
import { getUserProjects } from '@/lib/project-functions';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);
  const [loginCallbackUrl, setLoginCallbackUrl] = useState('/');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [projects, setProjects] = useState<{id: string; name: string; organization?: {name: string}}[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const projectsMenuRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (projectsMenuRef.current && !projectsMenuRef.current.contains(event.target as Node)) {
        setIsProjectsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scrolling to pricing section when coming from hash URL
  useEffect(() => {
    if (window.location.hash === '#pricing') {
      const timer = setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure page is loaded
      return () => clearTimeout(timer);
    }
  }, []);

  const getUserDisplayName = (email: string) => {
    return email.split('@')[0];
  };


  const fetchProjects = async () => {
    if (!session || projectsLoading) return;
    
    setProjectsLoading(true);
    try {
      const result = await getUserProjects();
      if (result.success && result.projects) {
        const mappedProjects = result.projects.map(project => ({
          id: project.id,
          name: project.name,
          organization: project.organization ? { name: project.organization.name } : undefined
        }));
        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleProjectsMouseEnter = () => {
    setIsProjectsOpen(true);
    if (session && projects.length === 0) {
      fetchProjects();
    }
  };


  return (
    <>
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent">
                <MemoLabLogo gradientId="gradient-navbar" />
                MemoLab
              </Link>
              <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                BETA
              </span>
            </div>
            
            {/* Center Navigation */}
            <div className="hidden md:flex items-center h-full">
              {/* Projects Dropdown */}
              <div 
                ref={projectsMenuRef}
                className="relative h-full"
                onMouseLeave={() => setIsProjectsOpen(false)}
              >
                <button 
                  onClick={(e) => {
                    if (!session) {
                      e.preventDefault();
                      setLoginCallbackUrl('/projects');
                      setIsLoginModalOpen(true);
                    } else {
                      router.push('/projects');
                    }
                  }}
                  onMouseEnter={handleProjectsMouseEnter}
                  className="flex items-center gap-1 px-3 md:px-6 h-full text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-500"
                >
                  Projects
                  {session && (
                    <svg className={`w-4 h-4 transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                
                {/* Projects Dropdown Menu */}
                {session && isProjectsOpen && (
                  <div 
                    className="absolute top-full left-0 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-100 visible translate-y-0"
                  >
                    <div className="py-2 px-2">
                      <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Your Projects
                      </div>
                      
                      {projectsLoading ? (
                        <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-600"></div>
                          Loading...
                        </div>
                      ) : projects.length > 0 ? (
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {projects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => {
                                router.push(`/projects/${project.id}/board`);
                                setIsProjectsOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-500"
                            >
                              <div className="font-medium">{project.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{project.organization?.name}</div>
                            </button>
                          ))}
                          <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                          <button
                            onClick={() => {
                              router.push('/projects');
                              setIsProjectsOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-500"
                          >
                            View All Projects
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                          No projects found.
                          <button
                            onClick={() => {
                              router.push('/projects');
                              setIsProjectsOpen(false);
                            }}
                            className="block mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Create your first project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link 
                href="/features"
                className="px-3 md:px-6 h-full flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-500"
              >
                Features
              </Link>
              <Link 
                href="/installation"
                className="px-3 md:px-6 h-full flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-500"
              >
                Installation
              </Link>
              <button 
                onClick={() => {
                  if (session) {
                    router.push('/projects');
                  } else {
                    setIsGetStartedModalOpen(true);
                  }
                }}
                className="px-3 md:px-6 h-full flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:text-slate-900 dark:active:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-all duration-500"
              >
                Get Started
              </button>

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
              {status === 'loading' ? (
                <div className="px-6 py-2 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
                </div>
              ) : session ? (
                <div 
                  ref={userMenuRef}
                  className="relative h-full"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button 
                    className="flex items-center gap-2 px-3 md:px-6 h-full text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:text-slate-900 dark:active:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-all duration-500 min-h-[44px]"
                  >
                    <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {session.user?.email ? getUserDisplayName(session.user.email).charAt(0).toUpperCase() : 'U'}
                    </div>
                    {session.user?.email ? getUserDisplayName(session.user.email) : 'User'}
                    <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  <div className={`absolute top-full right-0 w-56 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-500 ${
                    isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}>
                    <div className="py-2 px-2 space-y-1">
                      <button 
                        onClick={() => {
                          router.push('/account');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-500"
                      >
                        Account Settings
                      </button>
                      <Link 
                        href="/projects"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-500"
                      >
                        Projects
                      </Link>
                      <button 
                        onClick={() => {
                          router.push('/organization');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-500"
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
        <div className={`md:hidden bg-white/90 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-6 py-4 space-y-2">
            {/* Mobile Projects Section - Simplified */}
            <button 
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  setLoginCallbackUrl('/projects');
                  setIsLoginModalOpen(true);
                } else {
                  router.push('/projects');
                }
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-all duration-300 min-h-[44px]"
            >
              Projects
            </button>
            <Link 
              href="/features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-all duration-300 min-h-[44px]"
            >
              Features
            </Link>
            <Link 
              href="/installation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-all duration-300 min-h-[44px]"
            >
              Installation
            </Link>
            <button 
              onClick={() => {
                if (session) {
                  router.push('/projects');
                } else {
                  setIsGetStartedModalOpen(true);
                }
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:text-slate-900 dark:active:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg font-medium transition-all duration-300 min-h-[44px]"
            >
              Get Started
            </button>
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              {status === 'loading' ? (
                <div className="flex items-center justify-center px-4 py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                </div>
              ) : session ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {session.user?.email ? getUserDisplayName(session.user.email).charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-sm block truncate">
                        {session.user?.email ? getUserDisplayName(session.user.email) : 'User'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs truncate block">
                        {session.user?.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile Action Icons Row */}
                  <div className="flex items-center justify-around px-2 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <button 
                      onClick={() => {
                        router.push('/account');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-1 p-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-300"
                      title="Account Settings"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs">Account</span>
                    </button>
                    
                    <Link 
                      href="/projects"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-300"
                      title="Projects"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-xs">Projects</span>
                    </Link>
                    
                    
                    <button 
                      onClick={() => {
                        router.push('/organization');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-1 p-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-300"
                      title="Organization"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs">Org</span>
                    </button>
                    
                    <button 
                      onClick={() => signOut()}
                      className="flex flex-col items-center gap-1 p-3 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 rounded-lg transition-all duration-300"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-xs">Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="block w-full text-left px-6 py-4 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 min-h-[48px] flex items-center text-base"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        callbackUrl={loginCallbackUrl}
      />
      
      {/* Get Started Modal */}
      <GetStartedModal 
        isOpen={isGetStartedModalOpen} 
        onClose={() => setIsGetStartedModalOpen(false)} 
      />
    </>
  );
}