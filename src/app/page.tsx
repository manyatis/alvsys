'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginModal from '@/components/login-modal';
import { Suspense } from 'react';
import CallbackHandler from '@/components/CallbackHandler';
import { ArrowRight, Sparkles, Zap, Shield, Code2, Users, Workflow } from 'lucide-react';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState('/');

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Premium gradient background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />
      
      {/* Animated blobs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full animate-blob" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-indigo-500/20 rounded-full animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8">
              

              {/* Main headline */}
              <motion.h1 
                className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className="block text-white">
                  The AI Agentic
                </span>
                <span className="block mt-2">
                  <span className="text-gradient-primary">Workplace Platform</span>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Deploy intelligent AI agents that work seamlessly alongside your development team. 
                Enterprise-grade MCP tooling, institutional knowledge, and automated workflows.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <button
                  onClick={() => window.location.href = '/projects'}
                  className="btn-premium group"
                >
                  Start Building
                  <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => window.location.href = '/features'}
                  className="btn-premium-outline"
                >
                  View Demo
                </button>
              </motion.div>

            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="w-6 h-10 border border-gray-600 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-gray-400 rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="text-gradient">Enterprise-Ready Features</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to deploy AI agents at scale
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Code2,
                  title: "MCP-Enabled Agents",
                  description: "Deploy agents with native Model Context Protocol support for seamless tool integration",
                  gradient: "from-indigo-500 to-blue-500"
                },
                {
                  icon: Shield,
                  title: "Institutional Knowledge",
                  description: "Build a vectorized repository from your entire development history",
                  gradient: "from-purple-500 to-indigo-500"
                },
                {
                  icon: Workflow,
                  title: "Bulk Automation",
                  description: "Queue and orchestrate thousands of AI tasks with intelligent distribution",
                  gradient: "from-pink-500 to-purple-500"
                },
                {
                  icon: Users,
                  title: "Human-AI Collaboration",
                  description: "Seamless handoffs between AI agents and developers with full visibility",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Zap,
                  title: "Real-time Monitoring",
                  description: "Track agent performance, costs, and outputs in real-time",
                  gradient: "from-cyan-500 to-teal-500"
                },
                {
                  icon: Sparkles,
                  title: "Self-Improving AI",
                  description: "Agents that learn from your codebase and get smarter over time",
                  gradient: "from-teal-500 to-green-500"
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="glass rounded-2xl p-8 h-full hover-glow transition-all duration-300 hover:scale-[1.02]">
                      {/* Icon with gradient background */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 mb-6`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3 text-white">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/[0.02] group-hover:to-white/[0.05] transition-all duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="relative py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                Ready to Transform Your
                <span className="block mt-2 text-gradient-primary">Development Workflow?</span>
              </h2>

              <div className="flex justify-center pt-8">
                <button
                  onClick={() => window.location.href = '/projects'}
                  className="btn-premium text-lg px-8 py-4 group"
                >
                  Get Started Free
                  <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
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