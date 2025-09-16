/**
 * @fileoverview API utility functions for the Project_Neutron LMS platform
 * Provides centralized API client with authentication and error handling
 */

import { AppError, ErrorType, ErrorSeverity } from './error-handler.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetries = 3;
  private defaultRetryDelay = 1000; // 1 second

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle different response types
        let data: any;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const errorType = this.getErrorType(response.status);
          const errorSeverity = this.getErrorSeverity(response.status);
          
          throw new AppError(
            data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
            errorType,
            errorSeverity,
            {
              component: 'api_client',
              action: `${fetchOptions.method || 'GET'} ${endpoint}`,
              additionalData: {
                status: response.status,
                statusText: response.statusText,
                url,
                attempt: attempt + 1
              }
            },
            this.getUserMessage(response.status, data),
            this.isRetryableError(response.status)
          );
        }

        return { data };

      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof AppError && !error.isRetryable) {
          break;
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    // If we get here, all retries failed
    if (lastError instanceof AppError) {
      throw lastError;
    }

    // Handle network errors or unexpected cases
    if (!lastError) {
      throw new AppError(
        'Unknown error occurred',
        'unknown',
        'medium',
        {
          component: 'api_client',
          action: `${fetchOptions.method || 'GET'} ${endpoint}`,
          additionalData: { url }
        },
        'An unexpected error occurred. Please try again.',
        true
      );
    }

    const errorType: ErrorType = lastError.name === 'AbortError' ? 'network' : 'network';
    const errorMessage = lastError.name === 'AbortError' 
      ? 'Request timeout' 
      : lastError.message;

    throw new AppError(
      errorMessage,
      errorType,
      'medium',
      {
        component: 'api_client',
        action: `${fetchOptions.method || 'GET'} ${endpoint}`,
        additionalData: {
          url,
          originalError: lastError.message
        }
      },
      'Connection problem. Please check your internet connection and try again.',
      true
    );
  }

  private getErrorType(status: number): ErrorType {
    if (status === 401) return 'authentication';
    if (status === 403) return 'authorization';
    if (status >= 400 && status < 500) return 'validation';
    if (status >= 500) return 'server';
    return 'unknown';
  }

  private getErrorSeverity(status: number): ErrorSeverity {
    if (status === 401 || status === 403) return 'high';
    if (status >= 500) return 'high';
    if (status >= 400 && status < 500) return 'low';
    return 'medium';
  }

  private getUserMessage(status: number, data: any): string {
    // Use server-provided user message if available
    if (data?.userMessage) return data.userMessage;

    switch (status) {
      case 400:
        return 'Please check your input and try again.';
      case 401:
        return 'Please sign in to continue.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return 'Please check your input and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  private isRetryableError(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408;
  }

  // Authentication endpoints
  async signUp(email: string, password: string, displayName?: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request('/auth/signout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Courses endpoints
  async getCourses(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/courses${queryString ? `?${queryString}` : ''}`);
  }

  async getCourse(id: string) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(data: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: string, data: any) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async getCourseModules(id: string) {
    return this.request(`/courses/${id}/modules`);
  }

  async enrollInCourse(courseId: string, plan?: string) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  async getCourseEnrollment(courseId: string) {
    return this.request(`/courses/${courseId}/enrollment`);
  }

  async getMyCourses(status?: string) {
    const queryString = status ? `?status=${status}` : '';
    return this.request(`/courses/my-courses${queryString}`);
  }

  // Enrollments endpoints
  async getEnrollments(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/enrollments${queryString ? `?${queryString}` : ''}`);
  }



  async getEnrollment(id: string) {
    return this.request(`/enrollments/${id}`);
  }

  async updateEnrollment(id: string, data: any) {
    return this.request(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getEnrollmentProgress(id: string) {
    return this.request(`/enrollments/${id}/progress`);
  }

  // Tests endpoints
  async getTests(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/tests${queryString ? `?${queryString}` : ''}`);
  }

  async getTest(id: string) {
    return this.request(`/tests/${id}`);
  }

  async startTestAttempt(testId: string) {
    return this.request(`/tests/${testId}/attempts`, {
      method: 'POST',
    });
  }

  async getTestAttempt(testId: string, attemptId: string) {
    return this.request(`/tests/${testId}/attempts/${attemptId}`);
  }

  async submitAnswer(testId: string, attemptId: string, questionId: string, answer: any) {
    return this.request(`/tests/${testId}/attempts/${attemptId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async submitTest(testId: string, attemptId: string) {
    return this.request(`/tests/${testId}/attempts/${attemptId}/submit`, {
      method: 'POST',
    });
  }

  async createTestAttempt(testId: string) {
    return this.request(`/tests/${testId}/attempts`, {
      method: 'POST',
    });
  }

  async submitQuestionResponse(testId: string, attemptId: string, questionId: string, answer: any) {
    return this.request(`/tests/${testId}/attempts/${attemptId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async submitTestAttempt(testId: string, attemptId: string) {
    return this.request(`/tests/${testId}/attempts/${attemptId}/submit`, {
      method: 'POST',
    });
  }

  async getTestResults(testId: string, attemptId: string) {
    return this.request(`/tests/${testId}/attempts/${attemptId}/results`);
  }

  async getTestAttempts(testId: string) {
    return this.request(`/tests/${testId}/attempts`);
  }

  async getMyTestAttempts(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/tests/my-attempts${queryString ? `?${queryString}` : ''}`);
  }

  // User Profile endpoints
  async getUserProfile() {
    return this.request('/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDashboard() {
    return this.request('/users/dashboard');
  }

  async getProgress() {
    return this.request('/users/progress');
  }

  // Progress tracking endpoints
  async getProgressDashboard() {
    return this.request('/progress/dashboard');
  }

  async getCourseProgress(courseId: string) {
    return this.request(`/progress/course/${courseId}`);
  }

  async completeModule(moduleId: string, completionScore?: number) {
    return this.request(`/progress/module/${moduleId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completionScore }),
    });
  }

  async getLearningAnalytics(period?: string) {
    const queryString = period ? `?period=${period}` : '';
    return this.request(`/progress/analytics${queryString}`);
  }

  async getCourseLeaderboard(courseId: string, limit?: number) {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.request(`/progress/leaderboard/${courseId}${queryString}`);
  }

  async getCourseAnalytics(courseId: string) {
    return this.request(`/progress/admin/course/${courseId}/analytics`);
  }

  async getCertificates() {
    return this.request('/profile/certificates');
  }

  async getActivity(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/profile/activity${queryString ? `?${queryString}` : ''}`);
  }

  async getStats() {
    return this.request('/profile/stats');
  }

  async markNotificationRead(id: string) {
    return this.request(`/profile/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/profile/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminContentOverview() {
    return this.request('/admin/content-overview');
  }

  async getUsers(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/user-management${queryString ? `?${queryString}` : ''}`);
  }

  async updateUserRole(id: string, role: string) {
    // Note: The backend for user management expects the role in the main body of a PUT request.
    return this.request(`/user-management/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async createUser(data: any) {
    return this.request('/user-management', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    // Note: This corresponds to the soft-delete/toggle status in the backend.
    // The backend has a separate /:id DELETE for permanent deletion.
    return this.request(`/user-management/${id}/toggle-status`, {
      method: 'POST',
      body: JSON.stringify({ active: false }),
    });
  }

  async sendPasswordReset(userId: string) {
    return this.request(`/user-management/${userId}/password-reset`, {
      method: 'POST',
    });
  }

  async getAdminCourses(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/course-builder${queryString ? `?${queryString}` : ''}`);
  }

  async publishCourse(id: string, published: boolean) {
    return this.request(`/course-builder/${id}/publish`, {
      method: 'POST', // The backend uses POST for this
      body: JSON.stringify({ published }),
    });
  }

  async createAdminCourse(courseData: any) {
    return this.request('/course-builder', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateAdminCourse(courseId: string, courseData: any) {
    return this.request(`/course-builder/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteAdminCourse(courseId: string) {
    return this.request(`/course-builder/${courseId}`, {
      method: 'DELETE',
    });
  }

  async getAnalytics(period?: string) {
    const queryString = period ? `?period=${period}` : '';
    return this.request(`/admin/analytics${queryString}`);
  }

  async getSystemSettings() {
    return this.request('/admin/system-settings');
  }

  async updateSystemSettings(settings: any) {
    return this.request('/admin/system-settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }

  // Admin Content Management endpoints
  async createTest(data: any) {
    return this.request('/admin/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTest(id: string, data: any) {
    return this.request(`/admin/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTest(id: string) {
    return this.request(`/admin/tests/${id}`, {
      method: 'DELETE',
    });
  }

  async addQuestionToTest(testId: string, question: any) {
    return this.request(`/admin/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
  }

  async updateQuestion(testId: string, questionId: string, data: any) {
    return this.request(`/admin/questions/${questionId}`, { // The backend route is simpler
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(testId: string, questionId: string) {
    return this.request(`/admin/questions/${questionId}`, { // The backend route is simpler
      method: 'DELETE',
    });
  }

  async getChapters(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/chapters${queryString ? `?${queryString}` : ''}`);
  }

  async createChapter(data: any) {
    return this.request('/admin/chapters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChapter(id: string, data: any) {
    return this.request(`/admin/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChapter(id: string) {
    return this.request(`/admin/chapters/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderChapter(id: string, direction: 'up' | 'down') {
    return this.request(`/admin/chapters/${id}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ direction }),
    });
  }

  async addContentToChapter(chapterId: string, content: any) {
    return this.request(`/admin/chapters/${chapterId}/contents`, {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async updateContent(chapterId: string, contentId: string, data: any) {
    return this.request(`/admin/chapters/${chapterId}/contents/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContent(chapterId: string, contentId: string) {
    return this.request(`/admin/chapters/${chapterId}/contents/${contentId}`, {
      method: 'DELETE',
    });
  }

  async sendAdminPasswordReset(userId: string) {
    return this.request(`/users/admin/${userId}/password-reset`, {
      method: 'POST',
    });
  }

  // Themes endpoints
  async getThemes() {
    return this.request('/themes');
  }

  async getActiveTheme() {
    return this.request('/themes/active');
  }

  async getTheme(id: string) {
    return this.request(`/themes/${id}`);
  }

  async createTheme(data: any) {
    return this.request('/themes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTheme(id: string, data: any) {
    return this.request(`/themes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async activateTheme(id: string) {
    return this.request(`/themes/${id}/activate`, {
      method: 'POST',
    });
  }

  async deleteTheme(id: string) {
    return this.request(`/themes/${id}`, {
      method: 'DELETE',
    });
  }

  async previewTheme(id: string) {
    return this.request(`/themes/${id}/preview`);
  }

  // Website Content endpoints
  async getWebsiteContent() {
    return this.request('/website-content');
  }

  async getContentSection(section: string) {
    return this.request(`/website-content/section/${section}`);
  }

  async getAllContentSections() {
    return this.request('/website-content/admin/all');
  }

  async createOrUpdateContentSection(section: string, data: any) {
    return this.request(`/website-content/section/${section}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentSection(section: string, data: any) {
    return this.request(`/website-content/section/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContentSection(section: string) {
    return this.request(`/website-content/section/${section}`, {
      method: 'DELETE',
    });
  }

  async toggleContentSection(section: string) {
    return this.request(`/website-content/section/${section}/toggle`, {
      method: 'POST',
    });
  }

  async bulkUpdateContent(sections: any[]) {
    return this.request('/website-content/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ sections }),
    });
  }

  async getContentHistory(section: string, limit?: number) {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.request(`/website-content/section/${section}/history${queryString}`);
  }

  async getWebsiteSection(section: string) {
    return this.request(`/website-content/section/${section}`);
  }

  // Test Builder endpoints
  async getTestsForBuilder(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/tests${queryString ? `?${queryString}` : ''}`);
  }

  async getTestForBuilder(id: string) {
    return this.request(`/admin/tests/${id}`);
  }

  async createTestBuilder(data: any) {
    return this.request('/admin/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestBuilder(id: string, data: any) {
    return this.request(`/admin/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTestBuilder(id: string) {
    return this.request(`/admin/tests/${id}`, {
      method: 'DELETE',
    });
  }

  async addQuestionToTestBuilder(testId: string, question: any) {
    return this.request(`/admin/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
  }

  async updateQuestionInTestBuilder(testId: string, questionId: string, data: any) {
    return this.request(`/admin/questions/${questionId}`, { // The backend route is simpler
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestionFromTestBuilder(testId: string, questionId: string) {
    return this.request(`/admin/questions/${questionId}`, { // The backend route is simpler
      method: 'DELETE',
    });
  }

  async publishTest(id: string, published: boolean) {
    // This functionality is not in the refactored admin.routes.js, needs to be added.
    // For now, pointing to a non-existent endpoint.
    return this.request(`/admin/tests/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ published }),
    });
  }

  async duplicateTest(id: string, title?: string) {
    // This functionality is not in the refactored admin.routes.js, needs to be added.
    // For now, pointing to a non-existent endpoint.
    return this.request(`/admin/tests/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  // Course Builder endpoints
  async getCoursesForBuilder(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/course-builder${queryString ? `?${queryString}` : ''}`);
  }

  async getCourseForBuilder(id: string) {
    return this.request(`/course-builder/${id}`);
  }

  async createCourseBuilder(data: any) {
    return this.request('/course-builder', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourseBuilder(id: string, data: any) {
    return this.request(`/course-builder/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourseBuilder(id: string) {
    return this.request(`/course-builder/${id}`, {
      method: 'DELETE',
    });
  }

  async addModuleToCourse(courseId: string, module: any) {
    return this.request(`/course-builder/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(module),
    });
  }

  async updateCourseModule(courseId: string, moduleId: string, data: any) {
    return this.request(`/course-builder/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourseModule(courseId: string, moduleId: string) {
    return this.request(`/course-builder/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
    });
  }

  async addLessonToModule(courseId: string, moduleId: string, lesson: any) {
    return this.request(`/course-builder/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  }

  async updateModuleLesson(courseId: string, moduleId: string, lessonId: string, data: any) {
    return this.request(`/course-builder/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteModuleLesson(courseId: string, moduleId: string, lessonId: string) {
    return this.request(`/course-builder/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  }

  async publishCourseBuilder(id: string, published: boolean) {
    return this.request(`/course-builder/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ published }),
    });
  }

  async duplicateCourse(id: string, title?: string) {
    return this.request(`/course-builder/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  // User Management endpoints
  async getUsersForManagement(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/user-management${queryString ? `?${queryString}` : ''}`);
  }

  async getUserForManagement(id: string) {
    return this.request(`/user-management/${id}`);
  }

  async updateUserManagement(id: string, data: any) {
    return this.request(`/user-management/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleUserStatus(id: string, active: boolean) {
    return this.request(`/user-management/${id}/toggle-status`, {
      method: 'POST',
      body: JSON.stringify({ active }),
    });
  }

  async deleteUserPermanently(id: string) {
    return this.request(`/user-management/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkUserAction(action: string, userIds: string[], data?: any) {
    return this.request('/user-management/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ action, userIds, data }),
    });
  }

  async getUserAnalytics(timeframe?: string) {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request(`/user-management/analytics/overview${queryString}`);
  }

  async exportUsers(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/user-management/export/csv${queryString ? `?${queryString}` : ''}`);
  }

  // AI endpoints
  async sendChatMessage(message: string, sessionId?: string, context?: any) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, context }),
    });
  }

  async getChatSessions(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/ai/chat/sessions${queryString ? `?${queryString}` : ''}`);
  }

  async getChatMessages(sessionId: string, params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/ai/chat/sessions/${sessionId}/messages${queryString ? `?${queryString}` : ''}`);
  }

  async deleteChatSession(sessionId: string) {
    return this.request(`/ai/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async analyzeTestPerformance(testAttemptId: string) {
    return this.request(`/ai/analyze-test/${testAttemptId}`, {
      method: 'POST',
    });
  }

  async getTestAnalyses(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/ai/test-analyses${queryString ? `?${queryString}` : ''}`);
  }

  async getAIUsageStats(timeframe?: string) {
    const queryString = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request(`/ai/usage-stats${queryString}`);
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type { ApiResponse };