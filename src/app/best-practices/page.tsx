'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Users, 
  GitBranch, 
  TestTube2, 
  Eye, 
  Zap,
  Star,
  Target,
  FileText,
  MessageSquare,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: string[];
}

export default function BestPracticesPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['story-creation']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections: Section[] = [
    {
      id: 'story-creation',
      title: 'Creating Clear Stories',
      icon: FileText,
      items: [
        'Write user stories in the format: "As a [user], I want [goal] so that [reason]"',
        'Include specific acceptance criteria that define "done"',
        'Keep stories small and focused on a single feature or improvement',
        'Use clear, non-technical language that stakeholders can understand',
        'Add examples or mockups when visual changes are involved',
        'Tag stories appropriately (bug, feature, improvement, etc.)',
        'Estimate effort realistically and break down large stories',
        'Include edge cases and error scenarios in acceptance criteria'
      ]
    },
    {
      id: 'prioritization',
      title: 'Effective Prioritization',
      icon: Target,
      items: [
        'Use consistent priority levels: P1 (Critical), P2 (High), P3 (Medium), P4 (Low), P5 (Nice-to-have)',
        'P1: Production issues, security vulnerabilities, blocking bugs',
        'P2: Important features, performance issues, user experience improvements',
        'P3: Standard features, minor bugs, code improvements',
        'P4: Technical debt, documentation, minor enhancements',
        'P5: Wishlist items, experimental features, future considerations',
        'Review and adjust priorities regularly in team meetings',
        'Consider business impact, user experience, and technical complexity',
        'Limit work in progress - focus on completing high-priority items first'
      ]
    },
    {
      id: 'review-process',
      title: 'Code Review & Quality Assurance',
      icon: Eye,
      items: [
        'Require peer review for all code changes before merging',
        'Review code for functionality, security, performance, and maintainability',
        'Test all acceptance criteria thoroughly before marking as complete',
        'Check edge cases and error handling scenarios',
        'Verify responsive design on mobile and desktop devices',
        'Run automated tests and ensure they pass',
        'Document any new dependencies or configuration changes',
        'Provide constructive feedback with specific suggestions for improvement'
      ]
    },
    {
      id: 'development-workflow',
      title: 'Development Workflow',
      icon: GitBranch,
      items: [
        'Create feature branches from main/develop branch',
        'Use descriptive branch names (feature/user-authentication, fix/login-bug)',
        'Make small, frequent commits with clear commit messages',
        'Follow conventional commit format: type(scope): description',
        'Keep branches up to date with latest main branch changes',
        'Use pull requests for all changes, even small ones',
        'Include screenshots or videos for UI changes',
        'Clean up and delete merged branches regularly'
      ]
    },
    {
      id: 'testing-strategy',
      title: 'Testing in Development',
      icon: TestTube2,
      items: [
        'Test all user flows and edge cases manually before submitting',
        'Write unit tests for complex business logic and utility functions',
        'Include integration tests for API endpoints and database interactions',
        'Test on different browsers and devices (mobile, tablet, desktop)',
        'Verify accessibility compliance (keyboard navigation, screen readers)',
        'Test with realistic data volumes and edge cases (empty states, long text)',
        'Check performance with browser dev tools and lighthouse scores',
        'Document testing steps for complex features or workflows'
      ]
    },
    {
      id: 'ai-collaboration',
      title: 'AI Agent Collaboration',
      icon: Zap,
      items: [
        'Enable AI access only for well-defined, technical tasks',
        'Provide clear acceptance criteria and examples for AI agents',
        'Include specific file paths, API endpoints, or components to modify',
        'Set realistic expectations for AI capabilities and limitations',
        'Review AI-generated code thoroughly for security and performance',
        'Provide feedback on AI work to improve future task completion',
        'Use AI for repetitive tasks, boilerplate code, and documentation',
        'Maintain human oversight for critical business logic and user-facing features'
      ]
    },
    {
      id: 'communication',
      title: 'Team Communication',
      icon: MessageSquare,
      items: [
        'Update story status regularly (In Progress, Blocked, Review, Done)',
        'Add comments when you encounter blockers or need help',
        'Share progress updates in daily standups or team channels',
        'Ask questions early rather than making assumptions',
        'Document decisions and rationale in story comments',
        'Use @mentions to notify specific team members when needed',
        'Provide context when requesting reviews or feedback',
        'Celebrate completed milestones and team achievements'
      ]
    },
    {
      id: 'continuous-improvement',
      title: 'Continuous Improvement',
      icon: TrendingUp,
      items: [
        'Hold regular retrospectives to discuss what\'s working and what isn\'t',
        'Track velocity and cycle time to identify bottlenecks',
        'Experiment with new tools and processes in small iterations',
        'Collect feedback from users and stakeholders regularly',
        'Invest time in technical debt reduction and code quality',
        'Keep documentation up to date with current processes',
        'Share learnings and best practices across the team',
        'Automate repetitive tasks to focus on high-value work'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-700 dark:to-purple-900">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Lightbulb className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Best Practices
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Learn how to create clear stories, prioritize effectively, and maintain high-quality development practices with VibeHero
            </p>
            <div className="flex items-center justify-center gap-6 text-purple-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Clear Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Effective Prioritization</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Quality Assurance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Why Best Practices Matter
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Following best practices ensures consistent, high-quality development that scales with your team. 
                  These guidelines help reduce bugs, improve collaboration, and deliver better user experiences while 
                  maintaining code quality and team productivity.
                </p>
              </div>
            </div>
          </div>

          {/* Best Practices Sections */}
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.has(section.id);
              
              return (
                <div 
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="pl-16">
                        <ul className="space-y-3">
                          {section.items.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item}
                              </p>
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

          {/* Quick Reference Card */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-700/50 p-8 mt-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-800/50 rounded-xl">
                  <RefreshCw className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Reference
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Story Priority Guide:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• <strong>P1:</strong> Critical bugs, security issues</li>
                    <li>• <strong>P2:</strong> Important features, performance</li>
                    <li>• <strong>P3:</strong> Standard features, minor bugs</li>
                    <li>• <strong>P4:</strong> Technical debt, documentation</li>
                    <li>• <strong>P5:</strong> Nice-to-have, experimental</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Review Checklist:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• ✅ All acceptance criteria met</li>
                    <li>• ✅ Code reviewed by peer</li>
                    <li>• ✅ Tests pass (manual + automated)</li>
                    <li>• ✅ Mobile responsive design</li>
                    <li>• ✅ Performance optimized</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Apply these best practices to your next project and see the difference in code quality and team productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/projects"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                  Create New Project
                </a>
                <a
                  href="/documentation"
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                >
                  View API Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}