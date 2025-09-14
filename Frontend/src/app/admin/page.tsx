'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    Users,
    FileText,
    Settings,
    TrendingUp,
    Plus,
    Eye,
    BarChart3,
    Shield,
    Database
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';

interface AdminStats {
    totalCourses: number;
    totalTests: number;
    totalUsers: number;
    totalEnrollments: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats>({
        totalCourses: 0,
        totalTests: 0,
        totalUsers: 0,
        totalEnrollments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getAdminDashboard();
            if (response.data) {
                setStats((response.data as any)?.stats || stats);
            }
        } catch (error) {
            toast.error('Failed to fetch admin statistics');
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Create Course',
            description: 'Add a new course to the platform',
            icon: BookOpen,
            href: '/admin/content?tab=courses',
            color: 'bg-blue-500'
        },
        {
            title: 'Create Test',
            description: 'Build a new test or quiz',
            icon: FileText,
            href: '/admin/content?tab=tests',
            color: 'bg-green-500'
        },
        {
            title: 'Manage Users',
            description: 'Add or edit user accounts',
            icon: Users,
            href: '/admin/content?tab=users',
            color: 'bg-purple-500'
        },
        {
            title: 'Content Management',
            description: 'Organize chapters and modules',
            icon: Database,
            href: '/admin/content?tab=chapters',
            color: 'bg-orange-500'
        }
    ];

    const managementAreas = [
        {
            title: 'Content Management',
            description: 'Manage courses, tests, chapters, and users',
            icon: Database,
            href: '/admin/content',
            stats: `${stats.totalCourses} courses, ${stats.totalTests} tests`
        },
        {
            title: 'User Management',
            description: 'View and manage all platform users',
            icon: Users,
            href: '/admin/users',
            stats: `${stats.totalUsers} total users`
        },
        {
            title: 'Analytics',
            description: 'View platform performance and usage',
            icon: BarChart3,
            href: '/admin/analytics',
            stats: `${stats.totalEnrollments} enrollments`
        },
        {
            title: 'System Settings',
            description: 'Configure platform settings',
            icon: Settings,
            href: '/admin/settings',
            stats: 'Global configuration'
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-muted rounded w-2/3"></div>
                                    <div className="h-8 bg-muted rounded w-1/3"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your LMS platform and monitor performance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/admin/content">
                            <Plus className="h-4 w-4 mr-2" />
                            Quick Create
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">
                            Active learning programs
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTests}</div>
                        <p className="text-xs text-muted-foreground">
                            Assessments and quizzes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered learners
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground">
                            Active enrollments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href={action.href}>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${action.color}`}>
                                            <action.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{action.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {action.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Management Areas */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Management Areas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {managementAreas.map((area) => (
                        <Card key={area.title} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <area.icon className="h-8 w-8 text-primary" />
                                        <div>
                                            <CardTitle>{area.title}</CardTitle>
                                            <CardDescription>{area.description}</CardDescription>
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={area.href}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">{area.stats}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        System Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Database</p>
                                <p className="text-sm text-muted-foreground">Connected</p>
                            </div>
                            <Badge variant="default">Healthy</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">API Services</p>
                                <p className="text-sm text-muted-foreground">All systems operational</p>
                            </div>
                            <Badge variant="default">Online</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">File Storage</p>
                                <p className="text-sm text-muted-foreground">S3 bucket accessible</p>
                            </div>
                            <Badge variant="default">Active</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}