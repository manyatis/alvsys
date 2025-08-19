'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserKey {
  id: string;
  keyPrefix: string;
  name: string | null;
  isActive: boolean;
  lastUsed: string | null;
  createdAt: string;
}

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
  const [userKeys, setUserKeys] = useState<UserKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [githubInstallations, setGithubInstallations] = useState<GitHubInstallation[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }
    fetchUserKeys();
    fetchGitHubData();
  }, [session, status, router]);

  const fetchUserKeys = async () => {
    try {
      const response = await fetch('/api/user/keys');
      if (response.ok) {
        const data = await response.json();
        setUserKeys(data.keys || []);
      } else {
        setError('Failed to fetch API keys');
      }
    } catch {
      setError('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubData = async () => {
    try {
      setLoadingGithub(true);
      // Check if user is connected via GitHub
      if (session?.user?.email && session?.user?.name) {
        // Try to fetch GitHub installations
        const response = await fetch('/api/github/app-installations');
        if (response.ok) {
          const data = await response.json();
          setGithubInstallations(data.installations || []);
          setGithubConnected(true);
        } else {
          // Fallback to user installations
          const userResponse = await fetch('/api/github/installations');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setGithubInstallations(userData.installations || []);
            setGithubConnected(true);
          } else {
            setGithubConnected(false);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      setGithubConnected(false);
    } finally {
      setLoadingGithub(false);
    }
  };

  const generateApiKey = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/user/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName || null }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedKey(data.apiKey);
        setNewKeyName('');
        setShowNewKeyForm(false);
        await fetchUserKeys();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate API key');
      }
    } catch {
      setError('Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  };

  const toggleKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/user/keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await fetchUserKeys();
      } else {
        setError('Failed to update API key status');
      }
    } catch {
      setError('Failed to update API key status');
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserKeys();
      } else {
        setError('Failed to delete API key');
      }
    } catch {
      setError('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string, context: string = 'Key') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(`${context} copied to clipboard!`);
      setTimeout(() => {
        setCopySuccess(null);
      }, 3000);
    }).catch(() => {
      setError('Failed to copy to clipboard');
      setTimeout(() => {
        setError(null);
      }, 3000);
    });
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
              Manage your account settings and API keys
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

          {/* API Keys Section */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">API Keys</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                  Generate and manage API keys for programmatic access
                </p>
              </div>
              <button
                onClick={() => setShowNewKeyForm(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Generate New Key
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {copySuccess && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-green-700 dark:text-green-300 text-sm">{copySuccess}</p>
              </div>
            )}

            {generatedKey && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <h3 className="text-green-800 dark:text-green-300 font-medium mb-2">New API Key Generated</h3>
                <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                  Please copy this key now. You won&apos;t be able to see it again.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-600 rounded">
                  <code className="flex-1 text-sm text-slate-900 dark:text-white font-mono break-all min-w-0">
                    {generatedKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedKey, 'API Key')}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors whitespace-nowrap self-start sm:self-center"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {showNewKeyForm && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Generate New API Key</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Key Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API, Development Key"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={generateApiKey}
                      disabled={generating}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {generating ? 'Generating...' : 'Generate Key'}
                    </button>
                    <button
                      onClick={() => {
                        setShowNewKeyForm(false);
                        setNewKeyName('');
                        setError(null);
                      }}
                      className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys List */}
            <div className="space-y-3">
              {userKeys.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">
                    No API keys found. Generate your first key to get started.
                  </p>
                </div>
              ) : (
                userKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <code className="text-sm font-mono text-slate-900 dark:text-white break-all">
                          {key.keyPrefix}...
                        </code>
                        <div className="flex items-center gap-2 flex-wrap">
                          {key.name && (
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              ({key.name})
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                              key.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {key.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                        {key.lastUsed && (
                          <span>Last used {new Date(key.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => toggleKeyStatus(key.id, !key.isActive)}
                        className={`px-3 py-2 text-sm font-medium rounded transition-colors min-w-[90px] ${
                          key.isActive
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 dark:text-yellow-300'
                            : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/40 dark:text-green-300'
                        }`}
                      >
                        {key.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="px-3 py-2 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-800/40 dark:text-red-300 rounded transition-colors min-w-[70px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
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
        </div>
      </div>
    </div>
  );
}