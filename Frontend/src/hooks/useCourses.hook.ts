'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  testType?: string;
  difficulty?: string;
  thumbnailS3Key?: string;
  language: string;
  published: boolean;
  createdAt: string;
  creator?: {
    displayName?: string;
  };
  modules?: Array<{
    id: string;
    title: string;
    description?: string;
    _count?: {
      lessons: number;
    };
  }>;
  _count: {
    enrollments: number;
    modules: number;
  };
}

interface CoursesData {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UseCoursesParams {
  search?: string;
  testType?: string;
  difficulty?: string;
  language?: string;
  page?: number;
  limit?: number;
}

export function useCourses(params: UseCoursesParams = {}) {
  const [data, setData] = useState<CoursesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.testType) queryParams.append('testType', params.testType);
      if (params.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params.language) queryParams.append('language', params.language);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.getCourses(Object.fromEntries(queryParams));

      if (response.error) {
        throw new Error(response.error);
      }

      setData(response.data as CoursesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [
    params.search,
    params.testType,
    params.difficulty,
    params.language,
    params.page,
    params.limit
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchCourses
  };
}

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getCourse(courseId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && typeof response.data === 'object' && 'course' in response.data) {
        setCourse((response.data as any).course as Course);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse
  };
}

export function useMyCourses(status: string = 'active') {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getMyCourses(status);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && typeof response.data === 'object' && 'enrollments' in response.data) {
        setCourses((response.data as any).enrollments || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch your courses';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, [status]);

  return {
    courses,
    loading,
    error,
    refetch: fetchMyCourses
  };
}