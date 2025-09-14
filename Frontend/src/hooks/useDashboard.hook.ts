/**
 * Custom hook for fetching dashboard data from the backend
 */

'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api.service';
import { useAuth } from '@/contexts/AuthContext.context';

interface DashboardData {
  enrollments: any[];
  recentAttempts: any[];
  upcomingAssignments: any[];
  notifications: any[];
  stats: {
    totalEnrollments: number;
    completedCourses: number;
    totalTestAttempts: number;
    averageScore: number;
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.getDashboard();
      
      if (response.error) {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }

      setData(response.data as DashboardData);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchDashboardData };
}