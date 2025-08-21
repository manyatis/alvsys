'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getAllInstallations } from '@/lib/github-actions';
import { getUserProjects, Project } from '@/lib/project-functions';


interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    type: string;
    avatar_url: string;
  };
  repository_selection: string;
  repositories: Array<{
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  }>;
}

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubInstallations, setGithubInstallations] = useState<GitHubInstallation[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }
    fetchGitHubData();
    fetchProjects();
    setLoading(false);
  }, [session, status, router]);


  const fetchGitHubData = async () => {
    try {
      setLoadingGithub(true);
      // Check if user is connected via GitHub
      if (session?.user?.email && session?.user?.name) {
        try {
          const data = await getAllInstallations();
          setGithubInstallations(data.installations || []);
          setGithubConnected(true);
        } catch (error) {
          console.error('Error fetching GitHub installations:', error);
          setGithubConnected(false);
        }
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      setGithubConnected(false);
    } finally {
      setLoadingGithub(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const result = await getUserProjects();
      if (result.success) {
        setProjects(result.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
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
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };


  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Manage your account settings and MCP integration
            </p>
          </div>

          {/* User Info Section */}
          <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Information</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {session.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-medium">
                  {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* MCP Section */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">MCP Integration</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                  VibeHero uses Model Context Protocol (MCP) for AI integrations
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-2">MCP Integration Active</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                This instance of VibeHero is integrated with Claude Code via MCP. No API keys are needed.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">Connected via MCP</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">About MCP</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                  Model Context Protocol (MCP) is an open standard that enables secure, controlled connections between AI applications and external systems.
                </p>
                <a 
                  href="https://modelcontextprotocol.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm underline"
                >
                  Learn more about MCP →
                </a>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">MCP Features</h4>
                <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-1">
                  <li>• Secure, token-based authentication</li>
                  <li>• Real-time bidirectional communication</li>
                  <li>• Structured data exchange</li>
                  <li>• No API key management required</li>
                </ul>
              </div>
            </div>
          </div>

          {/* GitHub Integration Section */}
          <div className="px-6 py-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">GitHub Integration</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                  Connect your GitHub account and manage repository access
                </p>
              </div>
            </div>

            {loadingGithub ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : githubConnected ? (
              <div className="space-y-4">
                {/* GitHub Account Info */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <div>
                      <p className="text-green-700 dark:text-green-300 font-medium">
                        GitHub Connected
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        Your GitHub account is connected and ready to use
                      </p>
                    </div>
                  </div>
                </div>

                {/* GitHub Installations */}
                {githubInstallations.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-slate-900 dark:text-white mb-3">
                      GitHub App Installations
                    </h3>
                    <div className="space-y-3">
                      {githubInstallations.map((installation) => (
                        <div
                          key={installation.id}
                          className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={installation.account.avatar_url}
                              alt={installation.account.login}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {installation.account.login}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {installation.account.type} • {installation.repository_selection === 'all' ? 'All repositories' : `${installation.repositories.length} repositories`}
                              </p>
                            </div>
                          </div>
                          
                          {installation.repositories.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Accessible Repositories:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {installation.repositories.slice(0, 6).map((repo) => (
                                  <div
                                    key={repo.id}
                                    className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2"
                                  >
                                    <span className="text-xs">📦</span>
                                    <span className="truncate">
                                      {repo.name}
                                      {repo.private && (
                                        <span className="ml-1 text-xs text-slate-500 dark:text-slate-500">
                                          (private)
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                                {installation.repositories.length > 6 && (
                                  <div className="text-sm text-slate-500 dark:text-slate-500 col-span-2">
                                    ... and {installation.repositories.length - 6} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Install GitHub App Button */}
                <div className="mt-4">
                  <a
                    href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibehero'}/installations/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    {githubInstallations.length > 0 ? 'Manage GitHub App' : 'Install GitHub App'}
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                      GitHub Not Connected
                    </p>
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                      To use GitHub integration features, you need to sign in with GitHub.
                    </p>
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
                      Sign out and sign back in with GitHub to enable this feature.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MCP Integration Section */}
          <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">MCP Integration</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Environment Variable Setup</h3>
                <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                  Set this environment variable in your MCP tool to avoid having to pass project IDs manually:
                </p>
                <div className="bg-white dark:bg-slate-800 rounded-md px-3 py-2 border border-blue-200 dark:border-blue-700 font-mono text-sm">
                  <span className="text-gray-600 dark:text-gray-400">VIBE_HERO_PROJECT_ID=</span>
                  <span className="text-gray-900 dark:text-gray-100">[YOUR_PROJECT_ID]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Projects</h2>
            
            {loadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {project.name}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>Organization: {project.organization?.name || 'Personal'}</span>
                            <span>Issues: {project._count?.cards || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Project ID:</span>
                            <code className="text-xs font-mono bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                              {project.id}
                            </code>
                            <button
                              onClick={() => copyToClipboard(project.id)}
                              className="text-xs text-purple-600 hover:text-purple-700 hover:underline"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick MCP Commands
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          enter dev_mode for {projects[0]?.id || '[PROJECT_ID]'} and follow instructions
                        </code>
                        <button
                          onClick={() => copyToClipboard(`enter dev_mode for ${projects[0]?.id || '[PROJECT_ID]'} and follow instructions. do not stop to provide summary/analysis at ANY point`)}
                          className="text-xs text-purple-600 hover:text-purple-700 hover:underline ml-2"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No projects found. Create your first project to get started with MCP.
                </p>
                <button
                  onClick={() => router.push('/projects')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}