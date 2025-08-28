'use client';

import React, { useState, useEffect } from 'react';
import { Key, Copy, Trash2, Plus, Check, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export default function McpApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('30'); // days
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/mcp/keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys);
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please provide a name for the API key');
      return;
    }

    try {
      const response = await fetch('/api/mcp/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          expiresInDays: parseInt(newKeyExpiry)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedToken(data.token);
        setShowCreateModal(false);
        setNewKeyName('');
        setNewKeyExpiry('30');
        await fetchApiKeys();
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to create API key');
      }
    } catch (err) {
      console.error('Error creating API key:', err);
      setError('Failed to create API key');
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/mcp/keys/${keyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchApiKeys();
      } else {
        setError('Failed to revoke API key');
      }
    } catch (err) {
      console.error('Error revoking API key:', err);
      setError('Failed to revoke API key');
    }
  };

  const copyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MCP API Keys</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage Bearer tokens for MCP server authentication
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Key
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {createdToken && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              API Key Created Successfully
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Copy this token now. You won&apos;t be able to see it again.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono break-all">
                {createdToken}
              </code>
              <button
                onClick={copyToken}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                {copiedToken ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {apiKeys.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No API keys created yet</p>
            <p className="text-sm mt-1">Create your first key to enable MCP authentication</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {key.name}
                    </span>
                    {!key.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Created: {formatDate(key.createdAt)}</span>
                    {key.lastUsedAt && (
                      <span>Last used: {formatDate(key.lastUsedAt)}</span>
                    )}
                    {key.expiresAt && (
                      <span>Expires: {formatDate(key.expiresAt)}</span>
                    )}
                  </div>
                </div>
                {key.isActive && (
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New API Key
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Claude Code MCP"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires In (days)
                </label>
                <select
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="0">Never</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                  setError(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}