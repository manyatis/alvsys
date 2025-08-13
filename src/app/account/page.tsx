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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }
    fetchUserKeys();
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
                    onClick={() => copyToClipboard(generatedKey)}
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
        </div>
      </div>
    </div>
  );
}