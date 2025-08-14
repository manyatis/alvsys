import { useState, useEffect } from 'react';

interface UsageStatus {
  tier: 'FREE' | 'INDIE' | 'PROFESSIONAL';
  usage: {
    canCreateCard: boolean;
    canCreateProject: boolean;
    dailyCardsUsed: number;
    dailyCardsLimit: number;
    projectsUsed: number;
    projectsLimit: number;
    resetTime: Date;
  };
  isAtCardLimit: boolean;
  isAtProjectLimit: boolean;
}

export function useUsageStatus() {
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsageStatus = async () => {
    try {
      const response = await fetch('/api/user/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageStatus(data);
      }
    } catch (error) {
      console.error('Error fetching usage status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStatus();
  }, []);

  return {
    usageStatus,
    loading,
    refetch: fetchUsageStatus,
  };
}