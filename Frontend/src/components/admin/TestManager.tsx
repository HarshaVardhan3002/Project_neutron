'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    FileText,
    Users,
    Clock,
    Target,
    CheckCircle,
    AlertCircle,
    Loader2,
    MoreHorizontal,
    Settings,
    Copy
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api.service';
import Link from 'next/link';

interface Test {
    id: string;
    title: string;
    description: string;
    kind: 'quiz' | 'exam' | 'assignment' | 'practice';
    timeLimit?: number;
    allowedAttempts?: number;
    passingScore: number;
    published: boolean;
    created_at: string;
    updated_at: string;
    course: {
        id: string;
        title: string;
    };
    _count: {
        questions: number;
        attempts: number;
    };
    stats?: {
        averageScore: number;
        passRate: number;
        completionRate: number;
    };
}

interface TestFormData {
    title: string;
    description: string;
    kind: 'quiz' | 'exam' | 'assignment' | 'practice';
    timeLimit?: number;
    allowedAttempts?: number;
    passingScore: number;
    courseId: string;
    published: boolean;
}

interface TestManagerProps {
    searchQuery: string;
}

export function TestManager({ searchQuery }: TestManagerProps) {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [filterKind, setFilterKind] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [testFormData, setTestFormData] = useState<TestFormData>({
        title: '',
        description: '',
        kind: 'quiz',
        timeLimit: undefined,
        allowedAttempts: undefined,
        passingScore: 70,
        courseId: '',
        published: false
    });

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterKind !== 'all') params.kind = filterKind;
            if (filterStatus !== 'all') params.published = filterStatus === 'published';
            if (searchQuery) params.search = searchQuery;

            const response = await apiClient.getTests(params);
            if (response.error) {
                throw new Error(response.error);
            }
            setTests(response.data?.tests || []);
        } catch (error) {
            console.error('Error fetching tests:', error);
            toast.error('Failed to load tests');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTest = async () => {
        try {
            setActionLoading(true);
            const response = await apiClient.createTest(testFormData);
            if (response.error) {
                throw new Error(response.error);
            }
            toast.success('Test created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchTests();
        } catch (error) {
            console.error('Error creating test:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create test');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateTest = async () => {
        if (!selectedTest) return;
        try {
            setActionLoading(true);
            const response = await apiClient.updateTest(selectedTest.id, testFormData);
            if (response.error) {
                throw new Error(response.error);
            }
            toast.success('Test updated successfully');
            setIsEditDialogOpen(false);
            resetForm();
            fetchTests();
        } catch (error) {
            console.error('Error updating test:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update test');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteTest = async (testId: string) => {
        if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
            return;
        }
        try {
            setActionLoading(true);
            const response = await apiClient.deleteTest(testId);
            if (response.error) {
                throw new Error(response.error);
            }
            toast.success('Test deleted successfully');
            fetchTests();
        } catch (error) {
            console.error('Error deleting test:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete test');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDuplicateTest = async (testId: string) => {
        try {
            setActionLoading(true);
            // Note: This would need to be implemented in the API
            toast.info('Test duplication feature coming soon');
        } catch (error) {
            console.error('Error duplicating test:', error);
            toast.error('Failed to duplicate test');
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setTestFormData({
            title: '',
            description: '',
            kind: 'quiz',
            timeLimit: undefined,
            allowedAttempts: undefined,
            passingScore: 70,
            courseId: '',
            published: false
        });
        setSelectedTest(null);
    };

    const openEditDialog = (test: Test) => {
        setSelectedTest(test);
        setTestFormData({
            title: test.title,
            description: test.description,
            kind: test.kind,
            timeLimit: test.timeLimit,
            allowedAttempts: test.allowedAttempts,
            passingScore: test.passingScore,
            courseId: test.course.id,
            published: test.published
        });
        setIsEditDialogOpen(true);
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch =
            test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.course.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesKind = filterKind === 'all' || test.kind === filterKind;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'published' && test.published) ||
            (filterStatus === 'draft' && !test.published);

        return matchesSearch && matchesKind && matchesStatus;
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

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-muted rounded w-1/3"></div>
                                <div className="h-3 bg-muted rounded w-2/3"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Test Management</h2>
                    <p className="text-muted-foreground">
                        Create and manage tests, quizzes, and assessments
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Test
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Test</DialogTitle>
                            <DialogDescription>
                                Add a new test or assessment to a course
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="test-title">Test Title</Label>
                                <Input
                                    id="test-title"
                                    value={testFormData.title}
                                    onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                                    placeholder="Chapter 1 Quiz"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="test-description">Description</Label>
                                <Textarea
                                    id="test-description"
                                    value={testFormData.description}
                                    onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                                    placeholder="Test description..."
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="test-kind">Test Type</Label>
                                    <Select
                                        value={testFormData.kind}
                                        onValueChange={(value: any) => setTestFormData({ ...testFormData, kind: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="quiz">Quiz</SelectItem>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="assignment">Assignment</SelectItem>
                                            <SelectItem value="practice">Practice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="test-course">Course ID</Label>
                                    <Input
                                        id="test-course"
                                        value={testFormData.courseId}
                                        onChange={(e) => setTestFormData({ ...testFormData, courseId: e.target.value })}
                                        placeholder="course-id"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="test-time-limit">Time Limit (minutes)</Label>
                                    <Input
                                        id="test-time-limit"
                                        type="number"
                                        value={testFormData.timeLimit || ''}
                                        onChange={(e) => setTestFormData({
                                            ...testFormData,
                                            timeLimit: e.target.value ? parseInt(e.target.value) : undefined
                                        })}
                                        placeholder="60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="test-attempts">Allowed Attempts</Label>
                                    <Input
                                        id="test-attempts"
                                        type="number"
                                        value={testFormData.allowedAttempts || ''}
                                        onChange={(e) => setTestFormData({
                                            ...testFormData,
                                            allowedAttempts: e.target.value ? parseInt(e.target.value) : undefined
                                        })}
                                        placeholder="3"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="test-passing-score">Passing Score (%)</Label>
                                    <Input
                                        id="test-passing-score"
                                        type="number"
                                        value={testFormData.passingScore}
                                        onChange={(e) => setTestFormData({
                                            ...testFormData,
                                            passingScore: parseInt(e.target.value) || 70
                                        })}
                                        placeholder="70"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="test-published"
                                    checked={testFormData.published}
                                    onCheckedChange={(checked) => setTestFormData({ ...testFormData, published: checked })}
                                />
                                <Label htmlFor="test-published">Published</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTest} disabled={actionLoading}>
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Test'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="kind-filter">Type:</Label>
                    <Select value={filterKind} onValueChange={setFilterKind}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="practice">Practice</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter">Status:</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tests ({filteredTests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Settings</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Attempts</TableHead>
                                <TableHead>Performance</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{test.title}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-2">
                                                {test.description}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{test.course.title}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getKindBadgeVariant(test.kind)}>
                                            {test.kind}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm space-y-1">
                                            {test.timeLimit && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {test.timeLimit}m
                                                </div>
                                            )}
                                            {test.allowedAttempts && (
                                                <div className="flex items-center gap-1">
                                                    <Target className="h-3 w-3" />
                                                    {test.allowedAttempts} attempts
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                {test.passingScore}% to pass
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={test.published ? 'default' : 'secondary'}>
                                            {test.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            {test._count.questions}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {test._count.attempts}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {test.stats ? (
                                            <div className="text-sm">
                                                <div>Avg: {test.stats.averageScore}%</div>
                                                <div>Pass: {test.stats.passRate}%</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">No data</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/lms/test/${test.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(test)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/tests/${test.id}/questions`}>
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Manage Questions
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicateTest(test.id)}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Duplicate Test
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteTest(test.id)}>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Test
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Test Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Test</DialogTitle>
                        <DialogDescription>
                            Update test information and settings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-test-title">Test Title</Label>
                            <Input
                                id="edit-test-title"
                                value={testFormData.title}
                                onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-test-description">Description</Label>
                            <Textarea
                                id="edit-test-description"
                                value={testFormData.description}
                                onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-test-kind">Test Type</Label>
                                <Select
                                    value={testFormData.kind}
                                    onValueChange={(value: any) => setTestFormData({ ...testFormData, kind: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                        <SelectItem value="exam">Exam</SelectItem>
                                        <SelectItem value="assignment">Assignment</SelectItem>
                                        <SelectItem value="practice">Practice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-test-course">Course ID</Label>
                                <Input
                                    id="edit-test-course"
                                    value={testFormData.courseId}
                                    onChange={(e) => setTestFormData({ ...testFormData, courseId: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-test-time-limit">Time Limit (minutes)</Label>
                                <Input
                                    id="edit-test-time-limit"
                                    type="number"
                                    value={testFormData.timeLimit || ''}
                                    onChange={(e) => setTestFormData({
                                        ...testFormData,
                                        timeLimit: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-test-attempts">Allowed Attempts</Label>
                                <Input
                                    id="edit-test-attempts"
                                    type="number"
                                    value={testFormData.allowedAttempts || ''}
                                    onChange={(e) => setTestFormData({
                                        ...testFormData,
                                        allowedAttempts: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-test-passing-score">Passing Score (%)</Label>
                                <Input
                                    id="edit-test-passing-score"
                                    type="number"
                                    value={testFormData.passingScore}
                                    onChange={(e) => setTestFormData({
                                        ...testFormData,
                                        passingScore: parseInt(e.target.value) || 70
                                    })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-test-published"
                                checked={testFormData.published}
                                onCheckedChange={(checked) => setTestFormData({ ...testFormData, published: checked })}
                            />
                            <Label htmlFor="edit-test-published">Published</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateTest} disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Test'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TestManager;