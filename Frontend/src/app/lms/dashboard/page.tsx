/**
 * @fileoverview The main dashboard for the AI-powered Learning Management System.
 * Displays a professional overview of the user's learning journey, including their current module,
 * study plan, overall progress, and weekly goals.
 */
'use client';

import React from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Target, TrendingUp, Calendar, Bell, Play, CheckCircle } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard.hook';
import { useEnrollments } from '@/hooks/useEnrollments.hook';
import { useAuth } from '@/contexts/AuthContext.context';
import Link from 'next/link';

/**
 * Renders the main professional LMS dashboard page.
 * @returns {JSX.Element} The dashboard page component.
 */
export default function LmsDashboardPage() {
  const { user, profile } = useAuth();
  const { data: dashboardData, loading: dashboardLoading } = useDashboard();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();

  if (dashboardLoading || enrollmentsLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-48 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="space-y-8">
            <div className="h-32 bg-muted rounded animate-pulse"></div>
            <div className="h-48 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeEnrollments = enrollments?.filter(e => e.status === 'active') || [];
  const hasEnrollments = activeEnrollments.length > 0;

  return (
    <div className="space-y-8">
      <AnimatedDiv>
        <PageHeader
          title={`Welcome back, ${profile?.displayName || 'Learner'}!`}
          description={hasEnrollments
            ? "Continue your learning journey and achieve your goals."
            : "Ready to start your learning journey? Choose a course to begin."
          }
        />
      </AnimatedDiv>

      {!hasEnrollments ? (
        // No enrollments - show getting started
        <AnimatedDiv delay={100}>
          <Card className="text-center p-8">
            <CardHeader>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Start Your Learning Journey</CardTitle>
              <CardDescription>
                Choose from our comprehensive test preparation courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild size="lg">
                  <Link href="/lms/onboarding">Get Started</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/lms/marketplace">Browse Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedDiv>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Enrollments */}
            <AnimatedDiv delay={100}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Your Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{enrollment.course?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.course?.shortDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{enrollment.course?.testType?.toUpperCase()}</Badge>
                              <Badge variant="secondary">{enrollment.plan}</Badge>
                            </div>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/lms/course/${enrollment.course?.id}`}>
                              Continue
                            </Link>
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(enrollment.progressPercent || 0)}%</span>
                          </div>
                          <Progress value={enrollment.progressPercent || 0} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>

            {/* Recent Activity */}
            {dashboardData?.recentAttempts && dashboardData.recentAttempts.length > 0 && (
              <AnimatedDiv delay={200}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Test Attempts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recentAttempts.slice(0, 5).map((attempt: any) => (
                        <div key={attempt.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{attempt.test?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {attempt.test?.course?.title}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {attempt.totalScore}/{attempt.maxScore}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(attempt.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedDiv>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Overview */}
            <AnimatedDiv delay={300}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Courses</span>
                      <span className="font-semibold">{dashboardData?.stats?.totalEnrollments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="font-semibold">{dashboardData?.stats?.completedCourses || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Test Attempts</span>
                      <span className="font-semibold">{dashboardData?.stats?.totalTestAttempts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Score</span>
                      <span className="font-semibold">
                        {Math.round(dashboardData?.stats?.averageScore || 0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>

            {/* Notifications */}
            {dashboardData?.notifications && dashboardData.notifications.length > 0 && (
              <AnimatedDiv delay={400}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.notifications.slice(0, 3).map((notification: any) => (
                        <div key={notification.id} className="p-3 border rounded">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.body}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedDiv>
            )}

            {/* Quick Actions */}
            <AnimatedDiv delay={500}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/lms/mock-tests">
                        <Play className="h-4 w-4 mr-2" />
                        Take Practice Test
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/lms/marketplace">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Courses
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/lms/profile">
                        <Target className="h-4 w-4 mr-2" />
                        View Progress
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>
          </div>
        </div>
      )}
    </div>
  );
}