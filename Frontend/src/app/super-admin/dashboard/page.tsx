'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Crown,
    Users,
    BookOpen,
    FileText,
    Palette,
    Settings,
    BarChart3,
    Shield,
    Database,
    Globe,
    Zap,
    TrendingUp,
    Activity,
    Server,
    HardDrive,
    Cpu,
    Wifi,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface SystemStats {
    totalUsers: number;
    totalCourses: number;
    totalTests: number;
    totalRevenue: number;
    activeUsers: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    serverUptime: number;
    databaseSize: number;
    storageUsed: number;
    apiRequests: number;
}

interface SystemHealth {
    database: { status: 'healthy' | 'warning' | 'error'; responseTime: number };
    storage: { status: 'healthy' | 'warning' | 'error'; usage: number };
    api: { status: 'healthy' | 'warning' | 'error'; requests: number };
    cdn: { status: 'healthy' | 'warning' | 'error'; latency: number };
}

function SuperAdminDashboardContent() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        totalCourses: 0,
        totalTests: 0,
        totalRevenue: 0,
        activeUsers: 0,
        systemHealth: 'good',
        serverUptime: 0,
        databaseSize: 0,
        storageUsed: 0,
        apiRequests: 0
    });

    const [systemHealth, setSystemHealth] = useState<SystemHealth>({
        database: { status: 'healthy', responseTime: 45 },
        storage: { status: 'healthy', usage: 68 },
        api: { status: 'healthy', requests: 1247 },
        cdn: { status: 'healthy', latency: 23 }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSystemStats();
        fetchSystemHealth();
    }, []);

    const fetchSystemStats = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API calls
            setStats({
                totalUsers: 12847,
                totalCourses: 156,
                totalTests: 423,
                totalRevenue: 284750,
                activeUsers: 1247,
                systemHealth: 'excellent',
                serverUptime: 99.97,
                databaseSize: 2.4,
                storageUsed: 15.6,
                apiRequests: 45623
            });
        } catch (error) {
            console.error('Error fetching system stats:', error);
            toast.error('Failed to load system statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemHealth = async () => {
        try {
            // Mock system health data
            setSystemHealth({
                database: { status: 'healthy', responseTime: 45 },
                storage: { status: 'healthy', usage: 68 },
                api: { status: 'healthy', requests: 1247 },
                cdn: { status: 'healthy', latency: 23 }
            });
        } catch (error) {
            console.error('Error fetching system health:', error);
        }
    };

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getHealthBadge = (status: string) => {
        switch (status) {
            case 'healthy': return 'default';
            case 'warning': return 'secondary';
            case 'error': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg">
                        <Crown className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Complete system control and management
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Activity className="mr-2 h-4 w-4" />
                        System Logs
                    </Button>
                    <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        System Settings
                    </Button>
                </div>
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium opacity-90">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm opacity-90">+12% this month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm opacity-90">+8% this month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium opacity-90">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Activity className="h-4 w-4" />
                            <span className="text-sm opacity-90">Online now</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium opacity-90">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.serverUptime}%</div>
                        <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm opacity-90">Uptime</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Health Monitor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        System Health Monitor
                    </CardTitle>
                    <CardDescription>
                        Real-time monitoring of all system components
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Database className={`h-8 w-8 ${getHealthColor(systemHealth.database.status)}`} />
                                <div>
                                    <p className="font-medium">Database</p>
                                    <p className="text-sm text-muted-foreground">{systemHealth.database.responseTime}ms</p>
                                </div>
                            </div>
                            <Badge variant={getHealthBadge(systemHealth.database.status) as any}>
                                {systemHealth.database.status}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <HardDrive className={`h-8 w-8 ${getHealthColor(systemHealth.storage.status)}`} />
                                <div>
                                    <p className="font-medium">Storage</p>
                                    <p className="text-sm text-muted-foreground">{systemHealth.storage.usage}% used</p>
                                </div>
                            </div>
                            <Badge variant={getHealthBadge(systemHealth.storage.status) as any}>
                                {systemHealth.storage.status}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Cpu className={`h-8 w-8 ${getHealthColor(systemHealth.api.status)}`} />
                                <div>
                                    <p className="font-medium">API Server</p>
                                    <p className="text-sm text-muted-foreground">{systemHealth.api.requests} req/min</p>
                                </div>
                            </div>
                            <Badge variant={getHealthBadge(systemHealth.api.status) as any}>
                                {systemHealth.api.status}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Wifi className={`h-8 w-8 ${getHealthColor(systemHealth.cdn.status)}`} />
                                <div>
                                    <p className="font-medium">CDN</p>
                                    <p className="text-sm text-muted-foreground">{systemHealth.cdn.latency}ms latency</p>
                                </div>
                            </div>
                            <Badge variant={getHealthBadge(systemHealth.cdn.status) as any}>
                                {systemHealth.cdn.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Management Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="themes">Themes</TabsTrigger>
                    <TabsTrigger value="tests">Test Builder</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">Total Courses</span>
                                    </div>
                                    <span className="font-semibold">{stats.totalCourses}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Total Tests</span>
                                    </div>
                                    <span className="font-semibold">{stats.totalTests}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm">Database Size</span>
                                    </div>
                                    <span className="font-semibold">{stats.databaseSize} GB</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm">Storage Used</span>
                                    </div>
                                    <span className="font-semibold">{stats.storageUsed} GB</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent System Activities</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New course published</p>
                                        <p className="text-xs text-muted-foreground">Advanced IELTS Speaking - 2 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New instructor approved</p>
                                        <p className="text-xs text-muted-foreground">Sarah Johnson - 15 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-purple-100 p-2 rounded-full">
                                        <FileText className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Test created</p>
                                        <p className="text-xs text-muted-foreground">TOEFL Reading Practice - 1 hour ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-orange-100 p-2 rounded-full">
                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">System maintenance</p>
                                        <p className="text-xs text-muted-foreground">Database optimization - 3 hours ago</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Content Management */}
                <TabsContent value="content">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Management</CardTitle>
                            <CardDescription>
                                Manage courses, chapters, modules, and all learning content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Button className="h-32 flex flex-col gap-3" variant="outline">
                                    <BookOpen className="h-8 w-8" />
                                    <div className="text-center">
                                        <div className="font-medium">Course Builder</div>
                                        <div className="text-sm text-muted-foreground">Create and manage courses</div>
                                    </div>
                                </Button>
                                <Button className="h-32 flex flex-col gap-3" variant="outline">
                                    <FileText className="h-8 w-8" />
                                    <div className="text-center">
                                        <div className="font-medium">Chapter Manager</div>
                                        <div className="text-sm text-muted-foreground">Organize course content</div>
                                    </div>
                                </Button>
                                <Button className="h-32 flex flex-col gap-3" variant="outline">
                                    <Database className="h-8 w-8" />
                                    <div className="text-center">
                                        <div className="font-medium">Media Library</div>
                                        <div className="text-sm text-muted-foreground">Manage videos and files</div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* User Management */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                Control all user accounts, roles, and permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Advanced User Management</h3>
                                <p className="text-muted-foreground mb-4">
                                    Complete user control system will be implemented here
                                </p>
                                <Button>Access User Management</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Theme Management */}
                <TabsContent value="themes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme & Appearance</CardTitle>
                            <CardDescription>
                                Customize website themes for different occasions and seasons
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Theme Management System</h3>
                                <p className="text-muted-foreground mb-4">
                                    Seasonal themes and customization tools will be available here
                                </p>
                                <Button>Customize Themes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Test Builder */}
                <TabsContent value="tests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Test Builder</CardTitle>
                            <CardDescription>
                                Create comprehensive tests for IELTS, TOEFL, GRE, PTE with multiple components
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Professional Test Builder</h3>
                                <p className="text-muted-foreground mb-4">
                                    Advanced test creation system with multiple question types and components
                                </p>
                                <Button>Launch Test Builder</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Management */}
                <TabsContent value="system">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Management</CardTitle>
                            <CardDescription>
                                Advanced system configuration and maintenance tools
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Button className="h-24 flex flex-col gap-2" variant="outline">
                                    <Settings className="h-6 w-6" />
                                    <span className="text-sm">System Config</span>
                                </Button>
                                <Button className="h-24 flex flex-col gap-2" variant="outline">
                                    <Database className="h-6 w-6" />
                                    <span className="text-sm">Database Admin</span>
                                </Button>
                                <Button className="h-24 flex flex-col gap-2" variant="outline">
                                    <Server className="h-6 w-6" />
                                    <span className="text-sm">Server Monitor</span>
                                </Button>
                                <Button className="h-24 flex flex-col gap-2" variant="outline">
                                    <Shield className="h-6 w-6" />
                                    <span className="text-sm">Security Center</span>
                                </Button>
                                <Button className="h-24 flex flex-col gap-2" variant="outline">
                                    <BarChart3 className="h-6 w-6" />
                                    <span className="text-sm">Analytics</span>
                                </Button>
                                <Button className="h-24 flex flex-col gap-2" variant="outline">
                                    <Globe className="h-6 w-6" />
                                    <span className="text-sm">CDN Settings</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function SuperAdminDashboardPage() {
    return (
        <ProtectedRoute requiredRole="super_admin">
            <SuperAdminDashboardContent />
        </ProtectedRoute>
    );
}