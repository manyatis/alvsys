'use client';

import { X, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-slate-500 dark:text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Subscription Cancelled</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              No worries! Your subscription wasn&apos;t created. You can try again anytime or continue using alvsys with our free tier.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/subscribe'}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/projects'}
                className="w-full py-3 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}