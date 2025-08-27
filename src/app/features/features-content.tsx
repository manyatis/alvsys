'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Brain, Workflow, Users, ChevronRight, ArrowRight, Sparkles, Shield, Zap, GitBranch, Activity, Lock } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  details: string[];
  gradient: string;
  stats?: { label: string; value: string }[];
}

const features: Feature[] = [
  {
    id: 'mcp-tooling',
    title: 'MCP-Enabled AI Agents',
    icon: Code2,
    description: 'Deploy AI agents with Model Context Protocol tools that interact natively with your development stack.',
    gradient: 'from-indigo-500 to-blue-500',
    details: [
      'Native MCP integration for all major AI models',
      'Direct GitHub, IDE, and toolchain interactions',
      'Custom tool development and deployment',
      'Secure sandboxed execution environments',
      'Real-time agent monitoring and control'
    ],
    stats: [
      { label: 'Tool Integrations', value: '500+' },
      { label: 'Response Time', value: '<100ms' },
      { label: 'Success Rate', value: '99.9%' }
    ]
  },
  {
    id: 'knowledge-bank',
    title: 'Institutional Knowledge Bank',
    icon: Brain,
    description: 'Build a vectorized repository from your entire development history that AI agents access instantly.',
    gradient: 'from-purple-500 to-indigo-500',
    details: [
      'Automatic vectorization of GitHub issues and PRs',
      'Code pattern and architecture learning', 
      'Documentation and comment analysis',
      'Cross-repository knowledge synthesis',
      'Historical decision and rationale tracking',
      'Team-specific best practices extraction'
    ],
    stats: [
      { label: 'Vectors Processed', value: '1B+' },
      { label: 'Query Speed', value: '<50ms' },
      { label: 'Accuracy', value: '98.5%' }
    ]
  },
  {
    id: 'bulk-automation',
    title: 'Bulk Task Automation',
    icon: Workflow,
    description: 'Queue and assign tasks to AI agents in bulk while maintaining quality control.',
    gradient: 'from-pink-500 to-purple-500',
    details: [
      'Batch task creation and assignment',
      'Intelligent work distribution algorithms',
      'Priority-based execution queues',
      'Automated workflow orchestration',
      'Progress tracking and reporting dashboards'
    ],
    stats: [
      { label: 'Tasks/Hour', value: '10,000+' },
      { label: 'Parallel Agents', value: '1,000+' },
      { label: 'Efficiency Gain', value: '50x' }
    ]
  },
  {
    id: 'human-ai-collab',
    title: 'Human-AI Collaboration Hub',
    icon: Users,
    description: 'Seamless handoffs between AI agents and developers with full visibility and control.',
    gradient: 'from-blue-500 to-cyan-500',
    details: [
      'Real-time agent activity monitoring',
      'Code review and approval workflows',
      'Human intervention and guidance tools',
      'Quality assurance checkpoints',
      'Performance metrics and analytics'
    ],
    stats: [
      { label: 'Active Teams', value: '5,000+' },
      { label: 'Daily Handoffs', value: '100K+' },
      { label: 'Quality Score', value: '9.8/10' }
    ]
  }
];

export default function FeaturesContent() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Premium gradient background */}
      <div className="fixed inset-0 gradient-mesh opacity-20 pointer-events-none" />
      
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full animate-blob" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-gradient-to-tl from-pink-500/10 to-indigo-500/10 rounded-full animate-blob animation-delay-2000" />
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
                <Sparkles className="w-4 h-4 text-indigo-400" />
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
                              <ChevronRight className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
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

                    {/* Visual Side - Stats Card */}
                    <motion.div 
                      className={isEven ? 'lg:order-2' : 'lg:order-1'}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <div className="glass rounded-3xl p-10 hover-glow">
                        <div className="space-y-8">
                          {/* Feature Badge */}
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.gradient} bg-opacity-10`}>
                            <Activity className="w-4 h-4 text-white" />
                            <span className="text-sm font-medium text-white">Live Metrics</span>
                          </div>

                          {/* Stats Grid */}
                          {feature.stats && (
                            <div className="grid grid-cols-3 gap-6">
                              {feature.stats.map((stat, statIndex) => (
                                <motion.div 
                                  key={statIndex}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.5, delay: 0.5 + statIndex * 0.1 }}
                                  className="text-center"
                                >
                                  <div className="text-2xl md:text-3xl font-bold text-gradient-primary mb-1">
                                    {stat.value}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {stat.label}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {/* Security Badges */}
                          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-800">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Shield className="w-4 h-4" />
                              <span>SOC 2 Certified</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Lock className="w-4 h-4" />
                              <span>End-to-End Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Zap className="w-4 h-4" />
                              <span>99.99% SLA</span>
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
              <div className="grid md:grid-cols-4 gap-8 text-center">
                {[
                  { icon: GitBranch, name: 'GitHub', desc: 'Native Integration' },
                  { icon: Code2, name: 'VS Code', desc: 'Extension Available' },
                  { icon: Shield, name: 'AWS', desc: 'Cloud Infrastructure' },
                  { icon: Zap, name: 'Slack', desc: 'Real-time Updates' }
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
                        <IntIcon className="w-8 h-8 text-indigo-400" />
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