'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginModal from '@/components/login-modal';
import AnimatedBoardDemo from '@/components/board/AnimatedBoardDemo';
import AgentsCarousel from '@/components/AgentsCarousel';

function HomeContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className="min-h-screen">

      {/* Add padding top to account for fixed navbar */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="container mx-auto px-6 py-24 lg:py-32">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
                Project Management For The AI Era
              </h1>

              {/* Agents Carousel below hero text */}
              <div className="mb-12">
                <AgentsCarousel />
              </div>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Stunning visual issue boards, seamless integration with Github, and powerful MCP tooling to power agents autonomously.
              </p>

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


              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => window.location.href = '/projects'}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </button>
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all"
                >
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

        {/* Benefits Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Work with Any Agent, Anywhere
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                  Connect any AI agent to your project board via MCP:
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
                        1. Optionally Link GitHub Repository
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Connect your GitHub repo to sync issues and track progress visually in real-time.
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
                        2. Create Issues - Specify Human/AI
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Create issues and designate whether they should be handled by humans or AI agents for optimal task distribution.
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
                        3. Work Natively with MCP Support
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Work on issues using agentic coding with full MCP (Model Context Protocol) support for seamless AI integration.
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
                        4. Enter &quot;Dev Mode&quot; for Automation
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Let agents autonomously work on all AI-allowed issues. They&apos;ll add comments, update status, push to git, and more.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {/* Hobby Tier */}
              <div className="relative p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hobby</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">Free</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Free self hosting or 1 project cloud hosting</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">1 Cloud Project</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Unlimited Self-Hosted</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Full MCP Access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">GitHub Integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Community Support</span>
                  </li>
                </ul>

                <button
                  onClick={() => window.location.href = '/projects'}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </div>

              {/* Pro Tier */}
              <div className="relative p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-800 border-2 border-blue-500">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">$5</span>
                    <span className="text-slate-600 dark:text-slate-300">/month</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Unlimited cloud hosting, collaboration tooling, priority support</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">Unlimited Cloud Projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Team Collaboration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Advanced MCP Features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Priority Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-300">Advanced Analytics</span>
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
        <section className="py-24 bg-blue-600">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Your AI Native Project
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Connect your GitHub repository and let AI agents work on your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/projects'}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        callbackUrl={callbackUrl}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
