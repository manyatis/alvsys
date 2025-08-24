'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function WorkflowContent() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [showTitle, setShowTitle] = useState(false);
  const [poppedItems, setPoppedItems] = useState<number[]>([]);

  useEffect(() => {
    // Start the animation sequence
    const startSequence = async () => {
      // Show title
      setShowTitle(true);
      
      // Pop title after 6 seconds (increased from 4)
      setTimeout(() => {
        setPoppedItems(prev => [...prev, -1]);
      }, 6000);
      
      // Show steps one by one
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          setCurrentStep(i);
          
          // Pop each step after 5 seconds
          setTimeout(() => {
            setPoppedItems(prev => [...prev, i]);
          }, 5000);
        }, 6500 + (i * 2500)); // Start steps after title pops
      }
      
      // Reset and loop the animation
      setTimeout(() => {
        setShowTitle(false);
        setCurrentStep(-1);
        setPoppedItems([]);
        setTimeout(startSequence, 2000);
      }, 22000); // Adjusted total duration
    };
    
    startSequence();
  }, []);

  const steps = [
    {
      number: 1,
      title: "Link GitHub Account",
      description: "Connect your repository for seamless sync",
      position: { top: '25%', left: '20%' },
      color: "from-purple-500 to-pink-500"
    },
    {
      number: 2,
      title: "Create Issues Anywhere",
      description: "GitHub, AI agents, or visual boards",
      position: { top: '35%', right: '25%' },
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: 3,
      title: "AI Agent Work Modes",
      description: "Co-pilot or autonomous dev mode",
      position: { bottom: '35%', left: '30%' },
      color: "from-green-500 to-emerald-500"
    },
    {
      number: 4,
      title: "Review & Iterate",
      description: "Comment feedback, agent iterates",
      position: { bottom: '25%', right: '20%' },
      color: "from-orange-500 to-red-500"
    }
  ];

  const bubbleVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100,
        duration: 0.8
      }
    },
    pop: {
      scale: [1, 1.3, 0],
      opacity: [1, 0.8, 0],
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const titleBubbleVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 80
      }
    },
    pop: {
      scale: [1, 1.5, 0],
      opacity: [1, 0.7, 0],
      rotate: 360,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  // Particle effect for popped bubbles
  const ParticleEffect = ({ color }: { color: string }) => (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-3 h-3 rounded-full bg-gradient-to-br ${color}`}
          initial={{ 
            x: 0, 
            y: 0,
            opacity: 1,
            scale: 1
          }}
          animate={{
            x: Math.cos(i * 45 * Math.PI / 180) * 100,
            y: Math.sin(i * 45 * Math.PI / 180) * 100,
            opacity: 0,
            scale: 0
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            animate={{
              y: [-20, -40],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Title Bubble */}
          {showTitle && !poppedItems.includes(-1) && (
            <motion.div
              key="title"
              className="absolute"
              initial="hidden"
              animate="visible"
              exit="pop"
              variants={titleBubbleVariants}
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 p-8 rounded-3xl shadow-2xl backdrop-blur-lg bg-opacity-90 border-2 border-white/20">
                  <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
                    VibeHero
                  </h1>
                  <p className="text-xl md:text-2xl text-purple-100 text-center mt-2">
                    Vibe Coding Meets Project Management
                  </p>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-40 -z-10 animate-pulse"></div>
              </div>
            </motion.div>
          )}
          
          {/* Particle effect when title pops */}
          {poppedItems.includes(-1) && showTitle && (
            <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <ParticleEffect color="from-purple-600 to-pink-600" />
            </div>
          )}

          {/* Step Bubbles */}
          {steps.map((step, index) => (
            <AnimatePresence key={step.number}>
              {currentStep >= index && !poppedItems.includes(index) && (
                <motion.div
                  className="absolute"
                  initial="hidden"
                  animate="visible"
                  exit="pop"
                  variants={bubbleVariants}
                  style={step.position}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative group">
                    <div className={`bg-gradient-to-br ${step.color} p-6 rounded-2xl shadow-xl backdrop-blur-lg bg-opacity-90 border-2 border-white/20 cursor-pointer transform transition-transform hover:rotate-3`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-bold text-white bg-white/20 w-12 h-12 rounded-full flex items-center justify-center">
                          {step.number}
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-white/90 text-sm">
                        {step.description}
                      </p>
                    </div>
                    <div className={`absolute -inset-4 bg-gradient-to-r ${step.color} rounded-2xl blur-xl opacity-30 -z-10 group-hover:opacity-50 transition-opacity`}></div>
                  </div>
                </motion.div>
              )}
              
              {/* Particle effect when step pops */}
              {poppedItems.includes(index) && currentStep >= index && (
                <div className="absolute" style={step.position}>
                  <ParticleEffect color={step.color} />
                </div>
              )}
            </AnimatePresence>
          ))}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >

        </motion.div>
      </div>
    </div>
  );
}