'use client'

import { useState } from 'react'

interface GetStartedModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GetStartedModal({ isOpen, onClose }: GetStartedModalProps) {
  const [activeTab, setActiveTab] = useState<'desktop' | 'code'>('code')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Get Started with VibeHero & @claude
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Connect @claude GitHub action to automatically work on your VibeHero issues
          </p>
        </div>
        
        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Setup method tabs */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'desktop'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                GitHub Action Setup
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Quick Start
              </button>
            </div>
          </div>
          
          {activeTab === 'desktop' && (
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Install @claude GitHub Action
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Add the @claude GitHub action to your repository to automatically work on VibeHero issues:
                </p>
                <div className="ml-11 space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>GitHub Marketplace:</strong> Install the @claude GitHub action from the <a href="https://github.com/marketplace/actions/claude-code-action" target="_blank" rel="noopener noreferrer" className="underline">GitHub Marketplace</a>
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      The @claude GitHub action automatically triggers when:
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• New issues are created in VibeHero</li>
                      <li>• Issues are assigned to @claude</li>
                      <li>• Comments mention @claude</li>
                      <li>• Pull requests need review or assistance</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Connect VibeHero to GitHub
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Link your VibeHero project to your GitHub repository:
                </p>
                
                <div className="ml-11 space-y-3">
                  <ol className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-2">
                    <li>Go to your VibeHero project settings</li>
                    <li>Navigate to GitHub Integration section</li>
                    <li>Connect your GitHub account and select the repository</li>
                    <li>Enable issue synchronization between VibeHero and GitHub</li>
                  </ol>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Integration Note:</strong> Once connected, issues created in VibeHero will automatically sync to GitHub and trigger @claude workflows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Create Issues in VibeHero
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Start creating tasks and watch @claude automatically work on them:
                </p>
                
                <div className="ml-11 space-y-3">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <div className="text-sm text-green-800 dark:text-green-200">
                        <p><strong>Automatic Workflow:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• Create an issue in VibeHero</li>
                          <li>• Issue automatically syncs to GitHub</li>
                          <li>• @claude GitHub action triggers automatically</li>
                          <li>• Claude starts working on the issue</li>
                          <li>• Progress updates sync back to VibeHero</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Watch @claude Work
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Monitor progress as @claude automatically works on your VibeHero issues:
                </p>
                
                <div className="ml-11 space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      <strong>Real-time Updates:</strong> Watch as @claude provides updates, creates PRs, and marks tasks complete in both GitHub and VibeHero.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">What @claude Can Do:</h4>
                    <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                      <li>• Implement new features from issue descriptions</li>
                      <li>• Fix bugs and create pull requests</li>
                      <li>• Write tests and documentation</li>
                      <li>• Update issue statuses automatically</li>
                      <li>• Provide progress comments and updates</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Get Started:</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Create your first issue in VibeHero and watch the magic happen!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-8">
              {/* Step 1 - Quick Setup */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Create Your First Project
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Start by creating a new project in VibeHero and connecting it to your GitHub repository:
                </p>
                <div className="ml-11 space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Quick Start:</strong> Click &quot;Get Started&quot; or &quot;Projects&quot; to create your first VibeHero project.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Once your project is created, you can:
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                      <li>• Connect your GitHub repository</li>
                      <li>• Set up GitHub integration</li>
                      <li>• Install @claude GitHub action</li>
                      <li>• Start creating issues</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 - GitHub Integration */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Install @claude GitHub Action
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Add the @claude GitHub action to your repository for automatic issue handling:
                </p>
                
                <div className="ml-11 space-y-3">
                  <ol className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-2">
                    <li>Visit the <a href="https://github.com/marketplace/actions/claude-code-action" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@claude GitHub Action</a> on GitHub Marketplace</li>
                    <li>Install it on your repository</li>
                    <li>Configure permissions for issues and pull requests</li>
                    <li>Connect your VibeHero project to GitHub in project settings</li>
                  </ol>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Automatic Setup:</strong> Once installed, @claude will automatically respond to issues created from VibeHero.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 - Create Issues */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Start Creating Issues
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Create your first issue and watch @claude automatically start working:
                </p>
                
                <div className="ml-11 space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <div className="text-sm text-purple-800 dark:text-purple-200">
                        <p><strong>Creating Issues:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• Use the VibeHero project board to create new issues</li>
                          <li>• Add clear descriptions and acceptance criteria</li>
                          <li>• Issues automatically sync to GitHub</li>
                          <li>• @claude GitHub action triggers and starts work</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 - Monitor Progress */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Monitor @claude&apos;s Work
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-11">
                  Track progress as @claude works on your issues automatically:
                </p>
                
                <div className="ml-11 space-y-3">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">What You&apos;ll See:</h4>
                    <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                      <li>• <strong>Real-time Updates:</strong> Progress comments in both GitHub and VibeHero</li>
                      <li>• <strong>Pull Requests:</strong> Automatic PR creation with implemented features</li>
                      <li>• <strong>Status Changes:</strong> Issues automatically move through your workflow</li>
                      <li>• <strong>Code Quality:</strong> Tests, documentation, and best practices included</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Get Started Now:</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Ready to experience AI-powered project management? Create your first project and issue!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Resources */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Additional Resources
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://github.com/marketplace/actions/claude-code-action"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <h4 className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  @claude GitHub Action
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Install the @claude GitHub action from the marketplace
                </p>
              </a>
              <a
                href="/features"
                className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <h4 className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  VibeHero Features
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Learn about all VibeHero features including @claude integration
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}