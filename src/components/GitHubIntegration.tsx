'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllInstallations } from '@/lib/github-actions';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
}

interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    type: string;
    avatar_url: string;
  };
  repository_selection: string;
  repositories: GitHubRepository[];
  error?: string;
}

interface SyncStatus {
  isLinked: boolean;
  repoName?: string;
  repoUrl?: string;
  syncEnabled: boolean;
  lastSyncAt?: Date;
  totalCards: number;
  syncedCards: number;
}

interface GitHubIntegrationProps {
  projectId: string;
  onSyncStatusChange?: (status: SyncStatus) => void;
}

export default function GitHubIntegration({ projectId, onSyncStatusChange }: GitHubIntegrationProps) {
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<number | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [needsGitHubConnection, setNeedsGitHubConnection] = useState(false);
  const [needsAppInstallation, setNeedsAppInstallation] = useState(false);

  const loadSyncStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/github`);
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data.syncStatus);
        onSyncStatusChange?.(data.syncStatus);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  }, [projectId, onSyncStatusChange]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSyncStatus(),
        loadInstallations(),
      ]);
    } catch (error) {
      console.error('Error loading GitHub data:', error);
      setError('Failed to load GitHub integration data');
    } finally {
      setLoading(false);
    }
  }, [loadSyncStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadInstallations = async () => {
    try {
      const data = await getAllInstallations();
      setInstallations(data.installations || []);
      setNeedsAppInstallation(data.needsAppInstallation || false);
      if (data.needsAuthorization || data.error === 'GitHub account not connected') {
        setNeedsGitHubConnection(true);
        setError('');
      } else if (data.error) {
        setError(data.error);
        setNeedsGitHubConnection(false);
      }
    } catch (error) {
      console.error('Error loading installations:', error);
      if (error instanceof Error && error.message === 'Unauthorized') {
        setNeedsGitHubConnection(true);
        setError('');
      } else {
        setError('Failed to load GitHub installations');
        setNeedsGitHubConnection(false);
      }
    }
  };

  const linkRepository = async () => {
    if (!selectedInstallation || !selectedRepo) {
      setError('Please select an installation and repository');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/projects/${projectId}/github/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoName: selectedRepo,
          installationId: selectedInstallation.toString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data.syncStatus);
        onSyncStatusChange?.(data.syncStatus);
        setSelectedInstallation(null);
        setSelectedRepo('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to link repository');
      }
    } catch (error) {
      console.error('Error linking repository:', error);
      setError('Failed to link repository');
    } finally {
      setLoading(false);
    }
  };

  const unlinkRepository = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/projects/${projectId}/github/link`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newStatus = {
          isLinked: false,
          syncEnabled: false,
          totalCards: 0,
          syncedCards: 0,
        };
        setSyncStatus(newStatus);
        onSyncStatusChange?.(newStatus);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to unlink repository');
      }
    } catch (error) {
      console.error('Error unlinking repository:', error);
      setError('Failed to unlink repository');
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      setSyncing(true);
      setError('');

      const response = await fetch(`/api/projects/${projectId}/github/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncComments: true,
          syncLabels: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sync result:', data.result);
        await loadSyncStatus(); // Refresh status
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to sync');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setError('Failed to sync');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">GitHub Integration</h3>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">GitHub Integration</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {syncStatus?.isLinked ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-700">
              <strong>Linked to:</strong> {syncStatus.repoName}
            </div>
            <div className="text-sm text-green-600 mt-1">
              {syncStatus.syncedCards} of {syncStatus.totalCards} cards synced
            </div>
            {syncStatus.lastSyncAt && (
              <div className="text-xs text-green-600 mt-1">
                Last sync: {new Date(syncStatus.lastSyncAt).toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            
            <a
              href={syncStatus.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              View on GitHub
            </a>

            <button
              onClick={unlinkRepository}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              Unlink
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Link this project to a GitHub repository to sync issues bidirectionally.
          </div>

          {needsGitHubConnection ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm text-blue-700 mb-3">
                <strong>GitHub Account Required</strong><br />
                You&apos;re signed in with a different provider. To use GitHub integration, you need to connect your GitHub account.
              </div>
              <button 
                onClick={() => alert('Please sign out and sign back in with GitHub to use this feature.')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Sign In with GitHub Required
              </button>
              <div className="text-xs text-blue-600 mt-2">
                GitHub integration requires signing in with GitHub. You can sign out and sign back in with GitHub to use this feature.
              </div>
            </div>
          ) : installations.length === 0 || needsAppInstallation ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-sm text-yellow-700 mb-3">
                <strong>GitHub App Required</strong><br />
                To sync with GitHub, you need to install the VibeHero GitHub App on your repositories.
              </div>
              <a 
                href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'vibehero'}/installations/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Install GitHub App
              </a>
              <div className="text-xs text-yellow-600 mt-2">
                After installation, refresh this page to see your repositories.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select GitHub Installation
                </label>
                <select
                  value={selectedInstallation || ''}
                  onChange={(e) => {
                    setSelectedInstallation(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedRepo('');
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Choose an installation...</option>
                  {installations.map((installation) => (
                    <option key={installation.id} value={installation.id}>
                      {installation.account.login} ({installation.account.type})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInstallation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Repository
                  </label>
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Choose a repository...</option>
                    {installations
                      .find(i => i.id === selectedInstallation)
                      ?.repositories.map((repo) => (
                        <option key={repo.id} value={repo.full_name}>
                          {repo.full_name} {repo.private ? '(Private)' : '(Public)'}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <button
                onClick={linkRepository}
                disabled={!selectedInstallation || !selectedRepo || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                Link Repository
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}