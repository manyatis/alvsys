'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginModal from '@/components/login-modal';
import AnimatedBoardDemo from '@/components/board/AnimatedBoardDemo';
import AgentsCarousel from '@/components/AgentsCarousel';
import { Suspense } from 'react';
import CallbackHandler from '@/components/CallbackHandler';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState('/');

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 80 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.5, ease: "easeOut" }
  };

  const fadeInUpDelay = {
    initial: { opacity: 0, y: 80 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.2, delay: 0.4, ease: "easeOut" }
  };

  const fadeInScale = {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 1.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };


  const staggerChild = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.0, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen">

      {/* Add padding top to account for fixed navbar */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="container mx-auto px-6 py-24 lg:py-32">
            <div className="max-w-6xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {/* Background gradient effects behind text */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200%] bg-gradient-to-r from-purple-400/30 via-pink-500/20 to-blue-500/30 rounded-full filter blur-3xl animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-br from-purple-500/20 to-pink-400/20 rounded-full filter blur-2xl animate-blob"></div>
                  <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-blue-400/20 to-purple-500/20 rounded-full filter blur-2xl animate-blob animation-delay-2000"></div>
                </div>
                <span className="relative text-slate-900 dark:text-white">
                  Give Your AI Agents Memory
                </span>
              </motion.h1>

              {/* Agents Carousel below hero text */}
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              >
                <AgentsCarousel />
              </motion.div>

              <motion.p 
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              >
                Turn your GitHub issues into a <b>vectorized memory bank</b>. We are the semantic layer between AI agents and your project history, making them smarter as your project grows - not dumber.
              </motion.p>

            <motion.div 
              className="max-w-5xl mx-auto mb-12"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, delay: 0.9, ease: "easeOut" }}
            >
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
                  <source src="/vibe_hero_demo_2.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>

              <motion.div 
                className="flex justify-center mb-12"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
              >
                <button
                  onClick={() => window.location.href = '/projects'}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </button>
              </motion.div>

            </div>
          </div>

        </section>

        {/* Benefits Section */}
        <motion.section 
          className="py-24 bg-slate-50 dark:bg-slate-950"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1, margin: "0px 0px -100px 0px" }}
        >
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
              <motion.div 
                variants={fadeInUp} 
                className="opacity-100"
                style={{ opacity: 1 }}
              >
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  The Semantic Layer For Project Knowledge
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                  Transform GitHub issues into searchable AI memory. Soon supporting Atlassian, Trello, and more:
                </p>
                <motion.div 
                  className="space-y-6"
                  variants={staggerContainer}
                >
                  <motion.div variants={staggerChild} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        1. GitHub Issues → Vector Memory
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        We automatically convert every GitHub issue, comment, and solution into searchable vectors. AI agents find relevant context instantly.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerChild} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        2. Semantic Layer Intelligence
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        We sit between AI agents and your issue systems, providing intelligent context that grows smarter with every interaction.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerChild} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        3. Multi-Platform Memory Bank
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Starting with GitHub, expanding to Atlassian, Trello, and more. One unified memory bank across all your project management tools.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerChild} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        4. Growing AI Intelligence
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        Unlike traditional AI that forgets, your agents remember every solution, mistake, and optimization - becoming project experts over time.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="relative opacity-100"
                variants={fadeInScale}
                style={{ opacity: 1 }}
              >
                {/* Live Animated Demo */}
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <AnimatedBoardDemo
                    autoPlay={true}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>





        {/* CTA Section */}
        <motion.section 
          className="py-24 bg-slate-50 dark:bg-slate-950"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-6 text-center">
            <motion.h2 
              className="text-4xl font-bold text-slate-900 dark:text-white mb-6"
              variants={fadeInUp}
            >
              Your Project&apos;s AI Memory Bank
            </motion.h2>
            <motion.p 
              className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto"
              variants={fadeInUpDelay}
            >
              Transform your GitHub issues into intelligent, searchable memory that makes AI agents smarter with every task.
            </motion.p>
            <motion.div 
              className="flex justify-center"
              variants={fadeInScale}
            >
              <button
                onClick={() => window.location.href = '/projects'}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
              </button>
            </motion.div>
          </div>
        </motion.section>

      </div>

      {/* Callback URL Handler */}
      <Suspense fallback={null}>
        <CallbackHandler 
          onCallbackUrl={(url) => {
            setCallbackUrl(url);
            setIsLoginModalOpen(true);
          }}
        />
      </Suspense>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        callbackUrl={callbackUrl}
      />
    </div>
  );
}
