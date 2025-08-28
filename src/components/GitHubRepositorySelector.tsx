'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Github, ExternalLink, Folder } from 'lucide-react';
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

interface GitHubRepositorySelectorProps {
  onRepositorySelect: (repo: GitHubRepository, installationId: number) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function GitHubRepositorySelector({ 
  onRepositorySelect, 
  onCancel, 
  loading = false 
}: GitHubRepositorySelectorProps) {
  const { data: session } = useSession();
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [loadingInstallations, setLoadingInstallations] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedInstallation, setSelectedInstallation] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [selectedRepoName, setSelectedRepoName] = useState<string>('');
  const [needsAppInstallation, setNeedsAppInstallation] = useState(false);
  const [needsGitHubConnection, setNeedsGitHubConnection] = useState(false);
  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = async () => {
    try {
      setLoadingInstallations(true);
      const data = await getAllInstallations(session?.user?.id || 'anonymous');
      setInstallations(data.installations || []);
      setNeedsAppInstallation(data.needsAppInstallation || false);
      
      // Handle different error states
      if (data.error === 'GitHub account not connected' || data.needsGitHubConnection) {
        // User signed in with a different provider or needs OAuth connection
        setNeedsGitHubConnection(true);
        setError('');
      } else if (data.needsAuthorization || data.needsAppInstallation) {
        // User signed in with GitHub but GitHub App needs authorization/installation
        // Show the GitHub App installation prompt
        setNeedsAppInstallation(true);
        setNeedsGitHubConnection(false);
        setError('');
      } else if (data.error && data.installations.length === 0 && !data.needsAppInstallation) {
        // Only show error if it's not an app installation issue
        setError(data.error);
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error loading installations:', error);
      setError('Failed to load GitHub repositories');
    } finally {
      setLoadingInstallations(false);
    }
  };

  // Show full loading state when project is being created
  if (loading && isSelecting && selectedRepoName) {
    return (
      <div className="p-12 text-center">
        <Github className="mx-auto h-16 w-16 text-blue-500 mb-6 animate-pulse" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Creating Project from GitHub
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Setting up your project from <span className="font-mono font-semibold">{selectedRepoName}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          This may take a moment while we sync your GitHub issues...
        </p>
      </div>
    );
  }

  if (loadingInstallations) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading GitHub repositories...</p>
      </div>
    );
  }

  if (needsGitHubConnection) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <Github className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            GitHub Account Required
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You&apos;re signed in with a different provider. To use GitHub integration, you need to connect your GitHub account.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please sign out and sign back in with GitHub to use this feature.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <Github className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Repositories
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={loadInstallations}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (installations.length === 0 || needsAppInstallation) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <Github className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            GitHub App Required
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            To sync with GitHub, you need to install the alvsys GitHub App on your repositories.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            After installation, you may need to authorize the app and grant repository access.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <strong>Installation Steps:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Click &quot;Install GitHub App&quot; below</li>
              <li>Select your account or organization</li>
              <li>Choose which repositories to grant access to</li>
              <li>Click &quot;Install&quot; to complete</li>
              <li>Return here and click &quot;Refresh&quot;</li>
            </ol>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
          <a
            href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'alvsys'}/installations/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Install GitHub App
          </a>
          <button
            onClick={loadInstallations}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const selectedInstallationData = installations.find(i => i.id === selectedInstallation);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Repository
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a repository to create a project from or link to an existing project.
        </p>
      </div>

      {/* Installation Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          GitHub Account
        </label>
        <select
          value={selectedInstallation || ''}
          onChange={(e) => setSelectedInstallation(e.target.value ? parseInt(e.target.value) : null)}
          disabled={isSelecting || loading}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Choose an account...</option>
          {installations.map((installation) => (
            <option key={installation.id} value={installation.id}>
              {installation.account.login} ({installation.account.type})
            </option>
          ))}
        </select>
      </div>

      {/* Repository Selection */}
      {selectedInstallationData && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Repository ({selectedInstallationData.repositories.length} available)
            </label>
            <a
              href={`https://github.com/settings/installations`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Update Permissions
            </a>
          </div>
          <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
            {selectedInstallationData.repositories.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  No repositories available in this installation.
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Need to add more repositories to your GitHub App installation?
                </div>
                <a
                  href={`https://github.com/settings/installations`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Update Repository Permissions
                </a>
              </div>
            ) : (
              selectedInstallationData.repositories.map((repo) => {
                const isThisRepoSelected = selectedRepoId === repo.id;
                const isDisabled = isSelecting || loading;
                
                return (
                <div
                  key={repo.id}
                  onClick={() => {
                    if (isDisabled) return;
                    setIsSelecting(true);
                    setSelectedRepoId(repo.id);
                    setSelectedRepoName(repo.full_name);
                    onRepositorySelect(repo, selectedInstallation!);
                  }}
                  className={`relative p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors ${
                    isDisabled 
                      ? 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800' 
                      : isThisRepoSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                  }`}
                >
                  {isThisRepoSelected && isSelecting && (
                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm font-medium">Creating project...</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {repo.name}
                        </span>
                        {repo.private && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded">
                            Private
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {repo.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {repo.full_name}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={loading || isSelecting}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}