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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    Users,
    Clock,
    Star,
    TrendingUp,
    Calendar,
    Loader2,
    MoreHorizontal,
    Play,
    Pause,
    Settings
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api.service';
import Link from 'next/link';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    price: number;
    published: boolean;
    featured: boolean;
    created_at: string;
    updated_at: string;
    instructor: {
        id: string;
        display_name: string;
        email: string;
    };
    _count: {
        enrollments: number;
        chapters: number;
        tests: number;
    };
    stats?: {
        totalRevenue: number;
        averageRating: number;
        completionRate: number;
    };
}

interface CourseFormData {
    title: string;
    description: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    price: number;
    instructorId: string;
    published: boolean;
    featured: boolean;
}

interface CourseManagerProps {
    searchQuery: string;
}

export function CourseManager({ searchQuery }: CourseManagerProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterLevel, setFilterLevel] = useState<string>('all');

    const [courseFormData, setCourseFormData] = useState<CourseFormData>({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        price: 0,
        instructorId: '',
        published: false,
        featured: false
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterCategory !== 'all') params.category = filterCategory;
            if (filterStatus !== 'all') params.published = filterStatus === 'published';
            if (filterLevel !== 'all') params.level = filterLevel;
            if (searchQuery) params.search = searchQuery;

            const response = await apiClient.getAdminCourses(params);
            if (response.error) {
                throw new Error(response.error);
            }
            setCourses(response.data?.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        try {
            setActionLoading(true);
            const response = await apiClient.createCourse(courseFormData);
            if (response.error) {
                throw new Error(response.error);
            }
            toast.success('Course created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchCourses();
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create course');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateCourse = async () => {
        if (!selectedCourse) return;
        try {
            setActionLoading(true);
            const response = await apiClient.updateCourse(selectedCourse.id, courseFormData);
            if (response.error) {
                throw new Error(response.error);
            }
            toast.success('Course updated successfully');
            setIsEditDialogOpen(false);
            resetForm();
            fetchCourses();
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update course');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }
        try {
            setActionLoading(true);
            const response = await apiClient.deleteCourse(courseId);
            if (response.error) {
                throw new Error(response.error);
            }
            toast.success('Course deleted successfully');
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete course');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTogglePublished = async (courseId: string, published: boolean) => {
        try {
            setActionLoading(true);
            const response = await apiClient.publishCourse(courseId, !published);
            if (response.error) {
                throw new Error(response.error);
            }
            toast.success(`Course ${!published ? 'published' : 'unpublished'} successfully`);
            fetchCourses();
        } catch (error) {
            console.error('Error updating course status:', error);
            toast.error('Failed to update course status');
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setCourseFormData({
            title: '',
            description: '',
            category: '',
            level: 'beginner',
            price: 0,
            instructorId: '',
            published: false,
            featured: false
        });
        setSelectedCourse(null);
    };

    const openEditDialog = (course: Course) => {
        setSelectedCourse(course);
        setCourseFormData({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            price: course.price,
            instructorId: course.instructor.id,
            published: course.published,
            featured: course.featured
        });
        setIsEditDialogOpen(true);
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.display_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'published' && course.published) ||
            (filterStatus === 'draft' && !course.published);
        const matchesLevel = filterLevel === 'all' || course.level === filterLevel;

        return matchesSearch && matchesCategory && matchesStatus && matchesLevel;
    });

    const getLevelBadgeVariant = (level: string) => {
        switch (level) {
            case 'beginner': return 'default';
            case 'intermediate': return 'secondary';
            case 'advanced': return 'destructive';
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
                    <h2 className="text-2xl font-bold">Course Management</h2>
                    <p className="text-muted-foreground">
                        Manage courses, content, and publishing status
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Course</DialogTitle>
                            <DialogDescription>
                                Add a new course to the platform
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="course-title">Course Title</Label>
                                <Input
                                    id="course-title"
                                    value={courseFormData.title}
                                    onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                                    placeholder="Introduction to React"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course-description">Description</Label>
                                <Textarea
                                    id="course-description"
                                    value={courseFormData.description}
                                    onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                                    placeholder="Course description..."
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course-category">Category</Label>
                                    <Input
                                        id="course-category"
                                        value={courseFormData.category}
                                        onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                                        placeholder="Programming"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course-level">Level</Label>
                                    <Select
                                        value={courseFormData.level}
                                        onValueChange={(value: any) => setCourseFormData({ ...courseFormData, level: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course-price">Price ($)</Label>
                                    <Input
                                        id="course-price"
                                        type="number"
                                        value={courseFormData.price}
                                        onChange={(e) => setCourseFormData({ ...courseFormData, price: parseFloat(e.target.value) || 0 })}
                                        placeholder="99.99"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course-instructor">Instructor ID</Label>
                                    <Input
                                        id="course-instructor"
                                        value={courseFormData.instructorId}
                                        onChange={(e) => setCourseFormData({ ...courseFormData, instructorId: e.target.value })}
                                        placeholder="instructor-id"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="course-published"
                                        checked={courseFormData.published}
                                        onCheckedChange={(checked) => setCourseFormData({ ...courseFormData, published: checked })}
                                    />
                                    <Label htmlFor="course-published">Published</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="course-featured"
                                        checked={courseFormData.featured}
                                        onCheckedChange={(checked) => setCourseFormData({ ...courseFormData, featured: checked })}
                                    />
                                    <Label htmlFor="course-featured">Featured</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateCourse} disabled={actionLoading}>
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Course'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="category-filter">Category:</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Programming">Programming</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
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
                <div className="flex items-center gap-2">
                    <Label htmlFor="level-filter">Level:</Label>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Enrollments</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{course.title}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-2">
                                                {course.description}
                                            </div>
                                            {course.featured && (
                                                <Badge variant="secondary" className="mt-1">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{course.instructor.display_name}</div>
                                            <div className="text-sm text-muted-foreground">{course.instructor.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{course.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getLevelBadgeVariant(course.level)}>
                                            {course.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">${course.price}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={course.published ? 'default' : 'secondary'}>
                                            {course.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {course._count.enrollments}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{course._count.chapters} chapters</div>
                                            <div>{course._count.tests} tests</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/lms/course/${course.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(course)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleTogglePublished(course.id, course.published)}
                                                disabled={actionLoading}
                                            >
                                                {course.published ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/courses/${course.id}/content`}>
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Manage Content
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteCourse(course.id)}>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Course
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

            {/* Edit Course Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                        <DialogDescription>
                            Update course information and settings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-course-title">Course Title</Label>
                            <Input
                                id="edit-course-title"
                                value={courseFormData.title}
                                onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-course-description">Description</Label>
                            <Textarea
                                id="edit-course-description"
                                value={courseFormData.description}
                                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-course-category">Category</Label>
                                <Input
                                    id="edit-course-category"
                                    value={courseFormData.category}
                                    onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-course-level">Level</Label>
                                <Select
                                    value={courseFormData.level}
                                    onValueChange={(value: any) => setCourseFormData({ ...courseFormData, level: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-course-price">Price ($)</Label>
                                <Input
                                    id="edit-course-price"
                                    type="number"
                                    value={courseFormData.price}
                                    onChange={(e) => setCourseFormData({ ...courseFormData, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-course-instructor">Instructor ID</Label>
                                <Input
                                    id="edit-course-instructor"
                                    value={courseFormData.instructorId}
                                    onChange={(e) => setCourseFormData({ ...courseFormData, instructorId: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-course-published"
                                    checked={courseFormData.published}
                                    onCheckedChange={(checked) => setCourseFormData({ ...courseFormData, published: checked })}
                                />
                                <Label htmlFor="edit-course-published">Published</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-course-featured"
                                    checked={courseFormData.featured}
                                    onCheckedChange={(checked) => setCourseFormData({ ...courseFormData, featured: checked })}
                                />
                                <Label htmlFor="edit-course-featured">Featured</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateCourse} disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Course'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CourseManager;