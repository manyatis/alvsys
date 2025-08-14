'use client';

import { useState } from 'react';
import { 
  BookOpen,
  Zap,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  Shield,
  Workflow,
  Bot,
  Puzzle,
  Timer,
  TrendingUp,
  AlertTriangle,
  Star,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ProblemSolution {
  problem: string;
  solution: string;
  icon: React.ComponentType<{className?: string}>;
  benefits: string[];
}

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<{className?: string}>;
  details: string[];
}

export default function ProductGuidePage() {
  const [expandedProblem, setExpandedProblem] = useState<number | null>(0);

  const problemsSolutions: ProblemSolution[] = [
    {
      problem: "Coding Lacks Structure & Organization",
      solution: "AI-Native Agile Board with Clear Task Management",
      icon: Puzzle,
      benefits: [
        "Organize work into clear, prioritized user stories",
        "Visual kanban board shows progress at a glance",
        "Structured acceptance criteria define success",
        "Team visibility into all ongoing work"
      ]
    },
    {
      problem: "Constant Need to Prompt AI Agents",
      solution: "Autonomous AI Agent Integration",
      icon: Bot,
      benefits: [
        "AI agents automatically pick up ready tasks",
        "No need for manual prompting or micromanagement",
        "Agents work independently while you focus on strategy",
        "Built-in onboarding API for seamless agent connection"
      ]
    },
    {
      problem: "Difficulty Scaling Development Teams",
      solution: "Human + AI Collaborative Workflow",
      icon: Users,
      benefits: [
        "AI handles routine development tasks",
        "Humans focus on creative problem-solving and review",
        "Scale your development capacity without hiring",
        "Maintain quality through human oversight"
      ]
    },
    {
      problem: "Work Gets Lost or Forgotten",
      solution: "Centralized Task Queue with Status Tracking",
      icon: Timer,
      benefits: [
        "All work items tracked in a single location",
        "Real-time status updates prevent work from being lost",
        "Automatic progress logging with full audit trail",
        "Clear handoff process between team members and AI"
      ]
    }
  ];

  const coreFeatures: Feature[] = [
    {
      title: "AI-Native Design",
      description: "Built specifically for human-AI collaboration from day one",
      icon: Zap,
      details: [
        "Secure API key authentication for agent access",
        "AI onboarding API provides context and instructions",
        "Automated task assignment based on priority",
        "Real-time status synchronization across all agents",
        "Built-in logging and audit trail for AI work"
      ]
    },
    {
      title: "Structured Workflow",
      description: "Clear process from story creation to completion",
      icon: Workflow,
      details: [
        "Standard agile columns: Refinement → Ready → In Progress → Review → Done",
        "Acceptance criteria define clear success conditions",
        "Priority system (P1-P5) guides work sequencing",
        "Drag-and-drop interface for manual status updates"
      ]
    },
    {
      title: "Asynchronous Operation",
      description: "Work continues even when you're not actively managing",
      icon: Clock,
      details: [
        "AI agents work independently on queued tasks",
        "No need for constant supervision or prompting",
        "Progress updates happen automatically",
        "Wake up to completed work and progress reports"
      ]
    },
    {
      title: "Quality Assurance",
      description: "Maintain high standards with built-in review processes",
      icon: Shield,
      details: [
        "All work moves through review stages",
        "Comment system for feedback and iteration",
        "Human oversight ensures quality and alignment",
        "Clear approval process before work is marked complete"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 dark:from-purple-700 dark:via-blue-700 dark:to-purple-900">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Product Guide
            </h1>
            <p className="text-2xl text-blue-100 mb-8 leading-relaxed">
              Solve the chaos of unstructured coding with AI-native project management
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <p className="text-xl text-white leading-relaxed">
                VibeHero transforms how development teams work by providing structure, 
                automation, and seamless human-AI collaboration in a single platform.
              </p>
            </div>
            <div className="bg-amber-100/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-amber-200/30">
              <h3 className="text-lg font-bold text-amber-100 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Prerequisites for AI Agent Integration
              </h3>
              <p className="text-amber-100/90 leading-relaxed mb-3">
                Before starting with AI agents, you&apos;ll need to set up authentication:
              </p>
              <ul className="text-amber-100/90 leading-relaxed space-y-1 text-left max-w-2xl mx-auto">
                <li>• Generate an API key from your account settings</li>
                <li>• Create an &quot;api_key.txt&quot; file in your project root directory</li>
                <li>• Add the API key to this file (starting with &quot;vhk_&quot;)</li>
                <li>• Ensure &quot;api_key.txt&quot; is in your .gitignore for security</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/example-workflow"
                className="flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Play className="h-5 w-5" />
                See How It Works
              </a>
              <a
                href="/projects"
                className="flex items-center gap-2 px-8 py-4 bg-purple-500/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-purple-500/30 transition-colors"
              >
                <Zap className="h-5 w-5" />
                Start Building
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            The Problems We Solve
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Modern development faces unique challenges that traditional tools weren&apos;t designed to handle
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
          {problemsSolutions.map((item, index) => {
            const Icon = item.icon;
            const isExpanded = expandedProblem === index;
            
            return (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedProblem(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                        Problem: {item.problem}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                          Solution: {item.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="ml-22 bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        How VibeHero Helps:
                      </h4>
                      <ul className="space-y-2">
                        {item.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Features Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Star className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need for structured, AI-enhanced development
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2" />
                        <span className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* The Vision Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Vision
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform how software is built by enabling seamless collaboration between humans and AI agents
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Line Up Work, Let AI Execute
                </h3>
                <p className="text-lg leading-relaxed">
                  Create a backlog of well-defined tasks, priorities, and acceptance criteria. 
                  AI agents automatically pick up work and execute it according to your specifications, 
                  while you focus on strategy and oversight.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Asynchronous by Design
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  No more sitting around waiting for AI responses or manually prompting for each task. 
                  Set up your work queue and let the system operate autonomously while you sleep, 
                  meeting, or working on other projects.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  The Future of Development
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Teams using VibeHero report 3x faster development cycles, 
                  reduced context switching, and more time for creative problem-solving 
                  rather than routine implementation.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">3x</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Faster Cycles</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">AI Work</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">100%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Visibility</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Development Process?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Start building with structure, automation, and AI collaboration today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/projects"
                className="flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Zap className="h-5 w-5" />
                Create Your First Project
              </a>
              <a
                href="/example-workflow"
                className="flex items-center gap-2 px-8 py-4 bg-purple-500/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-purple-500/30 transition-colors"
              >
                <Play className="h-5 w-5" />
                Watch the Workflow
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}