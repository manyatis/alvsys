'use client'

import { useState } from 'react'

interface GetStartedModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GetStartedModal({ isOpen, onClose }: GetStartedModalProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

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
            Get Started with VibeHero MCP
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Connect Claude Code to your VibeHero projects using the Model Context Protocol (MCP)
          </p>
        </div>
        
        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Configure Claude Code MCP Connection
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 ml-11">
                Add the VibeHero MCP server to your Claude Code configuration file:
              </p>
              <div className="ml-11 space-y-3">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Configuration Location:</strong> Create or edit <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">~/.claude/claude_desktop_config.json</code>
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 relative overflow-x-auto">
                  <button
                    onClick={() => copyToClipboard(`{
  "mcpServers": {
    "vibehero": {
      "command": "npx",
      "args": ["-y", "@vibehero/mcp-server"],
      "env": {
        "VIBE_HERO_BEARER_TOKEN": "your_bearer_token_here",
        "VIBE_HERO_PROJECT_ID": "your_project_id_here",
        "VIBE_HERO_BASE_URL": "https://vibehero.vercel.app"
      }
    }
  }
}`, 'config')}
                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedText === 'config' ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <pre className="text-sm font-mono text-slate-800 dark:text-slate-200">{`{
  "mcpServers": {
    "vibehero": {
      "command": "npx",
      "args": ["-y", "@vibehero/mcp-server"],
      "env": {
        "VIBE_HERO_BEARER_TOKEN": "your_bearer_token_here",
        "VIBE_HERO_PROJECT_ID": "your_project_id_here",
        "VIBE_HERO_BASE_URL": "https://vibehero.vercel.app"
      }
    }
  }
}`}</pre>
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
                  Get Your Bearer Token
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 ml-11">
                Generate a personal access token for secure authentication:
              </p>
              
              <div className="ml-11 space-y-3">
                <ol className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-2">
                  <li>Go to <a href="/account" className="text-blue-600 dark:text-blue-400 hover:underline">Account Settings</a> → API Keys tab</li>
                  <li>Click "Create New Key" and give it a descriptive name (e.g., "Claude Code MCP")</li>
                  <li>Copy the generated token immediately (you won't be able to see it again)</li>
                  <li>Replace <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">your_bearer_token_here</code> in the config with your token</li>
                </ol>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Security Note:</strong> Authentication is required by default. Keep your bearer token secret and never commit it to version control.
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
                  Get Your Project ID
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 ml-11">
                Find and set your default project ID for the MCP to work with:
              </p>
              
              <div className="ml-11 space-y-3">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p><strong>Where to find your Project ID:</strong></p>
                      <ul className="mt-1 space-y-1">
                        <li>• Open any project in VibeHero</li>
                        <li>• Look at the URL: <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">vibehero.vercel.app/projects/<strong>[PROJECT_ID]</strong>/board</code></li>
                        <li>• Or go to Project Settings → Copy Project ID</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Replace <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">your_project_id_here</code> in the config with your actual project ID.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Example: <code>cmek8wawo0002l704jz13jxr4</code>
                  </p>
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
                  Restart Claude and Start Using MCP
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 ml-11">
                After saving your configuration, restart Claude Code and start working with your VibeHero projects:
              </p>
              
              <div className="ml-11 space-y-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    <strong>Important:</strong> Restart Claude Code after updating the configuration file for changes to take effect.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Available Commands:</h4>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>• <strong>Get next task:</strong> "What's the next ready task in VibeHero?"</li>
                    <li>• <strong>Update status:</strong> "Mark task ABC123 as in progress"</li>
                    <li>• <strong>Add comments:</strong> "Add a comment to task ABC123: Fixed the bug"</li>
                    <li>• <strong>View backlog:</strong> "Show me the project backlog"</li>
                    <li>• <strong>Dev mode:</strong> "Start VibeHero dev mode" (auto-fetches tasks)</li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Try this first command:</h4>
                  <code className="text-sm font-mono text-slate-800 dark:text-slate-200">
                    "List my VibeHero projects"
                  </code>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Additional Resources
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/documentation"
                  className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    MCP Documentation
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Complete guide to using the VibeHero MCP server
                  </p>
                </a>
                <a
                  href="/account"
                  className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <h4 className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Generate Access Token
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Create your personal access token for MCP authentication
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}