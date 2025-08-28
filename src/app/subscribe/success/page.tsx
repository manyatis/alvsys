'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, Star, Zap, TrendingUp, BarChart3, Clock, Users } from 'lucide-react';
import Navbar from '@/components/navbar';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setIsVerifying(false);
      return;
    }

    // Give webhooks a moment to process, then redirect to dashboard
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  const benefits = [
    {
      icon: <Star className="w-6 h-6 text-blue-400" />,
      title: "Unlimited AI Tasks",
      description: "Process unlimited AI tasks without daily limits"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-400" />,
      title: "Priority API Access",
      description: "Get faster response times with our priority API queue"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-400" />,
      title: "Advanced Features",
      description: "Access to upcoming advanced project management features"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-yellow-400" />,
      title: "Enhanced Productivity",
      description: "Maximize your development efficiency with structured workflows"
    },
    {
      icon: <Users className="w-6 h-6 text-red-400" />,
      title: "Email Support",
      description: "Get help when you need it with our dedicated support team"
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      title: "Early Access",
      description: "Be first to try new features and capabilities"
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Something went wrong</h1>
              <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
              <button
                onClick={() => window.location.href = '/subscribe'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Processing your subscription...</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Please wait while we activate your account. This should only take a few seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      
      <main className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Welcome to alvsys Premium!</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Your subscription is now active and you have access to all premium features. 
              Let&apos;s get you started on structured AI development!
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  {benefit.icon}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white ml-3">{benefit.title}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ready to get started?</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Head to your projects to create your first organized backlog and start working with AI agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/projects'}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Projects
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="mt-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Start Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Create Project</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Set up your first project and organization</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Add Tasks</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Create structured tasks in your backlog</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Enable AI</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Let AI agents work on your tasks autonomously</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}