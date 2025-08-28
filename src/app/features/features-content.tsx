'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Brain, Workflow, Users, ChevronRight, ArrowRight, Sparkles, GitBranch } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  details: string[];
  gradient: string;
}

const features: Feature[] = [
  {
    id: 'mcp-tooling',
    title: 'MCP-Enabled AI Agents',
    icon: Code2,
    description: 'Deploy AI agents with Model Context Protocol tools that interact natively with your development stack.',
    gradient: 'from-emerald-500 to-green-500',
    details: [
      'Native MCP integration for all major AI models',
      'Direct GitHub, IDE, and toolchain interactions',
      'Custom tool development and deployment',
      'Secure sandboxed execution environments',
      'Real-time agent monitoring and control'
    ],
  },
  {
    id: 'knowledge-bank',
    title: 'Institutional Knowledge Bank',
    icon: Brain,
    description: 'Build a vectorized repository from your entire development history that AI agents access instantly.',
    gradient: 'from-green-500 to-emerald-500',
    details: [
      'Automatic vectorization of GitHub issues and PRs',
      'Code pattern and architecture learning', 
      'Documentation and comment analysis',
      'Cross-repository knowledge synthesis',
      'Historical decision and rationale tracking',
      'Team-specific best practices extraction'
    ],
  },
  {
    id: 'bulk-automation',
    title: 'Bulk Task Automation',
    icon: Workflow,
    description: 'Queue and assign tasks to AI agents in bulk while maintaining quality control.',
    gradient: 'from-lime-500 to-green-500',
    details: [
      'Batch task creation and assignment',
      'Intelligent work distribution algorithms',
      'Priority-based execution queues',
      'Automated workflow orchestration',
      'Progress tracking and reporting dashboards'
    ],
  },
  {
    id: 'human-ai-collab',
    title: 'Human-AI Collaboration Hub',
    icon: Users,
    description: 'Seamless handoffs between AI agents and developers with full visibility and control.',
    gradient: 'from-teal-500 to-emerald-500',
    details: [
      'Real-time agent activity monitoring',
      'Code review and approval workflows',
      'Human intervention and guidance tools',
      'Quality assurance checkpoints',
      'Performance metrics and analytics'
    ],
  }
];

export default function FeaturesContent() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Subtle gradient background */}
      <div className="fixed inset-0 gradient-mesh opacity-15 pointer-events-none" />
      
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/8 to-transparent rounded-full animate-blob" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-gradient-to-tl from-green-500/6 to-transparent rounded-full animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 glass-subtle rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-gray-300">
                  Enterprise Features
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                <span className="text-gradient-primary">Powerful Features</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Everything you need to build an AI-powered development team. Deploy intelligent agents 
                that work alongside humans with MCP tooling, institutional knowledge, and automated workflows.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Sections */}
        <div className="pb-32">
          {features.map((feature, featureIndex) => {
            const Icon = feature.icon;
            const isEven = featureIndex % 2 === 0;
            
            return (
              <motion.section
                key={feature.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                className="relative py-32 px-6"
              >
                <div className="max-w-7xl mx-auto">
                  <div className={`grid lg:grid-cols-2 gap-16 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                    
                    {/* Content Side */}
                    <motion.div 
                      className={isEven ? 'lg:order-1' : 'lg:order-2'}
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className="space-y-8">
                        {/* Icon and Title */}
                        <div>
                          <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            {feature.title}
                          </h2>
                          <p className="text-xl text-gray-400 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>

                        {/* Feature Details */}
                        <ul className="space-y-4">
                          {feature.details.map((detail, detailIndex) => (
                            <motion.li 
                              key={detailIndex}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: 0.3 + detailIndex * 0.1 }}
                              className="flex items-start gap-3 group"
                            >
                              <ChevronRight className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                              <span className="text-gray-300">{detail}</span>
                            </motion.li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <button 
                            onClick={() => window.location.href = '/projects'}
                            className="btn-premium group"
                          >
                            Get Started
                            <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Visual Side - Feature Card */}
                    <motion.div 
                      className={isEven ? 'lg:order-2' : 'lg:order-1'}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl blur-3xl" />
                        <div className="relative glass rounded-3xl p-12 hover-glow">
                          <div className="flex items-center justify-center">
                            <div className={`p-16 rounded-full bg-gradient-to-br ${feature.gradient} opacity-20`}>
                              <Icon className="w-32 h-32 text-white opacity-60" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Integration Section */}
        <section className="relative py-32 px-6 border-t border-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                <span className="text-gradient">Seamless Integrations</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Works with your existing development stack out of the box
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="glass rounded-3xl p-12"
            >
              <div className="grid md:grid-cols-3 gap-8 text-center">
                {[
                  { icon: GitBranch, name: 'GitHub', desc: 'Native Integration' },
                  { icon: Workflow, name: 'GitHub Actions', desc: 'CI/CD Automation' },
                  { icon: Code2, name: 'MCP Protocol', desc: 'Tool Ecosystem' }
                ].map((integration, index) => {
                  const IntIcon = integration.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="inline-flex p-4 rounded-2xl glass-subtle mb-4 group-hover:scale-110 transition-transform">
                        <IntIcon className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{integration.name}</h3>
                      <p className="text-sm text-gray-400">{integration.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-6 border-t border-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                Ready to Deploy
                <span className="block mt-2 text-gradient-primary">AI Agents at Scale?</span>
              </h2>
              
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Join the future of software development with intelligent AI collaboration.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button 
                  onClick={() => window.location.href = '/projects'}
                  className="btn-premium text-lg px-8 py-4 group"
                >
                  Start Free Trial
                  <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => window.location.href = '/workflow'}
                  className="btn-glass text-lg px-8 py-4"
                >
                  See Workflow
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}