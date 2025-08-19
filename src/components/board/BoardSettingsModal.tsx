'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Settings } from 'lucide-react';

interface MCPToken {
  id: string;
  keyPrefix: string;
  name: string | null;
  isActive: boolean;
  lastUsed: string | null;
  createdAt: string;
}

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export default function BoardSettingsModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName 
}: BoardSettingsModalProps) {
  const [mcpTokens, setMcpTokens] = useState<MCPToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [showNewTokenForm, setShowNewTokenForm] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMcpTokens();
    }
  }, [isOpen]);

  const fetchMcpTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/mcp-tokens');
      if (response.ok) {
        const data = await response.json();
        setMcpTokens(data.tokens || []);
      } else {
        setError('Failed to fetch MCP tokens');
      }
    } catch {
      setError('Failed to fetch MCP tokens');
    } finally {
      setLoading(false);
    }
  };

  const generateMcpToken = async () => {
    setGenerating(true);
    setError(null);
    try {
      const defaultName = newTokenName || `${projectName} Board`;
      const response = await fetch('/api/user/mcp-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: defaultName }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedToken(data.mcpToken);
        setNewTokenName('');
        setShowNewTokenForm(false);
        await fetchMcpTokens();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate MCP token');
      }
    } catch {
      setError('Failed to generate MCP token');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTokenStatus = async (tokenId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/user/mcp-tokens/${tokenId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await fetchMcpTokens();
      } else {
        setError('Failed to update MCP token status');
      }
    } catch {
      setError('Failed to update MCP token status');
    }
  };

  const deleteToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to delete this MCP token? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/mcp-tokens/${tokenId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMcpTokens();
      } else {
        setError('Failed to delete MCP token');
      }
    } catch {
      setError('Failed to delete MCP token');
    }
  };

  const copyToClipboard = (text: string, context: string = 'Token') => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Board Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Project Info */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Project Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Project:</span> {projectName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">ID:</span> {projectId}
                </p>
              </div>
            </div>

            {/* MCP Tokens Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    MCP Tokens
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Generate tokens for Model Context Protocol access to this project
                  </p>
                </div>
                <button
                  onClick={() => setShowNewTokenForm(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Generate Token
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              {copySuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-sm">{copySuccess}</p>
                </div>
              )}

              {generatedToken && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-2">New MCP Token Generated</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                    Please copy this token now. You won&apos;t be able to see it again.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded">
                    <code className="flex-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                      {generatedToken}
                    </code>
                    <button
                      onClick={() => copyToClipboard(generatedToken, 'MCP Token')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {showNewTokenForm && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Generate New MCP Token</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Token Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        placeholder={`${projectName} Board`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={generateMcpToken}
                        disabled={generating}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {generating ? 'Generating...' : 'Generate Token'}
                      </button>
                      <button
                        onClick={() => {
                          setShowNewTokenForm(false);
                          setNewTokenName('');
                          setError(null);
                        }}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tokens List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {mcpTokens.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No MCP tokens found. Generate your first token to get started.
                      </p>
                    </div>
                  ) : (
                    mcpTokens.map((token) => (
                      <div
                        key={token.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-gray-900 dark:text-white">
                              {token.keyPrefix}...
                            </code>
                            {token.name && (
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                ({token.name})
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                token.isActive
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {token.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>Created {new Date(token.createdAt).toLocaleDateString()}</span>
                            {token.lastUsed && (
                              <span>Last used {new Date(token.lastUsed).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleTokenStatus(token.id, !token.isActive)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                              token.isActive
                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 dark:text-yellow-300'
                                : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/40 dark:text-green-300'
                            }`}
                          >
                            {token.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteToken(token.id)}
                            className="px-3 py-1 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-800/40 dark:text-red-300 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}