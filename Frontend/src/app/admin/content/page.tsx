'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    BookOpen,
    FileText,
    BarChart3,
    Settings,
    Search,
    TrendingUp,
    UserPlus,
    Plus,
    Eye,
    Loader2,
    Database
} from 'lucide-react';
import { UserManager } from '@/components/admin/UserManager';
import { CourseManager } from '@/components/admin/CourseManager';
import { TestManager } from '@/components/admin/TestManager';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSearchParams } from 'next/navigation';

interface AdminStats {
    totalUsers: number;
    activeCourses: number;
    totalTests: number;
    revenue: number;
    userGrowth: number;
    courseGrowth: number;
    testGrowth: number;
    revenueGrowth: number;
}

export default function AdminContentPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'users';

    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            setStatsLoading(true);
            const response = await apiClient.getAdminDashboard();
            if (response.error) {
                throw new Error(response.error);
            }
            setStats(response.data?.stats || {
                totalUsers: 0,
                activeCourses: 0,
                totalTests: 0,
                revenue: 0,
                userGrowth: 0,
                courseGrowth: 0,
                testGrowth: 0,
                revenueGrowth: 0
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            toast.error('Failed to load dashboard statistics');
            // Set default stats on error
            setStats({
                totalUsers: 0,
                activeCourses: 0,
                totalTests: 0,
                revenue: 0,
                userGrowth: 0,
                courseGrowth: 0,
                testGrowth: 0,
                revenueGrowth: 0
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const formatGrowth = (growth: number) => {
        const sign = growth >= 0 ? '+' : '';
        const color = growth >= 0 ? 'text-green-600' : 'text-red-600';
        return (
            <span className={color}>
                {sign}{growth}%
            </span>
        );
    };

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Content Management</h1>
                        <p className="text-muted-foreground">
                            Manage users, courses, tests, and platform content
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatGrowth(stats?.userGrowth || 0)} from last month
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{stats?.activeCourses}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatGrowth(stats?.courseGrowth || 0)} new this month
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{stats?.totalTests}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatGrowth(stats?.testGrowth || 0)} created this month
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">${stats?.revenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatGrowth(stats?.revenueGrowth || 0)} from last month
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Management Tabs */}
                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Courses
                        </TabsTrigger>
                        <TabsTrigger value="tests" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Tests
                        </TabsTrigger>
                        <TabsTrigger value="chapters" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Chapters
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <UserManager searchQuery={searchQuery} />
                    </TabsContent>

                    <TabsContent value="courses">
                        <CourseManager searchQuery={searchQuery} />
                    </TabsContent>

                    <TabsContent value="tests">
                        <TestManager searchQuery={searchQuery} />
                    </TabsContent>

                    <TabsContent value="chapters">
                        <Card>
                            <CardHeader>
                                <CardTitle>Chapter Management</CardTitle>
                                <CardDescription>
                                    Organize course content into chapters and modules
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Chapter Management</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Chapter and content organization features coming soon
                                    </p>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Chapter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analytics & Reports</CardTitle>
                                <CardDescription>
                                    View platform analytics and generate reports
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Advanced analytics and reporting features coming soon
                                    </p>
                                    <Button>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Reports
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}