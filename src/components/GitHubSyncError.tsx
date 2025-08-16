'use client';

import { useState } from 'react';

interface GitHubSyncErrorProps {
  projectId: string;
  error: string;
  debugInfo?: {
    installationId?: string;
    repoName?: string;
  };
  onFixed?: () => void;
}

export default function GitHubSyncError({ projectId, error, debugInfo, onFixed }: GitHubSyncErrorProps) {
  const [fixing, setFixing] = useState(false);
  const [fixError, setFixError] = useState('');
  const [fixSuccess, setFixSuccess] = useState(false);

  const isInstallationError = error.includes('404') || error.includes('installation not found') || error.includes('installation access token');

  const handleFix = async () => {
    setFixing(true);
    setFixError('');
    setFixSuccess(false);

    try {
      // Clear the invalid installation
      const response = await fetch('/api/debug/github-app/fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'clear_installation',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFixSuccess(true);
        // Trigger parent component refresh after a short delay
        setTimeout(() => {
          onFixed?.();
        }, 1500);
      } else {
        const errorData = await response.json();
        setFixError(errorData.error || 'Failed to fix installation');
      }
    } catch (error) {
      console.error('Error fixing installation:', error);
      setFixError('Failed to fix installation');
    } finally {
      setFixing(false);
    }
  };

  if (!isInstallationError) {
    // For non-installation errors, just show the error
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded">
        <div className="text-sm text-red-700">
          <strong>Sync Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold text-red-800">GitHub App Installation Issue Detected</div>
          <div className="text-sm text-red-700 mt-1">{error}</div>
        </div>

        {debugInfo && (
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <div>Installation ID: {debugInfo.installationId || 'Unknown'}</div>
            <div>Repository: {debugInfo.repoName || 'Unknown'}</div>
          </div>
        )}

        <div className="text-sm text-red-700">
          This usually happens when:
          <ul className="list-disc list-inside mt-1 ml-2 text-xs">
            <li>The GitHub App was uninstalled from your account</li>
            <li>The repository access was revoked</li>
            <li>The installation expired or was suspended</li>
          </ul>
        </div>

        {fixSuccess ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-700">
              ✓ Installation cleared successfully! You can now re-link your repository.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-red-700">
              <strong>To fix this issue:</strong>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFix}
                disabled={fixing}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {fixing ? 'Clearing Installation...' : 'Clear Invalid Installation'}
              </button>
            </div>

            {fixError && (
              <div className="text-sm text-red-700">
                Failed to clear installation: {fixError}
              </div>
            )}

            <div className="text-xs text-red-600">
              After clearing, you'll need to:
              <ol className="list-decimal list-inside mt-1 ml-2">
                <li>Install the GitHub App again (if needed)</li>
                <li>Re-link your repository</li>
                <li>Try syncing again</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}