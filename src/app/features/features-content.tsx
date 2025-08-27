'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, GitBranch, Zap, Bot, ChevronRight, Code2, Brain, Users, Workflow } from 'lucide-react';

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
    id: 'mcp-tooling',
    title: 'MCP-Enabled AI Agents',
    icon: Code2,
    description: 'Deploy AI agents with Model Context Protocol tools that interact natively with your development stack.',
    details: [
      'Native MCP integration for all major AI models',
      'Direct GitHub, IDE, and toolchain interactions',
      'Custom tool development and deployment',
      'Secure sandboxed execution environments',
      'Real-time agent monitoring and control'
    ],
    videoSrc: '/Board Clip.mp4'
  },
  {
    id: 'knowledge-bank',
    title: 'Institutional Knowledge Bank',
    icon: Brain,
    description: 'Build a vectorized repository from your entire development history that AI agents access instantly.',
    details: [
      'Automatic vectorization of GitHub issues and PRs',
      'Code pattern and architecture learning', 
      'Documentation and comment analysis',
      'Cross-repository knowledge synthesis',
      'Historical decision and rationale tracking',
      'Team-specific best practices extraction'
    ],
    videoSrc: '/Github_Integration.mp4'
  },
  {
    id: 'bulk-automation',
    title: 'Bulk Task Automation',
    icon: Workflow,
    description: 'Queue and assign tasks to AI agents in bulk while maintaining quality control.',
    details: [
      'Batch task creation and assignment',
      'Intelligent work distribution algorithms',
      'Priority-based execution queues',
      'Automated workflow orchestration',
      'Progress tracking and reporting dashboards'
    ],
    videoSrc: '/claude_github_action.mp4'
  },
  {
    id: 'human-ai-collab',
    title: 'Human-AI Collaboration Hub',
    icon: Users,
    description: 'Seamless handoffs between AI agents and developers with full visibility and control.',
    details: [
      'Real-time agent activity monitoring',
      'Code review and approval workflows',
      'Human intervention and guidance tools',
      'Quality assurance checkpoints',
      'Performance metrics and analytics'
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
              Everything you need to build an AI-powered development team. Deploy intelligent agents 
              that work alongside humans with MCP tooling, institutional knowledge, and automated workflows.
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
            Build Your AI-Powered Development Team
          </motion.h2>
          <motion.p 
            className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Deploy intelligent AI agents equipped with MCP tools and institutional knowledge to accelerate your development.
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