'use client';

import { useState, useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import CheckoutButton from './StripeCardForm';

interface SubscriptionPlan {
  id: number;
  planId: string;
  name: string;
  priceCents: number;
  billingPeriod: string;
  features: string[];
  description: string;
  isActive: boolean;
}

export default function SubscriptionFlow() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      
      const data = await response.json();
      console.log('Fetched plans:', data.plans); // Debug log
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    // Allow subscription to any active paid plan
    if (plan.planId === 'free' || !plan.isActive) {
      return; // Do nothing for free plan or inactive plans
    }
    setSelectedPlan(plan);
    setStep('payment');
    setError(null);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-400">Loading subscription plans...</div>
      </div>
    );
  }

  if (error && step === 'plans') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  // Success Step
  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to {selectedPlan?.name}!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Your subscription is now active. You can start using all the features right away.
          </p>
          <button
            onClick={() => window.location.href = '/projects'}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  // Payment Step
  if (step === 'payment' && selectedPlan) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setStep('plans');
            setError(null);
          }}
          className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to plans
        </button>

        {/* Selected Plan Summary */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedPlan.name} Plan</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedPlan.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatPrice(selectedPlan.priceCents)}
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">/{selectedPlan.billingPeriod}</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Form */}
        <CheckoutButton 
          onError={handlePaymentError}
          planName={selectedPlan.name}
          planPrice={formatPrice(selectedPlan.priceCents)}
          planId={selectedPlan.planId}
        />
      </div>
    );
  }

  // Plans Selection Step - Show VibeHero pricing plans from database
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Unlock the full potential of AI-powered development with VibeHero&apos;s subscription plans.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isFree = plan.planId === 'free';
          const isComingSoon = !plan.isActive;
          
          return (
            <div
              key={plan.id}
              className={`relative p-8 rounded-2xl ${
                isFree
                  ? 'bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-slate-800 border-2 border-green-500'
                  : isComingSoon
                  ? 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-60'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isFree && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Free Forever
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${isComingSoon ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-4xl font-bold ${isComingSoon ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {isFree ? 'Free' : formatPrice(plan.priceCents)}
                  </span>
                  <span className={`${isComingSoon ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {isFree ? '(no limits)' : `/${plan.billingPeriod}`}
                  </span>
                </div>
                <p className={`${isComingSoon ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                  {plan.description}
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isComingSoon ? 'text-slate-400' : 'text-green-500'}`} />
                    <span className={`${isComingSoon ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              {plan.planId === 'free' ? (
                <button 
                  onClick={() => window.location.href = '/projects'}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Get Started Free
                </button>
              ) : (
                <button 
                  className="w-full px-6 py-3 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-semibold rounded-lg cursor-not-allowed" 
                  disabled
                >
                  Coming Soon
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}