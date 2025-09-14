'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    BookOpen,
    Clock,
    Users,
    Award,
    PlayCircle,
    CheckCircle2,
    Lock,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import { useCourse } from '@/hooks/useCourses.hook';
import { useEnrollments } from '@/hooks/useEnrollments.hook';
import { useAuth } from '@/contexts/AuthContext.context';
import { toast } from 'sonner';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function CourseDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;

    const { course, loading: courseLoading } = useCourse(courseId);
    const { enrollInCourse, getCourseEnrollment, loading: enrollmentActionLoading } = useEnrollments();

    const [enrollment, setEnrollment] = useState<any>(null);
    const [enrollmentLoading, setEnrollmentLoading] = useState(true);

    useEffect(() => {
        if (courseId && user) {
            checkEnrollmentStatus();
        }
    }, [courseId, user]);

    const checkEnrollmentStatus = async () => {
        try {
            setEnrollmentLoading(true);
            const enrollmentData = await getCourseEnrollment(courseId);
            setEnrollment(enrollmentData);
        } catch (error) {
            console.error('Error checking enrollment:', error);
        } finally {
            setEnrollmentLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            toast.error('Please sign in to enroll in courses');
            router.push('/auth/signin');
            return;
        }

        try {
            await enrollInCourse(courseId, 'trial');
            toast.success(`Successfully enrolled in ${course?.title}!`);
            await checkEnrollmentStatus();
        } catch (error) {
            // Error is already handled in the hook
        }
    };

    const handleStartLearning = () => {
        router.push(`/lms/course/${courseId}/learn`);
    };

    if (courseLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
                    <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist or has been removed.</p>
                    <Button asChild>
                        <Link href="/lms/marketplace">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isEnrolled = enrollment?.enrolled;

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <Button variant="ghost" asChild>
                <Link href="/lms/marketplace">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Link>
            </Button>

            {/* Course Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline">
                                {course.testType?.toUpperCase() || 'COURSE'}
                            </Badge>
                            <Badge variant="secondary">
                                {course.difficulty || 'All Levels'}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                        <p className="text-lg text-muted-foreground">
                            {course.shortDescription}
                        </p>
                    </div>

                    {/* Course Stats */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">
                                {course._count.enrollments} students enrolled
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">
                                {course._count.modules} modules
                            </span>
                        </div>
                        {course.creator?.displayName && (
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">
                                    By {course.creator.displayName}
                                </span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Course Description */}
                    {course.fullDescription && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {course.fullDescription}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Course Modules */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Course Content</h2>
                        <Card>
                            <CardContent className="p-6">
                                {course.modules && course.modules.length > 0 ? (
                                    <div className="space-y-4">
                                        {course.modules.map((module: any, index: number) => (
                                            <div key={module.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                                <div className="flex-shrink-0">
                                                    {isEnrolled ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{module.title}</h3>
                                                    {module.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {module.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span>{module._count?.lessons || 0} lessons</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            Course content is being prepared. Check back soon!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Enrollment Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>
                                {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                            </CardTitle>
                            <CardDescription>
                                {isEnrolled
                                    ? `Progress: ${enrollment?.enrollment?.progress?.progressPercent || 0}%`
                                    : 'Start your learning journey today'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEnrolled && enrollment?.enrollment?.progress && (
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span>Course Progress</span>
                                        <span>{enrollment.enrollment.progress.progressPercent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${enrollment.enrollment.progress.progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <span>
                                            {enrollment.enrollment.progress.completedModules} of {enrollment.enrollment.progress.totalModules} modules
                                        </span>
                                    </div>
                                </div>
                            )}

                            {enrollmentLoading ? (
                                <Button disabled className="w-full">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking enrollment...
                                </Button>
                            ) : isEnrolled ? (
                                <Button onClick={handleStartLearning} className="w-full">
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Continue Learning
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleEnroll}
                                    disabled={enrollmentActionLoading}
                                    className="w-full"
                                >
                                    {enrollmentActionLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enrolling...
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Start Free Trial
                                        </>
                                    )}
                                </Button>
                            )}

                            <div className="text-xs text-muted-foreground text-center">
                                {isEnrolled
                                    ? 'Access all course materials and track your progress'
                                    : '7-day free trial • No credit card required'
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function CourseDetailPage() {
    return (
        <ProtectedRoute>
            <CourseDetailContent />
        </ProtectedRoute>
    );
}