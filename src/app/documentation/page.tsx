'use client';

import { useState } from 'react';
import Footer from '@/components/Footer';

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'authentication', title: 'Authentication' },
    { id: 'cards', title: 'Issues API' },
    { id: 'comments', title: 'Comments API' },
    { id: 'labels', title: 'Labels API' },
    { id: 'projects', title: 'Projects API' },
    { id: 'organizations', title: 'Organizations API' },
    { id: 'ai-endpoints', title: 'AI Endpoints' },
    { id: 'webhooks', title: 'Webhooks' },
    { id: 'errors', title: 'Error Handling' },
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
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">API Overview</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    The VibeHero API provides programmatic access to our AI-native issue tracking platform. 
                    Build integrations, automate workflows, and let AI agents interact with your development process.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Base URL</h3>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono">
                    https://api.vibehero.com/api
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Rate Limits</h3>
                  <ul className="text-slate-600 dark:text-slate-300">
                    <li><strong>Free Tier:</strong> 100 requests/hour</li>
                    <li><strong>Indie Tier:</strong> 1,000 requests/hour</li>
                    <li><strong>Professional Tier:</strong> 10,000 requests/hour</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Content Type</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    All API requests should include the following header:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono">
                    Content-Type: application/json
                  </div>
                </div>
              </div>
            )}

            {/* Authentication Section */}
            {activeSection === 'authentication' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Authentication</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    VibeHero uses session-based authentication for web applications and API keys for programmatic access.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Session Authentication</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    For web applications, include the session cookie in your requests:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm">
                    Cookie: next-auth.session-token=your-session-token
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">API Key Authentication</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    For server-to-server communication, use API keys in the Authorization header:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm">
                    Authorization: Bearer vs_api_your_api_key_here
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Getting API Keys</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm mt-2">
                      API keys can be generated from your account settings once logged in. Keep your API keys secure and never commit them to version control.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Issues API Section */}
            {activeSection === 'cards' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Issues API</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Manage development issues with titles, descriptions, acceptance criteria, and AI agent instructions.
                  </p>
                </div>

                {/* GET Issues */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get Issues</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Retrieve issues for a specific project with optional status filtering.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Query Parameters</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div><code className="text-purple-600 dark:text-purple-400">projectId</code> <span className="text-red-500">*</span> - Project ID to fetch issues from</div>
                      <div><code className="text-purple-600 dark:text-purple-400">status</code> - Filter by status (REFINEMENT, READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED)</div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example Request</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="text-green-600 dark:text-green-400">GET</div>
                    <div className="text-slate-700 dark:text-slate-300">/api/issues?projectId=clx123abc456&status=READY</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-2">
                      Cookie: next-auth.session-token=your-session-token
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 mt-4">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`[
  {
    "id": "clx789def123",
    "status": "READY",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality",
    "acceptanceCriteria": "Users can register, login, and logout",
    "isAiAllowedTask": true,
    "projectId": "clx123abc456",
    "createdBy": {
      "id": "clx456ghi789",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "agentDeveloperInstructions": [
      {
        "id": "clx111bbb222",
        "type": "GIT",
        "branchName": "feature/user-authentication",
        "createNewBranch": true,
        "instructions": "Create new feature branch"
      }
    ]
  }
]`}</pre>
                  </div>
                </div>

                {/* POST Issues */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Create Issue</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create a new issue with agent instructions.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "title": "Build real-time chat feature",
  "description": "Implement WebSocket messaging",
  "acceptanceCriteria": "Users can send/receive real-time messages",
  "projectId": "clx123abc456",
  "isAiAllowedTask": true,
  "agentInstructions": [
    {
      "type": "GIT",
      "branchName": "feature/realtime-chat",
      "createNewBranch": true,
      "instructions": "Create feature branch for chat"
    },
    {
      "type": "SPIKE",
      "webResearchPrompt": "Research WebSocket libraries for Next.js",
      "instructions": "Investigate real-time communication options"
    },
    {
      "type": "CODING",
      "codeResearchPrompt": "Review existing API patterns",
      "instructions": "Implement WebSocket server and client"
    }
  ]
}`}</pre>
                  </div>
                </div>

                {/* PUT Issues */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">
                      PUT
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues/[id]</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Update Issue</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Update an existing issue&apos;s properties and agent instructions.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example: Update Status</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "status": "IN_PROGRESS"
}`}</pre>
                  </div>
                </div>

                {/* DELETE Issues */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                      DELETE
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues/[id]</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Delete Issue</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Delete an issue and all associated agent instructions.
                  </p>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      ⚠️ This action cannot be undone. The issue and all its agent instructions will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments API Section */}
            {activeSection === 'comments' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Comments API</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Add and retrieve comments on issues for team collaboration and progress tracking.
                  </p>
                </div>

                {/* GET Comments */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues/[id]/comments</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get Comments</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Retrieve all comments for a specific issue, ordered by creation date.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Path Parameters</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div><code className="text-purple-600 dark:text-purple-400">id</code> <span className="text-red-500">*</span> - Issue ID to get comments for</div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`[
  {
    "id": "clx111aaa222",
    "content": "Started working on the login functionality",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "isAiComment": true,
    "user": {
      "id": "ai-agent",
      "name": "Claude",
      "email": "claude@vibehero.com"
    }
  },
  {
    "id": "clx222bbb333", 
    "content": "Looks good! Please add error handling",
    "createdAt": "2024-01-15T11:15:00.000Z",
    "isAiComment": false,
    "user": {
      "id": "clx456def789",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]`}</pre>
                  </div>
                </div>

                {/* POST Comments */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues/[id]/comments</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Add Comment</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Add a new comment to an issue. Comments are automatically attributed to the authenticated user.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "content": "Added OAuth integration with Google and GitHub providers"
}`}</pre>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 mt-4">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "id": "clx333ccc444",
  "content": "Added OAuth integration with Google and GitHub providers",
  "createdAt": "2024-01-15T12:00:00.000Z",
  "isAiComment": false,
  "issueId": "clx789def123",
  "userId": "clx456def789"
}`}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Labels API Section */}
            {activeSection === 'labels' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Labels API</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Create and manage labels for categorizing issues within projects.
                  </p>
                </div>

                {/* GET Project Labels */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/projects/[id]/labels</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get Project Labels</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Retrieve all labels for a specific project, ordered alphabetically.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Path Parameters</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div><code className="text-purple-600 dark:text-purple-400">id</code> <span className="text-red-500">*</span> - Project ID to get labels for</div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`[
  {
    "id": "clx111lbl001",
    "name": "bug",
    "color": "#EF4444",
    "projectId": "clx123abc456",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": "clx222lbl002",
    "name": "feature",
    "color": "#3B82F6", 
    "projectId": "clx123abc456",
    "createdAt": "2024-01-15T10:05:00.000Z",
    "updatedAt": "2024-01-15T10:05:00.000Z"
  }
]`}</pre>
                  </div>
                </div>

                {/* POST Project Labels */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/projects/[id]/labels</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Create Label</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create a new label for a project. Color is automatically assigned if not provided.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "name": "enhancement"
}`}</pre>
                  </div>
                </div>

                {/* Assign Label to Issue */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues/[id]/labels</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Assign Label to Issue</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Assign an existing label to an issue.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "labelId": "clx111lbl001"
}`}</pre>
                  </div>
                </div>

                {/* Remove Label from Issue */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                      DELETE
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/issues/[id]/labels?labelId=[labelId]</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Remove Label from Issue</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Remove a label from an issue.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Query Parameters</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div><code className="text-purple-600 dark:text-purple-400">labelId</code> <span className="text-red-500">*</span> - Label ID to remove from the issue</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Projects API Section */}
            {activeSection === 'projects' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Projects API</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Manage projects and project memberships within organizations.
                  </p>
                </div>

                {/* GET Projects */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/projects</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get User Projects</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Retrieve all projects that the authenticated user owns or is a member of.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`[
  {
    "id": "clx123abc456",
    "name": "VibeHero Platform",
    "description": "AI-native issue tracking",
    "ownerId": "clx456def789",
    "organizationId": "clx789org001",
    "organization": {
      "id": "clx789org001",
      "name": "VibeHero Inc"
    },
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  }
]`}</pre>
                  </div>
                </div>

                {/* GET Single Project */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/projects/[id]</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get Project Details</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Retrieve detailed information about a specific project.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Path Parameters</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div><code className="text-purple-600 dark:text-purple-400">id</code> <span className="text-red-500">*</span> - Project ID</div>
                    </div>
                  </div>
                </div>

                {/* POST Projects */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/projects</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Create Project</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create a new project within an organization.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "name": "New AI Project",
  "description": "Building the next generation AI tools",
  "organizationId": "clx789org001"
}`}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Organizations API Section */}
            {activeSection === 'organizations' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Organizations API</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Manage organizations and organizational memberships.
                  </p>
                </div>

                {/* GET Organizations */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/organizations</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get User Organizations</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Retrieve all organizations that the authenticated user owns or is a member of.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`[
  {
    "id": "clx789org001",
    "name": "VibeHero Inc",
    "description": "AI-native development tools",
    "ownerId": "clx456def789",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
]`}</pre>
                  </div>
                </div>

                {/* POST Organizations */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/organizations</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Create Organization</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create a new organization with the authenticated user as the owner.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "name": "Acme Corporation",
  "description": "Building amazing software solutions"
}`}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* AI Endpoints Section */}
            {activeSection === 'ai-endpoints' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">AI Agent Endpoints</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Specialized endpoints designed for AI agents to onboard, discover, and interact with development tasks.
                  </p>
                </div>

                {/* AI Agent Onboarding */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/[project]/ai/onboard</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">AI Agent Onboarding</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Provides comprehensive onboarding instructions for AI agents joining a project. Returns system prompts, 
                    workflow instructions, and complete API documentation tailored for the specific project.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Path Parameters</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div><code className="text-purple-600 dark:text-purple-400">project</code> <span className="text-red-500">*</span> - Project ID to onboard agent for</div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example Request</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="text-green-600 dark:text-green-400">GET</div>
                    <div className="text-slate-700 dark:text-slate-300">/api/clx123abc456/ai/onboard</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-2">
                      Authorization: Bearer vs_api_your_api_key_here
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 mt-4">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "systemPrompt": "You are an AI agent working on VibeHero...",
  "workflowInstructions": "Complete 6-step workflow process...",
  "apiDocumentation": {
    "baseUrl": "/api/ai/issues",
    "supportedActions": ["next_ready", "update_status", "get_card_details"]
  },
  "projectContext": {
    "id": "clx123abc456",
    "name": "VibeHero Platform",
    "description": "AI-native agile board"
  },
  "nextSteps": "Start by calling next_ready action..."
}`}</pre>
                  </div>
                </div>

                {/* GET AI Issues */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                      GET
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/ai/issues</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get AI-Ready Cards</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Retrieve all cards that are AI-enabled and available for processing. Only returns cards with 
                    <code className="mx-1 text-purple-600 dark:text-purple-400">isAiAllowedTask: true</code> 
                    and status <code className="mx-1 text-purple-600 dark:text-purple-400">READY</code>.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Query Parameters</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div><code className="text-purple-600 dark:text-purple-400">projectId</code> - Filter cards by specific project (required)</div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Example Response</h4>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "cards": [
    {
      "id": "clx789def123",
      "title": "Implement user authentication",
      "description": "Add login and registration functionality",
      "acceptanceCriteria": "Users can register, login, and logout",
      "status": "READY",
      "priority": 1,
      "projectId": "clx123abc456",
      "agentInstructions": [
        {
          "type": "GIT",
          "branchName": "feature/user-authentication",
          "createNewBranch": true,
          "instructions": "Create new feature branch"
        }
      ],
      "project": {
        "id": "clx123abc456",
        "name": "VibeHero Platform"
      },
      "branchName": "feature/implement-user-authentication-clx789de"
    }
  ],
  "totalCount": 1
}`}</pre>
                  </div>
                </div>

                {/* POST AI Actions */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                      POST
                    </span>
                    <code className="text-lg font-mono text-slate-900 dark:text-white">/api/ai/issues</code>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">AI Actions</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Multi-action endpoint for AI agents to interact with issues. All actions require authentication and log activity.
                  </p>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Action: next_ready</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                    Get the highest priority READY task that is AI-allowed. Returns highest priority card ordered by priority then creation date.
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                    <div className="text-slate-500 dark:text-slate-400 mb-2">Request:</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "action": "next_ready",
  "projectId": "clx123abc456" // required
}`}</pre>
                    <div className="text-slate-500 dark:text-slate-400 mb-2 mt-3">Response (with task):</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "card": {
    "id": "clx789def123",
    "title": "Implement user authentication",
    "description": "Add login functionality",
    "acceptanceCriteria": "Users can register, login, logout",
    "status": "READY",
    "priority": 1,
    "projectId": "clx123abc456",
    "isAiAllowedTask": true,
    "agentInstructions": [...],
    "project": { "id": "clx123abc456", "name": "VibeHero" },
    "createdBy": { "id": "user123", "name": "Mike", "email": "mike@example.com" },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}`}</pre>
                    <div className="text-slate-500 dark:text-slate-400 mb-2 mt-3">Response (no tasks available):</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "message": "No ready tasks available. Continue polling for new tasks every 1 minute. Do not stop - keep checking for new work.",
  "card": null,
  "instruction": "Wait 60 seconds, then call next_ready API again. Repeat indefinitely until tasks become available."
}`}</pre>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Action: update_status</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                    Update a card&apos;s status with optional progress comments. Supports all statuses and creates AI comments.
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                    <div className="text-slate-500 dark:text-slate-400 mb-2">Request:</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "action": "update_status",
  "projectId": "clx123abc456", // required
  "cardId": "clx789def123", // required
  "status": "IN_PROGRESS", // required: READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED
  "comment": "Started implementing OAuth integration" // optional
}`}</pre>
                    <div className="text-slate-500 dark:text-slate-400 mb-2 mt-3">Response (with next task):</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "message": "Card status updated successfully",
  "card": {
    "id": "clx789def123",
    "status": "IN_PROGRESS", 
    "title": "Implement user authentication"
  },
  "nextCard": {
    "id": "clx456ghi789",
    "title": "Add user profiles",
    "description": "Create profile management",
    "status": "READY",
    "priority": 2,
    // ... full card object
  }
}`}</pre>
                    <div className="text-slate-500 dark:text-slate-400 mb-2 mt-3">Response (no more tasks):</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "message": "Card status updated successfully. No more ready tasks available. Continue polling for new tasks every 1 minute.",
  "card": {
    "id": "clx789def123", 
    "status": "READY_FOR_REVIEW",
    "title": "Implement user authentication"
  },
  "instruction": "Wait 60 seconds, then call next_ready API again. Do not stop - keep checking for new work."
}`}</pre>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Action: get_card_details</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                    Get comprehensive information about a specific card including all agent instructions.
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                    <div className="text-slate-500 dark:text-slate-400 mb-2">Request:</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "action": "get_card_details",
  "projectId": "clx123abc456", // required
  "cardId": "clx789def123" // required
}`}</pre>
                    <div className="text-slate-500 dark:text-slate-400 mb-2 mt-3">Response:</div>
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "card": {
    "id": "clx789def123",
    "title": "Implement user authentication",
    "description": "Add login and registration functionality",
    "acceptanceCriteria": "Users can register, login, and logout",
    "status": "READY",
    "priority": 1,
    "projectId": "clx123abc456",
    "isAiAllowedTask": true,
    "agentInstructions": [
      {
        "type": "GIT",
        "branchName": "feature/user-auth",
        "createNewBranch": true,
        "instructions": "Create feature branch"
      }
    ],
    "project": {
      "id": "clx123abc456", 
      "name": "VibeHero Platform"
    },
    "createdBy": {
      "id": "user123",
      "name": "Mike Maniatis",
      "email": "mike@example.com"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}`}</pre>
                  </div>

                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">AI Activity Logging</h4>
                  <p className="text-purple-800 dark:text-purple-200 text-sm mt-2 mb-3">
                    All AI interactions are automatically logged in the AIWorkLog table for comprehensive audit and debugging capabilities.
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="text-purple-800 dark:text-purple-200">
                      <span className="font-semibold">Logged Activities:</span>
                    </div>
                    <ul className="text-purple-700 dark:text-purple-300 space-y-1 ml-4">
                      <li>• Agent onboarding requests</li>
                      <li>• Task retrieval (next_ready, get_ready_issues)</li>
                      <li>• Status updates with optional comments</li>
                      <li>• Issue detail requests</li>
                      <li>• All request payloads and response summaries</li>
                      <li>• Timestamp and endpoint information</li>
                    </ul>
                    
                    <div className="text-purple-800 dark:text-purple-200 mt-3">
                      <span className="font-semibold">Log Structure:</span> Activity type, request payload, response summary, timestamp
                    </div>
                  </div>
                </div>

                {/* AI Agent Workflow */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Recommended AI Agent Workflow</h4>
                  <div className="text-blue-800 dark:text-blue-200 text-sm mt-3 space-y-2">
                    <div><span className="font-semibold">1. Onboarding:</span> Call <code>/api/[project]/ai/onboard</code> to receive instructions</div>
                    <div><span className="font-semibold">2. Task Selection:</span> Use <code>next_ready</code> action to get highest priority task</div>
                    <div><span className="font-semibold">3. Start Work:</span> Update status to <code>IN_PROGRESS</code> with initial comment</div>
                    <div><span className="font-semibold">4. Progress Updates:</span> Add comments during work via status updates</div>
                    <div><span className="font-semibold">5. Completion:</span> Update to <code>READY_FOR_REVIEW</code> when done</div>
                    <div><span className="font-semibold">6. Blocking:</span> Update to <code>BLOCKED</code> if assistance needed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Webhooks Section */}
            {activeSection === 'webhooks' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Webhooks</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Get real-time notifications when issues are created, updated, or completed.
                  </p>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Coming Soon</h4>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm mt-2">
                      Webhook functionality is currently in development. Subscribe to our updates to be notified when it&apos;s available.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Handling Section */}
            {activeSection === 'errors' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Error Handling</h2>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    VibeHero uses conventional HTTP response codes to indicate the success or failure of API requests.
                  </p>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">HTTP Status Codes</h3>
                  
                  <div className="space-y-4 mt-4">
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-sm font-semibold">
                          200
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">OK</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">The request was successful.</p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold">
                          201
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">Created</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">The resource was created successfully.</p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-sm font-semibold">
                          400
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">Bad Request</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">The request was invalid or cannot be served.</p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm font-semibold">
                          401
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">Unauthorized</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Authentication is required and has failed or not been provided.</p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm font-semibold">
                          403
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">Forbidden</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">The request is understood but access is denied.</p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm font-semibold">
                          404
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">Not Found</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">The requested resource could not be found.</p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm font-semibold">
                          500
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">Internal Server Error</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Something went wrong on the server.</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-8">Error Response Format</h3>
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto mt-4">
                    <pre className="text-slate-700 dark:text-slate-300">{`{
  "error": "Validation failed",
  "message": "Title is required",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}</pre>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}