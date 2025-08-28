'use client';

import { useState } from 'react';
import { X, Copy, Check, Bot } from 'lucide-react';

interface MCPGuideModalProps {
  showModal: boolean;
  modalVisible: boolean;
  projectId: string;
  onClose: () => void;
}

export default function MCPGuideModal({
  showModal,
  modalVisible,
  projectId,
  onClose,
}: MCPGuideModalProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!showModal) return null;

  const handleCopy = async (text: string, itemId: string) => {
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
      
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const prompts = [
    {
      id: 'dev-mode',
      label: 'Enter Dev Mode',
      text: `enter dev_mode and follow instructions. do not stop to provide summary/analysis at ANY point`,
    },
    {
      id: 'work-issue',
      label: 'Work on Specific Issue',
      text: 'work on the [KEYWORD] issue',
    },
    {
      id: 'create-issue',
      label: 'Create New Issue',
      text: 'create an issue called "[ISSUE_TITLE]" with description "[DESCRIPTION]"',
    },
    {
      id: 'check-status',
      label: 'Check Project Status',
      text: 'show me the project statistics and current sprint status',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity z-50 ${
          modalVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 w-full sm:w-[700px] max-w-[95vw] max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 transition-all overflow-hidden ${
        modalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">MCP Commands</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Project ID Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project ID
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md px-3 py-2 border border-gray-200 dark:border-gray-700">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {projectId}
              </code>
              <button
                onClick={() => handleCopy(projectId, 'project-id')}
                className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copiedItem === 'project-id' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Installation Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Installation Command
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                claude mcp add --transport http alvsys https://https://alvsys.com/api/llm/mcp --header &ldquo;X-Project-Id: YOUR_PROJECT_ID&rdquo; --header &ldquo;Authorization: Bearer YOUR_API_KEY&rdquo;
              </code>
            </div>
            <button
              onClick={() => handleCopy(`claude mcp add --transport http alvsys https://https://alvsys.com/api/llm/mcp --header "X-Project-Id: YOUR_PROJECT_ID" --header "Authorization: Bearer YOUR_API_KEY"`, 'install-command')}
              className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              {copiedItem === 'install-command' ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copy installation command
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Example Prompts
            </h3>
            
            {prompts.map((prompt) => (
              <div 
                key={prompt.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {prompt.label}
                  </span>
                  <button
                    onClick={() => handleCopy(prompt.text, prompt.id)}
                    className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {copiedItem === prompt.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 border border-gray-200 dark:border-gray-700">
                  <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                    {prompt.text}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-400">
              <li>Get your API key from Account Settings → MCP Keys</li>
              <li>Run the installation command above (replace YOUR_PROJECT_ID and YOUR_API_KEY with actual values)</li>
              <li>Use the example prompts below with your MCP-enabled tool</li>
              <li>The AI will automatically work on tasks without needing additional parameters</li>
            </ol>
            
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">Optional: Set Environment Variable</p>
              <p className="text-blue-800 dark:text-blue-400 mb-2">
                To avoid passing project IDs in installation, set this in your environment:
              </p>
              <div className="bg-white dark:bg-blue-950 rounded px-2 py-1 font-mono text-xs border border-blue-300 dark:border-blue-600">
                ALVSYS_PROJECT_ID={projectId}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}