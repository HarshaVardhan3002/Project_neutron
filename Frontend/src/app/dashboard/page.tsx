'use client';

/**
 * @fileoverview The main dashboard page for signed-in users.
 * Displays user-specific information like learning progress and enrolled courses.
 */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, BookOpen, Trophy, Clock, Video, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext.context';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface DashboardData {
  enrollments: any[];
  recentTests: any[];
  stats: {
    totalEnrollments: number;
    completedModules: number;
    averageScore: number;
    totalAttempts: number;
  };
  notifications: any[];
}

/**
 * Renders the user dashboard page, showing personalized information and progress.
 * @returns {JSX.Element} The user dashboard page component.
 */
function DashboardContent() {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProgressDashboard();

      if (response.error) {
        toast.error('Failed to load dashboard data');
        return;
      }

      setDashboardData(response.data as DashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load dashboard data</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate profile completion based on available data
  const profileFields = [
    profile?.display_name,
    profile?.first_name,
    profile?.last_name,
    profile?.phone,
    profile?.country,
    profile?.bio
  ];
  const completedFields = profileFields.filter(field => field && field.trim() !== '').length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
  const profileProgressOffset = 100 - profileCompletion;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">
            Welcome Back, {profile?.display_name || profile?.first_name || user?.email?.split('@')[0] || 'Student'}!
          </h1>
          <p className="text-muted-foreground">Here's your learning progress and recent activity.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/lms/schedule">
              <Clock className="mr-2 h-4 w-4" />
              Schedule
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/lms/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Learning Statistics Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
            <CardDescription>Your overall learning progress.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Enrolled Courses</span>
                </div>
                <span className="font-semibold">{dashboardData.stats.totalEnrollments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed Modules</span>
                </div>
                <span className="font-semibold">{dashboardData.stats.completedModules}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Average Score</span>
                </div>
                <span className="font-semibold">{dashboardData.stats.averageScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Test Attempts</span>
                </div>
                <span className="font-semibold">{dashboardData.stats.totalAttempts}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Profile Completion Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>A complete profile attracts better opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center items-center gap-4">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                {/* Background circle */}
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2"></circle>
                {/* Progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-current text-primary transition-all duration-500"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset={profileProgressOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)" // Start the circle from the top
                ></circle>
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">{profileCompletion}%</div>
            </div>
            <p className="text-center text-muted-foreground text-sm">You are just a few steps away from a complete profile.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/profile">Update Profile</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Courses Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>Your recently accessed courses.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            {dashboardData.enrollments.length > 0 ? (
              dashboardData.enrollments.slice(0, 3).map((enrollment) => (
                <div key={enrollment.id} className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{enrollment.course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.course.shortDescription || 'No description available'}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{enrollment.progress?.progressPercent || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${enrollment.progress?.progressPercent || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Test Attempts */}
      {dashboardData.recentTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Attempts</CardTitle>
            <CardDescription>Your latest test results and performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTests.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{attempt.test.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {attempt.test.course?.title} • {attempt.test.kind}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {attempt.status === 'completed' ? (
                      <div>
                        <p className="font-semibold">
                          {attempt.maxScore > 0
                            ? Math.round((attempt.totalScore / attempt.maxScore) * 100)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.totalScore}/{attempt.maxScore} points
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-yellow-600 capitalize">{attempt.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
