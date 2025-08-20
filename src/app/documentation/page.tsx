'use client';

import { useState } from 'react';

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'mcp-setup', title: 'MCP Setup' },
    { id: 'installation', title: 'Installation' },
    { id: 'configuration', title: 'Configuration' },
    { id: 'usage', title: 'Usage Examples' },
    { id: 'tools', title: 'Available Tools' },
    { id: 'troubleshooting', title: 'Troubleshooting' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-8">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">MCP Integration Overview</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    VibeHero integrates with AI assistants through the Model Context Protocol (MCP), an open standard 
                    for secure, controlled connections between AI applications and external systems.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">What is MCP?</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Model Context Protocol (MCP) is an open standard that enables AI assistants to securely 
                    connect to data sources, tools, and services. Unlike traditional APIs, MCP provides:
                  </p>
                  <ul className="text-slate-600 dark:text-slate-300">
                    <li><strong>Secure Communication:</strong> Token-based authentication with controlled access</li>
                    <li><strong>Real-time Updates:</strong> Bidirectional communication for live data</li>
                    <li><strong>Structured Data:</strong> Type-safe data exchange with schema validation</li>
                    <li><strong>No API Keys:</strong> No need to manage or rotate API credentials</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Why MCP over REST APIs?</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                    <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                      <li>• <strong>Security:</strong> No API keys to manage or expose</li>
                      <li>• <strong>Simplicity:</strong> Single connection instead of multiple HTTP endpoints</li>
                      <li>• <strong>Performance:</strong> Real-time bidirectional communication</li>
                      <li>• <strong>Reliability:</strong> Built-in error handling and reconnection logic</li>
                      <li>• <strong>Future-proof:</strong> Open standard supported by major AI platforms</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Supported AI Assistants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Claude Code</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                        Official CLI tool from Anthropic with built-in MCP support
                      </p>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Coming Soon</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                        Support for additional AI assistants is in development
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MCP Setup Section */}
            {activeSection === 'mcp-setup' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">MCP Server Setup</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    The VibeHero MCP server enables AI assistants to interact with your projects, issues, and development workflow.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Prerequisites</h3>
                  <ul className="text-slate-600 dark:text-slate-300">
                    <li>Node.js 18+ installed on your system</li>
                    <li>A VibeHero account with at least one project</li>
                    <li>Claude Code CLI tool (or compatible MCP client)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Server Features</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    The VibeHero MCP server provides the following capabilities to AI assistants:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Project Management</h4>
                      <ul className="text-slate-600 dark:text-slate-300 text-sm mt-2 space-y-1">
                        <li>• List all accessible projects</li>
                        <li>• Get project details and settings</li>
                        <li>• Switch between projects</li>
                      </ul>
                    </div>
                    
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Issue Management</h4>
                      <ul className="text-slate-600 dark:text-slate-300 text-sm mt-2 space-y-1">
                        <li>• Fetch ready tasks for AI processing</li>
                        <li>• Update issue status and progress</li>
                        <li>• Add comments and feedback</li>
                        <li>• Create new issues</li>
                      </ul>
                    </div>
                    
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Development Workflow</h4>
                      <ul className="text-slate-600 dark:text-slate-300 text-sm mt-2 space-y-1">
                        <li>• Start working on tasks</li>
                        <li>• Track progress in real-time</li>
                        <li>• Auto-fetch next available tasks</li>
                        <li>• Integration with Git workflows</li>
                      </ul>
                    </div>
                    
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Team Collaboration</h4>
                      <ul className="text-slate-600 dark:text-slate-300 text-sm mt-2 space-y-1">
                        <li>• View team member activities</li>
                        <li>• Add collaborative comments</li>
                        <li>• Sync with team workflows</li>
                        <li>• Respect project permissions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Installation Section */}
            {activeSection === 'installation' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Installation</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Install and configure the VibeHero MCP server to connect AI assistants to your projects.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Step 1: Install Claude Code</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    First, install the Claude Code CLI tool which includes built-in MCP support:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm">
                    # macOS (via Homebrew)<br/>
                    brew install claude-code<br/><br/>
                    # Windows (via Chocolatey)<br/>
                    choco install claude-code<br/><br/>
                    # Linux (via curl)<br/>
                    curl -fsSL https://anthropic.com/install-claude-code.sh | sh
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Step 2: Install VibeHero MCP Server</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Install the VibeHero MCP server package:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm">
                    npm install -g @vibehero/mcp-server
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Step 3: Configure MCP Connection</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Add VibeHero to your Claude Code MCP configuration:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`# Add to your Claude Code config file
claude-code mcp add vibehero \\
  --server-command "npx @vibehero/mcp-server" \\
  --description "VibeHero project and issue management"`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Step 4: Authenticate</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Connect to your VibeHero account through the MCP server:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm">
                    claude-code mcp connect vibehero
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">✅ Installation Complete</h4>
                    <p className="text-green-800 dark:text-green-200 text-sm mt-2">
                      Your AI assistant can now securely access VibeHero through MCP. No API keys needed!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Configuration Section */}
            {activeSection === 'configuration' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Configuration</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Configure the VibeHero MCP server to work with your specific projects and development workflow.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Basic Configuration</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    The MCP server can be configured using environment variables or a configuration file:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`# Environment Variables
export VIBEHERO_SESSION_TOKEN="your-session-token"
export VIBEHERO_PROJECT_ID="your-default-project-id"
export VIBEHERO_BASE_URL="https://vibehero.vercel.app"

# Optional: Set preferred AI behavior
export VIBEHERO_AUTO_FETCH_NEXT="true"
export VIBEHERO_DEFAULT_BRANCH="main"`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Advanced Configuration</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Create a <code>vibehero-mcp.json</code> configuration file for advanced settings:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "server": {
    "name": "vibehero",
    "version": "1.0.0"
  },
  "auth": {
    "sessionToken": "$\{VIBEHERO_SESSION_TOKEN\}",
    "baseUrl": "https://vibehero.vercel.app"
  },
  "defaults": {
    "projectId": "$\{VIBEHERO_PROJECT_ID\}",
    "autoFetchNext": true,
    "maxRetries": 3,
    "retryDelay": 1000
  },
  "features": {
    "autoComments": true,
    "progressTracking": true,
    "teamSync": true
  },
  "workflow": {
    "defaultBranch": "main",
    "branchPrefix": "feature/",
    "statusTransitions": {
      "onStart": "IN_PROGRESS",
      "onComplete": "READY_FOR_REVIEW"
    }
  }
}`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Project-Specific Settings</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Configure different settings for specific projects:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "projects": {
    "clx123abc456": {
      "name": "VibeHero Platform",
      "branchPrefix": "vh-",
      "autoFetchNext": true,
      "statusMapping": {
        "TODO": "READY",
        "DOING": "IN_PROGRESS",
        "DONE": "COMPLETED"
      }
    },
    "clx789def123": {
      "name": "Client Project",
      "branchPrefix": "client-",
      "autoFetchNext": false,
      "requireApproval": true
    }
  }
}`}</pre>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">💡 Configuration Tips</h4>
                    <ul className="text-blue-800 dark:text-blue-200 text-sm mt-2 space-y-1">
                      <li>• Use environment variables for sensitive data like session tokens</li>
                      <li>• Set project-specific configurations for different workflows</li>
                      <li>• Enable auto-fetch for AI-driven development workflows</li>
                      <li>• Configure branch prefixes to match your Git workflow</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Examples Section */}
            {activeSection === 'usage' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Usage Examples</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Common usage patterns and examples for working with VibeHero through MCP.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Basic Workflow</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Here&apos;s a typical development workflow using VibeHero MCP:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`# Start Claude Code with VibeHero MCP
claude-code --mcp vibehero

# AI assistant will automatically:
# 1. Connect to VibeHero
# 2. List available projects
# 3. Fetch ready tasks
# 4. Start working on highest priority task

# Example interaction:
> "Start working on the next available task"
AI: "Found task: 'Implement user authentication'
     Starting work on feature branch..."`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Project Management</h3>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`# List all accessible projects
> "Show me all my VibeHero projects"

# Switch to a specific project
> "Switch to the VibeHero Platform project"

# Get project details
> "What issues are ready in this project?"

# Create a new issue
> "Create a new issue: Implement dark mode toggle"`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Development Tasks</h3>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`# Get next ready task
> "What's the next task I should work on?"

# Start working on a specific task
> "Start working on the user authentication task"

# Update progress
> "Update progress: OAuth integration is 80% complete"

# Mark task as ready for review
> "This task is ready for review"`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Team Collaboration</h3>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`# Add a comment to an issue
> "Add comment: Need help with TypeScript types"

# Check team activity
> "What has the team been working on?"

# Hand off a task
> "Mark this task as blocked, needs design input"

# Review completed work
> "Show me tasks ready for review"`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Continuous Development</h3>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">🚀 AI-Driven Development</h4>
                    <p className="text-green-800 dark:text-green-200 text-sm mt-2">
                      With MCP, your AI assistant can work continuously on your projects:
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs mt-3 overflow-x-auto">
                      <pre className="text-slate-700 dark:text-slate-300">{`# Enable continuous development mode
> "Start dev mode for this project"

# AI will:
# 1. Fetch next ready task
# 2. Implement the feature
# 3. Run tests and build
# 4. Commit changes  
# 5. Mark task complete
# 6. Automatically move to next task
# 7. Repeat until no tasks remain`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Tools Section */}
            {activeSection === 'tools' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Available Tools</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    The VibeHero MCP server provides these tools to AI assistants for project and issue management.
                  </p>

                  {/* Project Tools */}
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Project Management Tools</h3>
                  
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 mt-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/list_projects</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Retrieve all projects accessible to the authenticated user
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <pre className="text-slate-700 dark:text-slate-300">Returns: Project list with IDs, names, and descriptions</pre>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/get_project</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Get detailed information about a specific project
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Parameters:</div>
                      <pre className="text-slate-700 dark:text-slate-300">project_id: string (required) - Project identifier</pre>
                    </div>
                  </div>

                  {/* Issue Management Tools */}
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Issue Management Tools</h3>
                  
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/next_ready</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Fetch the next highest priority task that&apos;s ready for work
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Parameters:</div>
                      <pre className="text-slate-700 dark:text-slate-300">project_id: string (required) - Project identifier</pre>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/start_working</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Start working on a specific task and update its status
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Parameters:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`project_id: string (required) - Project identifier
card_id: string (required) - Task/issue identifier
comment: string (optional) - Initial progress comment`}</pre>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/update_progress</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Update task status and add progress comments
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Parameters:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`project_id: string (required) - Project identifier  
card_id: string (required) - Task/issue identifier
status: string (required) - New status (READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED)
comment: string (optional) - Progress update comment`}</pre>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/add_comment</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Add a comment to an issue for team communication
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Parameters:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`card_id: string (required) - Task/issue identifier
content: string (required) - Comment text
is_ai_comment: boolean (default: true) - Mark as AI-generated`}</pre>
                    </div>
                  </div>

                  {/* Development Workflow Tools */}
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Development Workflow Tools</h3>
                  
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/dev_mode</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Enter continuous development mode - automatically process tasks
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Parameters:</div>
                      <pre className="text-slate-700 dark:text-slate-300">project_id: string (required) - Project identifier</pre>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">vibehero/create_issue</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Create a new issue in the project
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Parameters:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`project_id: string (required) - Project identifier
title: string (required) - Issue title  
description: string (optional) - Detailed description
acceptance_criteria: string (optional) - Definition of done
is_ai_allowed_task: boolean (default: true) - Allow AI processing`}</pre>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">🔧 Tool Integration</h4>
                    <p className="text-purple-800 dark:text-purple-200 text-sm mt-2">
                      All tools are automatically available to your AI assistant when connected via MCP. 
                      The assistant can chain tools together to complete complex workflows seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Troubleshooting Section */}
            {activeSection === 'troubleshooting' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Troubleshooting</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Common issues and solutions when using VibeHero with MCP.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Connection Issues</h3>
                  
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ &quot;Failed to connect to VibeHero MCP server&quot;</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      This usually indicates the MCP server isn&apos;t running or isn&apos;t properly configured.
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Solutions:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`# Check if MCP server is installed
npm list -g @vibehero/mcp-server

# Reinstall if needed
npm install -g @vibehero/mcp-server

# Verify Claude Code MCP configuration
claude-code mcp list

# Test connection manually
claude-code mcp test vibehero`}</pre>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">🔐 &quot;Authentication failed&quot;</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Your session token may be expired or invalid.
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Solutions:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`# Re-authenticate with VibeHero
claude-code mcp connect vibehero

# Check your session token
echo $VIBEHERO_SESSION_TOKEN

# Log in to VibeHero web app to refresh session
open https://vibehero.vercel.app/account`}</pre>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Permission Issues</h3>
                  
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">🚫 &quot;Access denied to project&quot;</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      You don&apos;t have access to the requested project.
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Solutions:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`# List accessible projects
> "Show me all my VibeHero projects"

# Check project membership in VibeHero web app
# Ask project owner to add you as a member`}</pre>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Performance Issues</h3>
                  
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">🐌 &quot;MCP responses are slow&quot;</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      Network latency or server load may be causing delays.
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded font-mono text-xs">
                      <div className="text-slate-500 mb-1">Solutions:</div>
                      <pre className="text-slate-700 dark:text-slate-300">{`# Check your internet connection
ping vibehero.vercel.app

# Reduce timeout in configuration
export VIBEHERO_TIMEOUT=30000

# Use project-specific configuration to limit data
# Check VibeHero status page for server issues`}</pre>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Getting Help</h3>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">📞 Support Channels</h4>
                    <ul className="text-blue-800 dark:text-blue-200 text-sm mt-2 space-y-1">
                      <li>• GitHub Issues: <a href="https://github.com/manyatis/vibehero/issues" className="underline">Report bugs and request features</a></li>
                      <li>• Documentation: Check latest MCP documentation</li>
                      <li>• Community: Join our Discord for real-time help</li>
                      <li>• Debug Logs: Enable verbose logging for detailed error information</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Debug Mode</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Enable debug mode for detailed logging:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm">
                    # Enable debug logging<br/>
                    export DEBUG=vibehero:*<br/>
                    export VIBEHERO_LOG_LEVEL=debug<br/><br/>
                    # Run Claude Code with verbose output<br/>
                    claude-code --verbose --mcp vibehero
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}