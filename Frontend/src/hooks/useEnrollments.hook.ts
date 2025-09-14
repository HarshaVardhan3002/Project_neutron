'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';

export function useEnrollments() {
  const [loading, setLoading] = useState(false);

  const enrollInCourse = async (courseId: string, plan: string = 'trial') => {
    try {
      setLoading(true);

      const response = await apiClient.enrollInCourse(courseId, plan);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCourseEnrollment = async (courseId: string) => {
    try {
      const response = await apiClient.getCourseEnrollment(courseId);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get enrollment status';
      console.error(errorMessage);
      return null;
    }
  };

  return {
    enrollInCourse,
    getCourseEnrollment,
    loading
  };
}