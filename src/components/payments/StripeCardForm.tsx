'use client';

import { useState } from 'react';
import { createStripeSession } from '@/lib/subscription-functions';

interface CheckoutButtonProps {
  onError: (error: string) => void;
  planName: string;
  planPrice: string;
  planId: string;
}

export default function CheckoutButton({ onError, planName, planPrice, planId }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const result = await createStripeSession(planId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      if (result.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.sessionUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      onError(error instanceof Error ? error.message : 'Failed to create checkout session');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Subscribe to {planName}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {planPrice}/month - Secure checkout powered by Stripe
        </p>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isLoading
            ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isLoading ? 'Redirecting to Checkout...' : `Subscribe to ${planName}`}
      </button>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
        <p>You&apos;ll be redirected to Stripe&apos;s secure checkout</p>
        <p>All major payment methods accepted</p>
      </div>
    </div>
  );
}