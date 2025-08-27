'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, GitBranch, Zap, Bot, ChevronRight } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  details: string[];
  videoSrc: string;
}

const features: Feature[] = [
  {
    id: 'board-management',
    title: 'GitHub Issues → Vector Memory',
    icon: CheckCircle,
    description: 'Automatically convert every GitHub issue and comment into searchable AI memory.',
    details: [
      'Real-time vectorization of all GitHub content',
      'Semantic search across project history',
      'Issue-to-memory pipeline automation',
      'Cross-project knowledge linking',
      'Multi-repository memory consolidation'
    ],
    videoSrc: '/Board Clip.mp4'
  },
  {
    id: 'github-integration',
    title: 'Semantic Layer Intelligence',
    icon: GitBranch,
    description: 'We sit between AI agents and GitHub, providing intelligent context and memory.',
    details: [
      'Intelligent abstraction over GitHub APIs',
      'Context-aware issue relationships', 
      'Smart filtering of relevant history',
      'Multi-platform integration roadmap',
      'Atlassian and Trello support coming soon',
      'Unified memory across all tools'
    ],
    videoSrc: '/Github_Integration.mp4'
  },
  {
    id: 'claude-github-action',
    title: 'Growing Project Intelligence',
    icon: Bot,
    description: 'AI agents get smarter with every GitHub interaction, building project-specific expertise.',
    details: [
      'Project-specific learning curves',
      'Avoid repeating past mistakes',
      'Version conflict pattern recognition',
      'Security vulnerability memory',
      'Performance optimization history'
    ],
    videoSrc: '/claude_github_action.mp4'
  },
  {
    id: 'dev-mode',
    title: 'Memory-Driven Development',
    icon: Zap,
    description: 'AI agents reference vectorized project history while working, avoiding past pitfalls.',
    details: [
      'Real-time memory consultation during tasks',
      'Instant access to similar past issues',
      'Work-loop detection and prevention',
      'Debugging strategy recommendations',
      'Implementation pattern suggestions'
    ],
    videoSrc: '/dev_mode_clip.mp4'
  }
];

export default function FeaturesContent() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 80 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.2, ease: "easeOut" }
  };


  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const staggerChild = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              Powerful <span className="text-purple-600">Features</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            >
              The semantic layer that transforms GitHub issues into AI memory. Turn project history 
              into searchable intelligence that makes agents smarter as your codebase grows.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="container mx-auto px-6 pb-20">
        <div className="space-y-32">
          {features.map((feature) => {
            const Icon = feature.icon;
            
            return (
              <motion.section
                key={feature.id}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                {/* Details Section */}
                <motion.div 
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                      {feature.title}
                    </h2>
                  </div>
                  
                  <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <motion.ul 
                    className="space-y-4"
                    variants={staggerContainer}
                  >
                    {feature.details.map((detail, detailIndex) => (
                      <motion.li 
                        key={detailIndex} 
                        variants={staggerChild}
                        className="flex items-start gap-3"
                      >
                        <ChevronRight className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{detail}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>

                {/* Video Section - Temporarily commented out for new videos */}
                {/* <motion.div 
                  variants={isEven ? fadeInRight : fadeInLeft}
                  className={isEven ? 'lg:order-2' : 'lg:order-1'}
                >
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="aspect-video">
                      <video 
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        autoPlay
                      >
                        <source src={feature.videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </motion.div> */}
              </motion.section>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <motion.section 
        className="bg-gradient-to-r from-blue-600 to-purple-600 py-16"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Turn GitHub Issues Into AI Intelligence
          </motion.h2>
          <motion.p 
            className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            We are the semantic layer that makes your project history searchable and actionable for AI agents.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <button 
              onClick={() => window.location.href = '/projects'}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => window.location.href = '/features'}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              View Features
            </button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}