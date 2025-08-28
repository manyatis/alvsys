'use client';

import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Premium gradient background */}
      <div className="fixed inset-0 gradient-mesh opacity-20 pointer-events-none" />
      
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full animate-blob" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-gradient-to-tl from-pink-500/10 to-indigo-500/10 rounded-full animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
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
              <Play className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-gray-300">
                Product Demo
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              See <span className="text-gradient-primary">alvsys</span> in Action
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Watch how AI agents collaborate with your development team using MCP tooling, 
              institutional knowledge, and automated workflows.
            </p>
          </motion.div>

          {/* Main Video */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass rounded-3xl p-2 hover-glow">
              <div className="aspect-video rounded-2xl overflow-hidden bg-black/50">
                <video 
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/video-poster.jpg"
                >
                  <source src="/vibe_hero_demo_2.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </motion.div>

          {/* Key Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
              <span className="text-gradient">What You&apos;ll See</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "01",
                  title: "AI Agent Setup",
                  description: "Configure and deploy AI agents with MCP tools in minutes, not hours."
                },
                {
                  icon: "02",
                  title: "Real-time Collaboration",
                  description: "Watch AI agents work alongside developers with seamless handoffs."
                },
                {
                  icon: "03",
                  title: "Task Automation",
                  description: "Queue bulk tasks and see AI agents distribute work intelligently."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass rounded-2xl p-8"
                >
                  <div className="text-4xl font-bold text-gradient-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Demo Videos */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
              <span className="text-gradient">Feature Highlights</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "GitHub Integration",
                  description: "Seamless GitHub workflow integration",
                  videoSrc: "/Github_Integration.mp4"
                },
                {
                  title: "Board Management",
                  description: "Visual task management and tracking",
                  videoSrc: "/Board Clip.mp4"
                },
                {
                  title: "AI Development Mode",
                  description: "AI agents working in development",
                  videoSrc: "/dev_mode_clip.mp4"
                },
                {
                  title: "GitHub Actions",
                  description: "Automated CI/CD with AI agents",
                  videoSrc: "/claude_github_action.mp4"
                }
              ].map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{video.description}</p>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black/50">
                    <video 
                      className="w-full h-full object-cover"
                      controls
                      muted
                      loop
                      playsInline
                    >
                      <source src={video.videoSrc} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="glass rounded-3xl p-12 md:p-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Join the AI-powered development revolution today.
              </p>
              <button
                onClick={() => window.location.href = '/projects'}
                className="btn-premium text-lg px-8 py-4 group"
              >
                Start Building
                <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}