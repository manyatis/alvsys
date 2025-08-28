'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className={`bg-black/50 border border-white/10 rounded-lg p-4 relative group ${className}`}>
      <code className="text-emerald-400 font-mono text-sm block overflow-x-auto">
        {code}
      </code>
      <button
        onClick={() => handleCopy(code, copyId)}
        className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
        title="Copy to clipboard"
      >
        {copiedItem === copyId ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 gradient-mesh opacity-15 pointer-events-none" />
      
      {/* Animated blobs for subtle depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[120%] h-[120%] bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full animate-blob" />
        <div className="absolute -bottom-1/2 -right-1/2 w-[100%] h-[100%] bg-gradient-to-tl from-green-500/4 to-transparent rounded-full animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              <span className="text-gradient-primary">Installation Guide</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Connect Claude Code to Alvsys and supercharge your development workflow with AI-powered issue management
            </p>
          </motion.div>

          {/* Quick Start */}
          <motion.div 
            className="glass rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-emerald-400" />
              <h2 className="text-2xl font-semibold">Quick Start</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p className="font-medium">Get up and running in 3 steps:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Install Claude Code from Anthropic</li>
                <li>Create a Alvsys project and get your API key</li>
                <li>Connect Claude to Alvsys using the MCP command below</li>
              </ol>
            </div>
          </motion.div>

          <div className="space-y-8">
            {/* Step 1: Claude Installation */}
            <motion.section 
              className="glass rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                  <Bot className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-semibold">1. Install Claude Code</h2>
              </div>
              
              <p className="text-gray-400 mb-4">

                First, you&apos;ll need to install Claude Code from Anthropic. This is your AI coding assistant that will work with Alvsys.
              </p>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <p className="text-yellow-400/90 text-sm">
                  <strong>Note:</strong> Claude Code requires a Claude Pro subscription and is currently available for macOS and VS Code.
                </p>
              </div>

              <a 
                href="https://claude.ai/code" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-premium text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Install Claude Code
              </a>
            </motion.section>

            {/* Step 2: Create Project */}
            <motion.section 
              className="glass rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <GitBranch className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-semibold">2. Set Up Your Project</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Option A: Create New Project</h3>
                  <p className="text-gray-400 mb-4">
                    Start fresh with a new Alvsys project:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 ml-4">
                    <li>Sign up at <a href="https://alvsys.com" className="text-emerald-400 hover:text-emerald-300 underline">alvsys.com</a></li>
                    <li>Click &quot;Create New Project&quot; on your dashboard</li>
                    <li>Give your project a name and description</li>
                    <li>Your project ID will be automatically generated</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Option B: Import from GitHub</h3>
                  <p className="text-gray-400 mb-4">
                    Connect an existing GitHub repository:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 ml-4">
                    <li>Go to your Alvsys dashboard</li>
                    <li>Click &quot;Import from GitHub&quot;</li>
                    <li>Authorize the GitHub integration</li>
                    <li>Select your repository</li>
                    <li>Your issues will be automatically imported</li>
                  </ol>
                </div>
              </div>
            </motion.section>

            {/* Step 3: GitHub Actions */}
            <motion.section 
              className="glass rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-lime-500 to-green-500">
                  <Settings className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-semibold">3. GitHub Actions (Optional)</h2>
              </div>

              <p className="text-gray-400 mb-4">
                Set up GitHub Actions to automatically sync your repository with Alvsys:
              </p>

              <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                <h4 className="font-medium mb-2">Benefits of GitHub Actions:</h4>
                <ul className="text-gray-400 space-y-1 text-sm">
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
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Learn more about GitHub Actions setup
              </a>
            </motion.section>

            {/* Step 4: Get Credentials */}
            <motion.section 
              className="glass rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500">
                  <Settings className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-semibold">4. Get Your Credentials</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Find Your Project ID</h3>
                  <p className="text-gray-400 mb-3">

                    You&apos;ll need your Project ID to connect Claude Code to Alvsys:

                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 ml-4 mb-4">
                    <li>Go to <a href="/account" className="text-emerald-400 hover:text-emerald-300 underline">Account Settings</a></li>
                    <li>Click on the &quot;Projects&quot; tab</li>
                    <li>Find your project and copy the Project ID</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Generate API Token</h3>
                  <p className="text-gray-400 mb-3">
                    Create a secure API token for authentication:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-400 ml-4 mb-4">
                    <li>Go to <a href="/account" className="text-emerald-400 hover:text-emerald-300 underline">Account Settings</a></li>
                    <li>Click on the &quot;API Keys&quot; tab</li>
                    <li>Click &quot;Generate New Key&quot;</li>
                    <li>Give it a descriptive name (e.g., &quot;Claude Code&quot;)</li>
                    <li>Copy and securely store the generated token</li>
                  </ol>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-400/90 text-sm">
                      <strong>Important:</strong> Store your API token securely. You won&apos;t be able to see it again after creation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Step 5: MCP Connection */}
            <motion.section 
              className="glass rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500">
                  <Bot className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-semibold">5. Connect Claude Code to Alvsys</h2>
              </div>

              <p className="text-gray-400 mb-6">
                Use the Model Context Protocol (MCP) to connect Claude Code to your Alvsys project:
              </p>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium">Installation Command</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Replace YOUR_PROJECT_ID and YOUR_API_KEY with your actual values:
                </p>
                <CodeBlock
                  code='claude mcp add --transport http alvsys https://alvsys.com/api/llm/mcp --header "X-Project-Id: YOUR_PROJECT_ID" --header "Authorization: Bearer YOUR_API_KEY"'
                  copyId="mcp-install"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-2">Environment Variable (Optional)</h4>
                <p className="text-blue-400/80 text-sm mb-3">
                  Set this environment variable to avoid passing project IDs manually:
                </p>
                <CodeBlock
                  code="export VIBE_HERO_PROJECT_ID=YOUR_PROJECT_ID"
                  copyId="env-var"
                  className="bg-blue-950/50"
                />
              </div>
            </motion.section>

            {/* Step 6: Example Commands */}
            <motion.section 
              className="glass rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
                  <Play className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-semibold">6. Example Commands</h2>
              </div>

              <p className="text-gray-400 mb-6">
                Once connected, try these commands with Claude Code:
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">List Issues</h3>
                  <p className="text-gray-400 text-sm mb-3">Get an overview of all issues in your project:</p>
                  <CodeBlock
                    code="show me all the issues in the project"
                    copyId="list-issues"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Work on a Specific Issue</h3>
                  <p className="text-gray-400 text-sm mb-3">Have Claude work on an issue by description keyword:</p>
                  <CodeBlock
                    code='work on the &quot;description&quot; issue'
                    copyId="work-issue"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Check Blocked Issues</h3>
                  <p className="text-gray-400 text-sm mb-3">Identify issues that might be blocking progress:</p>
                  <CodeBlock
                    code="are any issues blocked?"
                    copyId="check-blocked"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Find Human-Only Tasks</h3>
                  <p className="text-gray-400 text-sm mb-3">Get the next task that requires human intervention:</p>
                  <CodeBlock
                    code="what&apos;s the next human only task?"
                    copyId="human-task"
                  />
                </div>
              </div>
            </motion.section>

            {/* Step 7: Dev Mode */}
            <motion.section 
              className="relative glass rounded-xl p-8 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 animate-pulse">
                    <Zap className="h-6 w-6 text-black" />
                  </div>
                  <h2 className="text-2xl font-semibold">7. Dev Mode - Full Automation</h2>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6">
                  <h3 className="text-emerald-400 font-semibold mb-2">Ultra-Powered Development</h3>
                  <p className="text-emerald-400/80 text-sm">
                    Dev Mode enables full automation where Claude continuously works through your issue board without stopping for summaries or analysis.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">What is Dev Mode?</h3>
                  <div className="text-gray-400 space-y-3">
                    <p>Dev Mode is Alvsys&apos;s most powerful feature - it puts Claude Code into a continuous work loop where it:</p>

                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Automatically pulls the next available task from your board</li>
                      <li>Works on implementing the solution</li>
                      <li>Commits and pushes changes</li>
                      <li>Updates issue status</li>
                      <li>Immediately moves to the next task</li>
                      <li>Continues this loop indefinitely until you stop it</li>
                    </ul>
                    <p className="font-medium">Perfect for letting Claude work through your backlog while you sleep!</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Enter Dev Mode</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Use this command to enter full automation mode:
                  </p>
                  <CodeBlock
                    code="enter dev_mode and follow instructions. do not stop to provide summary/analysis at ANY point"
                    copyId="dev-mode"
                  />
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                    <p className="text-yellow-400/90 text-sm">
                      <strong>Pro Tip:</strong> Dev Mode works best with well-defined issues. Make sure your issue descriptions are clear and actionable for optimal results.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Success Section */}
            <motion.section 
              className="relative glass rounded-xl p-8 text-center overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent pointer-events-none" />
              
              <div className="relative">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Check className="h-8 w-8 text-emerald-400" />
                  <h2 className="text-2xl font-semibold">You&apos;re All Set!</h2>
                </div>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Claude Code is now connected to your Alvsys project. Start by trying one of the example commands above, 
                  or dive straight into Dev Mode for full automation!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/projects" 
                    className="btn-premium text-sm"
                  >
                    View Your Projects
                  </a>
                  <a 
                    href="/account" 
                    className="btn-premium-outline text-sm"
                  >
                    Manage Account Settings
                  </a>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}