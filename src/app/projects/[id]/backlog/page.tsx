'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BacklogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/projects/${resolvedParams.id}/board`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Board
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product Backlog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and prioritize your product backlog items
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Backlog Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              The product backlog feature is under development. Soon you&apos;ll be able to manage, prioritize, and organize all your backlog items in one place.
            </p>
          </div>
        </div>

        {/* Future Features Preview */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Backlog Management</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and organize backlog items with detailed descriptions and acceptance criteria
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Priority Ordering</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop to prioritize items based on business value and effort
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sprint Planning</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Move items from backlog to sprint board when ready for development
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}