/**
 * @fileoverview Course Marketplace page for the LMS.
 * Allows users to browse and enroll in test preparation courses.
 */
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, PlayCircle, BookOpen, Clock, Users, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { useCourses } from '@/hooks/useCourses.hook';
import { useEnrollments } from '@/hooks/useEnrollments.hook';
import { useAuth } from '@/contexts/AuthContext.context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Renders the course marketplace page.
 * @returns {JSX.Element} The marketplace page component.
 */
export default function MarketplacePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTest, setSelectedTest] = useState<string>('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

    const { user } = useAuth();
    const router = useRouter();
    const { enrollInCourse } = useEnrollments();

    // Fetch courses with filters
    const { data: coursesData, loading } = useCourses({
        search: searchTerm,
        testType: selectedTest,
        difficulty: selectedDifficulty,
        limit: 12
    });

    const handleEnroll = async (courseId: string, courseName: string) => {
        if (!user) {
            toast.error('Please sign in to enroll in courses');
            router.push('/auth');
            return;
        }

        try {
            await enrollInCourse(courseId, 'trial');
            toast.success(`Successfully enrolled in ${courseName}!`);
            router.push('/lms/dashboard');
        } catch (error) {
            toast.error('Failed to enroll in course. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-muted rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    const courses = coursesData?.courses || [];

    return (
        <div className="space-y-8">
            <AnimatedDiv>
                <PageHeader
                    title="Course Marketplace"
                    description="Discover comprehensive test preparation courses designed to help you achieve your goals."
                />
            </AnimatedDiv>

            {/* Filters */}
            <AnimatedDiv delay={100}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Find Your Perfect Course
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search Courses</label>
                                <Input
                                    placeholder="Search by course name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Test Type</label>
                                <Select value={selectedTest} onValueChange={setSelectedTest}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Tests" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tests</SelectItem>
                                        <SelectItem value="ielts">IELTS</SelectItem>
                                        <SelectItem value="toefl">TOEFL</SelectItem>
                                        <SelectItem value="pte">PTE</SelectItem>
                                        <SelectItem value="gre">GRE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Difficulty</label>
                                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Levels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedDiv>

            {/* Course Grid */}
            {courses.length === 0 ? (
                <AnimatedDiv delay={200}>
                    <Card className="text-center p-8">
                        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || selectedTest || selectedDifficulty
                                ? 'Try adjusting your filters to find more courses.'
                                : 'No courses are available at the moment. Check back soon!'}
                        </p>
                    </Card>
                </AnimatedDiv>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <AnimatedDiv key={course.id} delay={200 + index * 50}>
                            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant="outline" className="mb-2">
                                            {course.testType?.toUpperCase() || 'COURSE'}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {course.difficulty}
                                        </Badge>
                                    </div>
                                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {course.shortDescription}
                                    </p>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{course._count.enrollments} students enrolled</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{course._count.modules} modules</span>
                                        </div>

                                        {course.creator?.displayName && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Award className="h-4 w-4" />
                                                <span>By {course.creator.displayName}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0">
                                    <div className="w-full space-y-2">
                                        <div className="flex gap-2">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <Link href={`/lms/course/${course.id}`}>
                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                    Preview
                                                </Link>
                                            </Button>
                                            <Button
                                                onClick={() => handleEnroll(course.id, course.title)}
                                                size="sm"
                                                className="flex-1"
                                            >
                                                Start Free Trial
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </AnimatedDiv>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {coursesData?.pagination && coursesData.pagination.pages > 1 && (
                <AnimatedDiv delay={400}>
                    <div className="flex justify-center gap-2">
                        {[...Array(coursesData.pagination.pages)].map((_, i) => (
                            <Button
                                key={i}
                                variant={coursesData.pagination.page === i + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    // Handle pagination - would need to update the useCourses hook
                                }}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                </AnimatedDiv>
            )}
        </div>
    );
}