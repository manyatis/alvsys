'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, GitBranch, Settings, Play, Bot, Zap } from 'lucide-react';

export default function InstallationPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = async (text: string, itemId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const CodeBlock = ({ code, copyId, className = "" }: { code: string; copyId: string; className?: string }) => (
    <div className={`bg-gray-900 rounded-lg p-4 relative group ${className}`}>
      <code className="text-green-400 font-mono text-sm block overflow-x-auto">
        {code}
      </code>
      <button
        onClick={() => handleCopy(code, copyId)}
        className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy to clipboard"
      >
        {copiedItem === copyId ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            MemoLab Installation Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect Claude Code to MemoLab and supercharge your development workflow with AI-powered issue management
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300">Quick Start</h2>
          </div>
          <div className="space-y-3 text-blue-800 dark:text-blue-400">
            <p className="font-medium">Get up and running in 3 steps:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Install Claude Code from Anthropic</li>
              <li>Create a MemoLab project and get your API key</li>
              <li>Connect Claude to MemoLab using the MCP command below</li>
            </ol>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1: Claude Installation */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="h-8 w-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Install Claude Code</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              First, you&apos;ll need to install Claude Code from Anthropic. This is your AI coding assistant that will work with MemoLab.
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                <strong>Note:</strong> Claude Code requires a Claude Pro subscription and is currently available for macOS and VS Code.
              </p>
            </div>

            <a 
              href="https://claude.ai/code" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              Install Claude Code
            </a>
          </section>

          {/* Step 2: Create Project */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <GitBranch className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Set Up Your Project</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Option A: Create New Project</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Start fresh with a new MemoLab project:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Sign up at <a href="https://memolab.io" className="text-purple-600 hover:text-purple-700 underline">memolab.io</a></li>
                  <li>Click &quot;Create New Project&quot; on your dashboard</li>
                  <li>Give your project a name and description</li>
                  <li>Your project ID will be automatically generated</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Option B: Import from GitHub</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Connect an existing GitHub repository:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Go to your MemoLab dashboard</li>
                  <li>Click &quot;Import from GitHub&quot;</li>
                  <li>Authorize the GitHub integration</li>
                  <li>Select your repository</li>
                  <li>Your issues will be automatically imported</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Step 3: GitHub Actions */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. GitHub Actions (Optional)</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Set up GitHub Actions to automatically sync your repository with MemoLab:
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Benefits of GitHub Actions:</h4>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                <li>• Automatic issue synchronization</li>
                <li>• Real-time status updates</li>
                <li>• Seamless PR integration</li>
                <li>• Automated project management</li>
              </ul>
            </div>

            <a 
              href="https://claude.ai/code" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Learn more about GitHub Actions setup
            </a>
          </section>

          {/* Step 4: Get Credentials */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-8 w-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Get Your Credentials</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Find Your Project ID</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  You&apos;ll need your Project ID to connect Claude Code to MemoLab:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4 mb-4">
                  <li>Go to <a href="/account" className="text-purple-600 hover:text-purple-700 underline">Account Settings</a></li>
                  <li>Click on the &quot;Projects&quot; tab</li>
                  <li>Find your project and copy the Project ID</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Generate API Token</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Create a secure API token for authentication:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4 mb-4">
                  <li>Go to <a href="/account" className="text-purple-600 hover:text-purple-700 underline">Account Settings</a></li>
                  <li>Click on the &quot;API Keys&quot; tab</li>
                  <li>Click &quot;Generate New Key&quot;</li>
                  <li>Give it a descriptive name (e.g., &quot;Claude Code&quot;)</li>
                  <li>Copy and securely store the generated token</li>
                </ol>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    <strong>Important:</strong> Store your API token securely. You won&apos;t be able to see it again after creation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 5: MCP Connection */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="h-8 w-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Connect Claude Code to MemoLab</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Use the Model Context Protocol (MCP) to connect Claude Code to your MemoLab project:
            </p>

            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Installation Command</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Replace YOUR_PROJECT_ID and YOUR_API_KEY with your actual values:
              </p>
              <CodeBlock
                code='claude mcp add --transport http memolab https://memolab.io/api/llm/mcp --header "X-Project-Id: YOUR_PROJECT_ID" --header "Authorization: Bearer YOUR_API_KEY"'
                copyId="mcp-install"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Environment Variable (Optional)</h4>
              <p className="text-blue-800 dark:text-blue-400 text-sm mb-3">
                Set this environment variable to avoid passing project IDs manually:
              </p>
              <CodeBlock
                code="export VIBE_HERO_PROJECT_ID=YOUR_PROJECT_ID"
                copyId="env-var"
                className="bg-blue-950 dark:bg-blue-950"
              />
            </div>
          </section>

          {/* Step 6: Example Commands */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Play className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Example Commands</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Once connected, try these commands with Claude Code:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">List Issues</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Get an overview of all issues in your project:</p>
                <CodeBlock
                  code="show me all the issues in the project"
                  copyId="list-issues"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Work on a Specific Issue</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Have Claude work on an issue by description keyword:</p>
                <CodeBlock
                  code='work on the &quot;description&quot; issue'
                  copyId="work-issue"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Check Blocked Issues</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Identify issues that might be blocking progress:</p>
                <CodeBlock
                  code="are any issues blocked?"
                  copyId="check-blocked"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Find Human-Only Tasks</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Get the next task that requires human intervention:</p>
                <CodeBlock
                  code="what&apos;s the next human only task?"
                  copyId="human-task"
                />
              </div>
            </div>
          </section>

          {/* Step 7: Dev Mode */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Dev Mode - Full Automation</h2>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <h3 className="text-red-900 dark:text-red-300 font-semibold mb-2">⚡ Ultra-Powered Development</h3>
              <p className="text-red-800 dark:text-red-400 text-sm">
                Dev Mode enables full automation where Claude continuously works through your issue board without stopping for summaries or analysis.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What is Dev Mode?</h3>
              <div className="text-gray-600 dark:text-gray-300 space-y-3">
                <p>Dev Mode is MemoLab&apos;s most powerful feature - it puts Claude Code into a continuous work loop where it:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Automatically pulls the next available task from your board</li>
                  <li>Works on implementing the solution</li>
                  <li>Commits and pushes changes</li>
                  <li>Updates issue status</li>
                  <li>Immediately moves to the next task</li>
                  <li>Continues this loop indefinitely until you stop it</li>
                </ul>
                <p className="font-medium">Perfect for letting Claude work through your backlog while you sleep! 🚀</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enter Dev Mode</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Use this command to enter full automation mode:
              </p>
              <CodeBlock
                code="enter dev_mode and follow instructions. do not stop to provide summary/analysis at ANY point"
                copyId="dev-mode"
              />
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  <strong>Pro Tip:</strong> Dev Mode works best with well-defined issues. Make sure your issue descriptions are clear and actionable for optimal results.
                </p>
              </div>
            </div>
          </section>

          {/* Success Section */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-300">You&apos;re All Set! 🎉</h2>
            </div>
            <p className="text-green-800 dark:text-green-400 mb-6 max-w-2xl mx-auto">
              Claude Code is now connected to your MemoLab project. Start by trying one of the example commands above, 
              or dive straight into Dev Mode for full automation!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/projects" 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Your Projects
              </a>
              <a 
                href="/account" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Manage Account Settings
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}