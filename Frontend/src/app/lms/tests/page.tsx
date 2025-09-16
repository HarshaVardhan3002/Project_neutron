'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Clock,
    Target,
    Users,
    BookOpen,
    Play,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    Calendar,
    Award,
    TrendingUp,
    Eye,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Test {
    id: string;
    title: string;
    description: string;
    kind: 'quiz' | 'exam' | 'assignment' | 'practice';
    timeLimit?: number;
    allowedAttempts?: number;
    passingScore: number;
    published?: boolean;
    course: {
        id: string;
        title: string;
        instructor: string;
    };
    _count: {
        questions: number;
        attempts: number;
    };
    userAttempts?: Array<{
        id: string;
        percentage: number;
        passed: boolean;
        submittedAt: string;
    }>;
    stats?: {
        averageScore: number;
        passRate: number;
        bestScore?: number;
    };
}

function TestsContent() {
    const { user } = useAuth();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterKind, setFilterKind] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getTests();
            if (response.error) {
                throw new Error(response.error);
            }
            setTests((response.data as any)?.tests || []);
        } catch (error) {
            console.error('Error fetching tests:', error);
            toast.error('Failed to load tests');
        } finally {
            setLoading(false);
        }
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch =
            test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.course.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesKind = filterKind === 'all' || test.kind === filterKind;

        let matchesStatus = true;
        if (filterStatus === 'completed') {
            matchesStatus = Boolean(test.userAttempts && test.userAttempts.length > 0);
        } else if (filterStatus === 'passed') {
            matchesStatus = Boolean(test.userAttempts && test.userAttempts.some(attempt => attempt.passed));
        } else if (filterStatus === 'available') {
            matchesStatus = !test.userAttempts || test.userAttempts.length === 0;
        }

        return matchesSearch && matchesKind && matchesStatus && test.published;
    });

    const getKindBadgeVariant = (kind: string) => {
        switch (kind) {
            case 'exam': return 'destructive';
            case 'quiz': return 'default';
            case 'assignment': return 'secondary';
            case 'practice': return 'outline';
            default: return 'outline';
        }
    };

    const getTestStatus = (test: Test) => {
        if (!test.userAttempts || test.userAttempts.length === 0) {
            return { status: 'available', color: 'text-blue-600', icon: Play };
        }

        const bestAttempt = test.userAttempts.reduce((best, current) =>
            current.percentage > best.percentage ? current : best
        );

        if (bestAttempt.passed) {
            return { status: 'passed', color: 'text-green-600', icon: CheckCircle2 };
        } else {
            return { status: 'failed', color: 'text-red-600', icon: AlertCircle };
        }
    };

    const canTakeTest = (test: Test) => {
        if (!test.allowedAttempts) return true;
        return !test.userAttempts || test.userAttempts.length < test.allowedAttempts;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading tests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Available Tests</h1>
                <p className="text-muted-foreground">
                    Take tests and quizzes to assess your knowledge and track your progress.
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search tests..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Select value={filterKind} onValueChange={setFilterKind}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Test Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="exam">Exam</SelectItem>
                                    <SelectItem value="assignment">Assignment</SelectItem>
                                    <SelectItem value="practice">Practice</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="passed">Passed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tests Grid */}
            {filteredTests.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Tests Found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || filterKind !== 'all' || filterStatus !== 'all'
                                ? 'Try adjusting your search criteria or filters.'
                                : 'No tests are currently available.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map((test) => {
                        const testStatus = getTestStatus(test);
                        const canTake = canTakeTest(test);

                        return (
                            <Card key={test.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant={getKindBadgeVariant(test.kind)}>
                                            {test.kind}
                                        </Badge>
                                        <testStatus.icon className={`h-5 w-5 ${testStatus.color}`} />
                                    </div>
                                    <CardTitle className="text-lg leading-tight">{test.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {test.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Course Info */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{test.course.title}</span>
                                    </div>

                                    {/* Test Details */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-muted-foreground" />
                                            <span>{test._count.questions} questions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-muted-foreground" />
                                            <span>{test.passingScore}% to pass</span>
                                        </div>
                                        {test.timeLimit && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{test.timeLimit} minutes</span>
                                            </div>
                                        )}
                                        {test.allowedAttempts && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{test.allowedAttempts} attempts</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Progress */}
                                    {test.userAttempts && test.userAttempts.length > 0 && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <div className="text-sm font-medium mb-1">Your Progress</div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Best Score:</span>
                                                <span className={`font-medium ${Math.max(...test.userAttempts.map(a => a.percentage)) >= test.passingScore
                                                    ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {Math.max(...test.userAttempts.map(a => a.percentage))}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Attempts:</span>
                                                <span>{test.userAttempts.length}{test.allowedAttempts ? `/${test.allowedAttempts}` : ''}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Class Statistics */}
                                    {test.stats && (
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="text-sm font-medium mb-1">Class Statistics</div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span>Average:</span>
                                                    <span>{test.stats.averageScore}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Pass Rate:</span>
                                                    <span>{test.stats.passRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {canTake ? (
                                            <Button asChild className="flex-1">
                                                <Link href={`/lms/test/${test.id}`}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    {test.userAttempts && test.userAttempts.length > 0 ? 'Retake' : 'Start Test'}
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button disabled className="flex-1">
                                                No Attempts Left
                                            </Button>
                                        )}

                                        {test.userAttempts && test.userAttempts.length > 0 && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/lms/test/${test.id}/results/${test.userAttempts[test.userAttempts.length - 1].id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function TestsPage() {
    return (
        <ProtectedRoute>
            <TestsContent />
        </ProtectedRoute>
    );
}