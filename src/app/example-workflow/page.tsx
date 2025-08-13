'use client';

import { useState } from 'react';
import { 
  Play,
  Plus,
  Copy,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Zap,
  FileText,
  Eye,
  Target,
  Bot,
  UserCheck
} from 'lucide-react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{className?: string}>;
  screenshot: string;
  details: string[];
  tips?: string[];
}

export default function ExampleWorkflowPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const workflowSteps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Set Up Your Project',
      description: 'Create a new project and configure your organization settings',
      icon: Plus,
      screenshot: '/create project.png',
      details: [
        'Navigate to the Projects page and click "Create New Project"',
        'Enter your project name and description',
        'Configure your organization settings and team members',
        'Set up project-specific labels and priorities',
        'Your project board will be created with default columns: Refinement, To Do, In Progress, Blocked, Review, Done'
      ],
      tips: [
        'Choose a descriptive project name that reflects your product or feature',
        'Invite team members early so they can start contributing stories',
        'Set up labels for different types of work (bug, feature, improvement, etc.)'
      ]
    },
    {
      id: 2,
      title: 'Create User Stories',
      description: 'Add detailed user stories with clear acceptance criteria',
      icon: FileText,
      screenshot: '/create issue.png',
      details: [
        'Click the "+" button in any column to create a new story',
        'Write stories in user story format: "As a [user], I want [goal] so that [reason]"',
        'Add detailed descriptions explaining the context and requirements',
        'Define clear acceptance criteria that specify what "done" looks like',
        'Set appropriate priority levels (P1-P5) based on business importance',
        'Enable AI access for technical tasks that can be automated',
        'Assign team members or leave unassigned for team pickup'
      ],
      tips: [
        'Keep stories small and focused on a single feature',
        'Include mockups or examples for UI-related stories',
        'Write acceptance criteria as testable conditions'
      ]
    },
    {
      id: 3,
      title: 'Set Up API Key (Required)',
      description: 'Create and configure your API key file for AI agent authentication',
      icon: Copy,
      screenshot: '/generate api key.png',
      details: [
        'Navigate to your account settings (click your avatar → Account Settings) to generate a new API key',
        'Create a file named "api_key.txt" in your project\'s root directory (same level as package.json)',
        'Copy your generated API key (starting with "vhk_") into this file - the key should be 52 characters long',
        'Ensure the api_key.txt file is added to your .gitignore to keep it secure and never commit it',
        'This API key authenticates AI agents to access your project data and perform automated tasks',
        'The key is required for all AI agent operations, task management, and status updates',
        'Each API key is project-specific and provides access only to that project\'s data'
      ],
      tips: [
        'Never commit your API key to version control - keep it in .gitignore',
        'Store your API key securely and regenerate if compromised',
        'The api_key.txt file should contain only the key with no extra spaces or newlines',
        'You can verify the file is correct - it should be exactly 52 characters starting with "vhk_"',
        'Each project has its own unique API key for security isolation'
      ]
    },
    {
      id: 4,
      title: 'Copy the AI Onboard Link',
      description: 'Get your project\'s AI agent onboarding URL to connect automated agents',
      icon: Copy,
      screenshot: '/copy_onboarding_link.png',
      details: [
        'Open your project board and look for the onboard link in the sidebar',
        'Click the copy button to get your unique AI agent onboarding URL',
        'This URL contains your project ID and provides agents with context about your project',
        'The onboarding endpoint gives agents information about your stories, priorities, and workflow',
        'You can share this link with multiple AI agents for collaborative work'
      ],
      tips: [
        'Keep your onboard link secure - it provides access to your project',
        'The link includes real-time project data and available tasks',
        'You can regenerate the link if needed for security purposes'
      ]
    },
    {
      id: 5,
      title: 'Give Link to Your AI Agent',
      description: 'Connect your AI assistant to start automated development work',
      icon: Bot,
      screenshot: '/give onboarding link to ai.png',
      details: [
        'Share the onboard link with your AI agent (Claude Code, GitHub Copilot, etc.)',
        'The agent will use both the onboard link and your api_key.txt file for authentication',
        'The agent will call the API to understand your project structure and available tasks',
        'Agents automatically fetch the highest priority "Ready" tasks from your board',
        'They update task status to "In Progress" when starting work',
        'Agents add progress comments as they work through implementation',
        'All AI activity is logged and visible to your team in real-time'
      ],
      tips: [
        'Start with simple, well-defined tasks for AI agents',
        'Provide detailed acceptance criteria for better AI results',
        'Ensure both the onboard link and api_key.txt file are accessible to your AI agent',
        'Monitor AI progress through the board and comments'
      ]
    },
    {
      id: 6,
      title: 'Watch Status Updates',
      description: 'Monitor real-time progress as tasks move through your board',
      icon: RefreshCw,
      screenshot: '/track tasks and progress.png',
      details: [
        'Tasks automatically move between columns as work progresses',
        'AI agents update status from "Ready" → "In Progress" → "Ready for Review"',
        'Team members can drag and drop tasks between columns manually',
        'Status changes are reflected immediately across all team members\' views',
        'The board refreshes every 20 seconds to show the latest updates',
        'Each status change creates an activity log entry for audit trail'
      ],
      tips: [
        'Use the "Blocked" column when tasks need additional information',
        'Check the activity log to understand why tasks moved between columns',
        'Set up notifications to get alerted about important status changes'
      ]
    },
    {
      id: 7,
      title: 'Review and Provide Feedback',
      description: 'Review completed work and guide next steps through comments',
      icon: Eye,
      screenshot: '/provide feedback to the agent.png',
      details: [
        'Click on tasks in "Ready for Review" to see detailed work completed',
        'Review all acceptance criteria to ensure they\'ve been met',
        'Check code quality, testing, and documentation standards',
        'Add comments with specific feedback, suggestions, or approval',
        'Use @mentions to notify specific team members about issues',
        'Move tasks to "Done" if approved, or back to "In Progress" for more work'
      ],
      tips: [
        'Provide constructive feedback with specific improvement suggestions',
        'Test the functionality thoroughly before approving',
        'Document any new requirements or edge cases discovered during review'
      ]
    }
  ];

  const currentStepData = workflowSteps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Play className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Example Workflow
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Follow this step-by-step guide to see how VibeHero enables seamless collaboration between human teams and AI agents
            </p>
            <div className="flex items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Create Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span>AI Collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                <span>Review Process</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 py-4 overflow-x-auto">
            {workflowSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  currentStep === step.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep === step.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {step.id}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        {currentStepData && (
          <div className="max-w-6xl mx-auto">
            {/* Step Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                  <currentStepData.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Step {currentStepData.id}: {currentStepData.title}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {currentStepData.description}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Screenshot Section */}
              <div className="order-2 lg:order-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Visual Example
                  </h3>
                  
                  {/* Actual screenshot */}
                  <div className="rounded-xl overflow-hidden mb-4 border border-gray-200 dark:border-gray-600">
                    <img
                      src={currentStepData.screenshot}
                      alt={`Screenshot showing ${currentStepData.title}`}
                      className="w-full h-auto object-contain bg-white dark:bg-gray-800"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Step-by-step visual guide showing the VibeHero interface for {currentStepData.title.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Details Section */}
              <div className="order-1 lg:order-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    What Happens
                  </h3>
                  <ul className="space-y-3">
                    {currentStepData.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentStepData.tips && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Pro Tips
                    </h3>
                    <ul className="space-y-2">
                      {currentStepData.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {tip}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Previous Step
              </button>

              <div className="flex items-center gap-2">
                {workflowSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index + 1 === currentStep
                        ? 'bg-purple-600'
                        : index + 1 < currentStep
                        ? 'bg-green-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(Math.min(workflowSteps.length, currentStep + 1))}
                disabled={currentStep === workflowSteps.length}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t border-purple-200 dark:border-purple-700/50">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Complete Workflow Overview
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Setup & Planning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Create project, add stories, and set priorities for your team
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI + Human Execution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI agents pick up tasks and complete them automatically along side human developers
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Human Review</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Review, provide feedback, and iterate on completed work
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/projects"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                Start Your First Project
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}