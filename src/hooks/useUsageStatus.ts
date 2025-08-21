import { useState, useEffect } from 'react';
import { getUserUsage, UsageStatus } from '@/lib/usage-functions';

export function useUsageStatus() {
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsageStatus = async () => {
    try {
      const result = await getUserUsage('anonymous');
      if (result.success && result.usage) {
        setUsageStatus(result.usage);
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