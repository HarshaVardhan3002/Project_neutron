'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    Users,
    DollarSign,
    BookOpen,
    Clock,
    Star,
    TrendingUp,
    MessageSquare,
    Video,
    Plus,
    Bell,
    Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface InstructorStats {
    totalStudents: number;
    totalEarnings: number;
    totalClasses: number;
    averageRating: number;
    upcomingClasses: number;
    pendingQuestions: number;
}

function InstructorDashboardContent() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState<InstructorStats>({
        totalStudents: 0,
        totalEarnings: 0,
        totalClasses: 0,
        averageRating: 0,
        upcomingClasses: 0,
        pendingQuestions: 0
    });

    useEffect(() => {
        // Mock data - replace with actual API calls
        setStats({
            totalStudents: 127,
            totalEarnings: 3450,
            totalClasses: 89,
            averageRating: 4.8,
            upcomingClasses: 5,
            pendingQuestions: 12
        });
    }, []);

    const upcomingClasses = [
        {
            id: '1',
            title: 'IELTS Speaking Practice',
            student: 'Sarah Johnson',
            time: '2024-01-20T10:00:00Z',
            duration: 60,
            type: 'video'
        },
        {
            id: '2',
            title: 'Grammar Fundamentals',
            student: 'Mike Chen',
            time: '2024-01-20T14:00:00Z',
            duration: 45,
            type: 'video'
        },
        {
            id: '3',
            title: 'Writing Task 2 Review',
            student: 'Emma Wilson',
            time: '2024-01-20T16:30:00Z',
            duration: 30,
            type: 'video'
        }
    ];

    const recentQuestions = [
        {
            id: '1',
            student: 'Alex Rodriguez',
            question: 'How can I improve my speaking fluency for IELTS?',
            subject: 'IELTS Speaking',
            time: '2 hours ago',
            answered: false
        },
        {
            id: '2',
            student: 'Lisa Park',
            question: 'What are the common mistakes in Task 1 writing?',
            subject: 'IELTS Writing',
            time: '4 hours ago',
            answered: false
        },
        {
            id: '3',
            student: 'John Smith',
            question: 'Can you explain the difference between present perfect and past simple?',
            subject: 'Grammar',
            time: '1 day ago',
            answered: true
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {profile?.display_name || 'Instructor'}! Here's your teaching overview.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Class
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+12%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalEarnings}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+8%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Classes Taught</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClasses}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+5</span> this week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageRating}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on 89 reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="questions">Q&A</TabsTrigger>
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Upcoming Classes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Upcoming Classes
                                </CardTitle>
                                <CardDescription>
                                    Your next {stats.upcomingClasses} scheduled classes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {upcomingClasses.map((class_) => (
                                    <div key={class_.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium">{class_.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                with {class_.student}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(class_.time).toLocaleString()} • {class_.duration} min
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                <Video className="h-3 w-3 mr-1" />
                                                Video
                                            </Badge>
                                            <Button size="sm">Join</Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full">
                                    View All Classes
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Questions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Recent Questions
                                </CardTitle>
                                <CardDescription>
                                    {stats.pendingQuestions} questions awaiting your response
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentQuestions.map((question) => (
                                    <div key={question.id} className="p-3 border rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-medium text-sm">{question.student}</div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={question.answered ? 'default' : 'secondary'}>
                                                    {question.answered ? 'Answered' : 'Pending'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{question.time}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{question.question}</p>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-xs">
                                                {question.subject}
                                            </Badge>
                                            {!question.answered && (
                                                <Button size="sm" variant="outline">
                                                    Answer
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full">
                                    View All Questions
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Performance This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">23</div>
                                    <div className="text-sm text-muted-foreground">Classes Taught</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">$1,150</div>
                                    <div className="text-sm text-muted-foreground">Earnings</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">4.9</div>
                                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">95%</div>
                                    <div className="text-sm text-muted-foreground">Attendance Rate</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Schedule</CardTitle>
                            <CardDescription>
                                Manage your teaching schedule and availability
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Calendar Integration Coming Soon</h3>
                                <p className="text-muted-foreground mb-4">
                                    Full Google Calendar-style scheduling interface will be available here.
                                </p>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Schedule New Class
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Students</CardTitle>
                            <CardDescription>
                                Manage your student relationships and progress
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Student Management</h3>
                                <p className="text-muted-foreground">
                                    Student list and progress tracking will be implemented here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Q&A Tab */}
                <TabsContent value="questions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Questions & Answers</CardTitle>
                            <CardDescription>
                                Respond to student questions and provide guidance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Q&A System</h3>
                                <p className="text-muted-foreground">
                                    Full Q&A interface for student questions will be implemented here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Earnings Tab */}
                <TabsContent value="earnings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Earnings & Payments</CardTitle>
                            <CardDescription>
                                Track your earnings and payment history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Earnings Dashboard</h3>
                                <p className="text-muted-foreground">
                                    Detailed earnings analytics and payment management will be available here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function InstructorDashboardPage() {
    return (
        <ProtectedRoute requiredRole="instructor">
            <InstructorDashboardContent />
        </ProtectedRoute>
    );
}