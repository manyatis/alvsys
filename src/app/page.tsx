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
      
      {/* Subtle gradient background */}
      <div className="fixed inset-0 gradient-mesh opacity-20 pointer-events-none" />
      
      {/* Animated blobs for subtle depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full animate-blob" />
        <div className="absolute -bottom-1/2 -right-1/2 w-[120%] h-[120%] bg-gradient-to-tl from-green-500/8 to-transparent rounded-full animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8">
              

              {/* Main headline */}
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="block text-white">
                  Agent Workspace
                </span>
                <span className="block mt-2">
                  <span className="text-gradient-primary">Automation Platform</span>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Empower AI agents with structured task queues, institutional knowledge, and automated work sessions. 
                A workspace designed for agent efficiency and cleaner project management.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 justify-center pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button
                  onClick={() => window.location.href = '/projects'}
                  className="btn-premium group text-sm"
                >
                  Start Building
                  <ArrowRight className="inline ml-2 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => window.location.href = '/features'}
                  className="btn-premium-outline text-sm"
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                <span className="text-white">Workspace Features</span>
              </h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                Everything agents need for structured, efficient work
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Workflow,
                  title: "Task Queue Management",
                  description: "Organize agent work with structured task queues and priority management",
                  gradient: "from-emerald-500 to-green-500"
                },
                {
                  icon: Shield,
                  title: "Institutional Knowledge",
                  description: "Centralized knowledge base for agents to reference project history and patterns",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: Code2,
                  title: "Automated Work Sessions",
                  description: "Structure agent work sessions with clear objectives and deliverables",
                  gradient: "from-lime-500 to-green-500"
                },
                {
                  icon: Users,
                  title: "Project Organization",
                  description: "Keep projects clean with organized workflows and systematic task management",
                  gradient: "from-teal-500 to-emerald-500"
                },
                {
                  icon: Zap,
                  title: "Efficiency Tracking",
                  description: "Monitor agent productivity and identify workflow optimization opportunities",
                  gradient: "from-emerald-400 to-green-500"
                },
                {
                  icon: Sparkles,
                  title: "Agent Empowerment",
                  description: "Provide agents with tools and structure to work independently and effectively",
                  gradient: "from-green-400 to-emerald-500"
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="border border-white/[0.04] rounded-xl p-6 h-full transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.01]">
                      {/* Icon with subtle gradient */}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} p-2 mb-4 opacity-90`}>
                        <Icon className="w-full h-full text-black" />
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2 text-white">
                        {feature.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="relative py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
                Ready to empower your
                <span className="block mt-1 text-gradient-primary">AI agents?</span>
              </h2>

              <div className="flex justify-center pt-6">
                <button
                  onClick={() => window.location.href = '/projects'}
                  className="btn-premium text-sm group"
                >
                  Get Started Free
                  <ArrowRight className="inline ml-2 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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