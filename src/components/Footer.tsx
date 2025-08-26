'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginModal from '@/components/login-modal';
import VibeHeroLogo from '@/components/vibehero-logo';

export default function Footer() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handlePricingClick = () => {
    // Check if we're on the home page
    if (window.location.pathname === '/') {
      // Scroll to pricing section
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with pricing hash
      router.push('/#pricing');
    }
  };

  return (
    <>
      <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
                <VibeHeroLogo gradientId="gradient-footer" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent">
                  VibeHero
                </span>
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Your AI Native Project Management. Set up tasks, walk away, and let your AI agents get to work.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                  BETA
                </span>
              </div>
            </div>


            {/* Navigation Links */}
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Navigation</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/projects"
                    onClick={(e) => {
                      if (!session) {
                        e.preventDefault();
                        setIsLoginModalOpen(true);
                      }
                    }}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/installation"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Installation
                  </Link>
                </li>

              </ul>
            </div>


            {/* Links & Resources */}
            <div className="md:col-span-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://github.com/slightlymikey/vibehero"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </li>
                {session ? (
                  <li>
                    <Link 
                      href="/account"
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Account Settings
                    </Link>
                  </li>
                ) : (
                  <li>
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
                    >
                      Sign In
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                © 2025 VibeHero. All rights reserved.
              </p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  Built with VibeHero
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}