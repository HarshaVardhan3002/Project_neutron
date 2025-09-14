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
import { Plus, Edit, Trash2, Eye, BookOpen, FileText, Video, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api.service';

interface Content {
    id?: string;
    type: 'text' | 'video' | 'link' | 'file';
    title: string;
    content: string;
    url?: string;
    order: number;
}

interface Chapter {
    id: string;
    title: string;
    description: string;
    order: number;
    isPublished: boolean;
    courseId: string;
    createdAt: string;
    course: {
        title: string;
    };
    contents: Content[];
    _count: {
        contents: number;
    };
}

interface ChapterManagerProps {
    searchQuery: string;
}

export function ChapterManager({ searchQuery }: ChapterManagerProps) {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

    const [chapterFormData, setChapterFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        isPublished: false
    });

    const [contentFormData, setContentFormData] = useState<Content>({
        type: 'text',
        title: '',
        content: '',
        url: '',
        order: 1
    });

    useEffect(() => {
        fetchChapters();
        fetchCourses();
    }, []);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getChapters();
            if (response.data) {
                setChapters((response.data as any)?.chapters || []);
            }
        } catch (error) {
            toast.error('Failed to fetch chapters');
            console.error('Error fetching chapters:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await apiClient.getCourses();
            if (response.data) {
                setCourses((response.data as any)?.courses || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleCreateChapter = async () => {
        try {
            const response = await apiClient.createChapter(chapterFormData);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('Chapter created successfully');
            setIsCreateDialogOpen(false);
            resetChapterForm();
            fetchChapters();
        } catch (error) {
            toast.error('Failed to create chapter');
            console.error('Error creating chapter:', error);
        }
    };

    const handleUpdateChapter = async () => {
        if (!selectedChapter) return;

        try {
            const response = await apiClient.updateChapter(selectedChapter.id, chapterFormData);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('Chapter updated successfully');
            setIsEditDialogOpen(false);
            resetChapterForm();
            fetchChapters();
        } catch (error) {
            toast.error('Failed to update chapter');
            console.error('Error updating chapter:', error);
        }
    };

    const handleDeleteChapter = async (chapterId: string) => {
        if (!confirm('Are you sure you want to delete this chapter?')) return;

        try {
            const response = await apiClient.deleteChapter(chapterId);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('Chapter deleted successfully');
            fetchChapters();
        } catch (error) {
            toast.error('Failed to delete chapter');
            console.error('Error deleting chapter:', error);
        }
    };

    const handleAddContent = async () => {
        if (!selectedChapter) return;

        try {
            const response = await apiClient.addContentToChapter(selectedChapter.id, contentFormData);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('Content added successfully');
            setIsContentDialogOpen(false);
            resetContentForm();
            fetchChapters();
        } catch (error) {
            toast.error('Failed to add content');
            console.error('Error adding content:', error);
        }
    };

    const handleReorderChapter = async (chapterId: string, direction: 'up' | 'down') => {
        try {
            const response = await apiClient.reorderChapter(chapterId, direction);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('Chapter reordered successfully');
            fetchChapters();
        } catch (error) {
            toast.error('Failed to reorder chapter');
            console.error('Error reordering chapter:', error);
        }
    };

    const resetChapterForm = () => {
        setChapterFormData({
            title: '',
            description: '',
            courseId: '',
            isPublished: false
        });
        setSelectedChapter(null);
    };

    const resetContentForm = () => {
        setContentFormData({
            type: 'text',
            title: '',
            content: '',
            url: '',
            order: 1
        });
    };

    const openEditDialog = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setChapterFormData({
            title: chapter.title,
            description: chapter.description,
            courseId: chapter.courseId,
            isPublished: chapter.isPublished
        });
        setIsEditDialogOpen(true);
    };

    const openContentDialog = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setContentFormData({
            ...contentFormData,
            order: chapter.contents.length + 1
        });
        setIsContentDialogOpen(true);
    };

    const filteredChapters = chapters.filter(chapter =>
        chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
                    <h2 className="text-2xl font-bold">Chapter & Module Management</h2>
                    <p className="text-muted-foreground">
                        Organize your course content into chapters and modules
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Chapter
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Chapter</DialogTitle>
                            <DialogDescription>
                                Add a new chapter to organize your course content
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="chapter-title">Chapter Title</Label>
                                <Input
                                    id="chapter-title"
                                    value={chapterFormData.title}
                                    onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                                    placeholder="Enter chapter title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chapter-description">Description</Label>
                                <Textarea
                                    id="chapter-description"
                                    value={chapterFormData.description}
                                    onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                                    placeholder="Describe what this chapter covers"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chapter-course">Course</Label>
                                <Select value={chapterFormData.courseId} onValueChange={(value) => setChapterFormData({ ...chapterFormData, courseId: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="chapter-published"
                                    checked={chapterFormData.isPublished}
                                    onCheckedChange={(checked) => setChapterFormData({ ...chapterFormData, isPublished: checked })}
                                />
                                <Label htmlFor="chapter-published">Publish immediately</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateChapter}>
                                Create Chapter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Chapters ({filteredChapters.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Chapter</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Contents</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredChapters.map((chapter) => (
                                <TableRow key={chapter.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{chapter.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {chapter.description}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {chapter.course.title}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{chapter.order}</span>
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReorderChapter(chapter.id, 'up')}
                                                    className="h-4 w-4 p-0"
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReorderChapter(chapter.id, 'down')}
                                                    className="h-4 w-4 p-0"
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            {chapter._count.contents}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={chapter.isPublished ? 'default' : 'secondary'}>
                                            {chapter.isPublished ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openContentDialog(chapter)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(chapter)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteChapter(chapter.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Content Creation Dialog */}
            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Add Content to {selectedChapter?.title}</DialogTitle>
                        <DialogDescription>
                            Add text, video, links, or files to this chapter
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="content-type">Content Type</Label>
                                <Select
                                    value={contentFormData.type}
                                    onValueChange={(value: any) => setContentFormData({ ...contentFormData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text Content</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="link">External Link</SelectItem>
                                        <SelectItem value="file">File/Document</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content-order">Order</Label>
                                <Input
                                    id="content-order"
                                    type="number"
                                    value={contentFormData.order}
                                    onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) || 1 })}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content-title">Content Title</Label>
                            <Input
                                id="content-title"
                                value={contentFormData.title}
                                onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                                placeholder="Enter content title"
                            />
                        </div>

                        {contentFormData.type === 'text' && (
                            <div className="space-y-2">
                                <Label htmlFor="content-text">Text Content</Label>
                                <Textarea
                                    id="content-text"
                                    value={contentFormData.content}
                                    onChange={(e) => setContentFormData({ ...contentFormData, content: e.target.value })}
                                    placeholder="Enter your text content here. You can use markdown formatting."
                                    rows={8}
                                />
                            </div>
                        )}

                        {(contentFormData.type === 'video' || contentFormData.type === 'link') && (
                            <div className="space-y-2">
                                <Label htmlFor="content-url">
                                    {contentFormData.type === 'video' ? 'Video URL' : 'Link URL'}
                                </Label>
                                <Input
                                    id="content-url"
                                    value={contentFormData.url}
                                    onChange={(e) => setContentFormData({ ...contentFormData, url: e.target.value })}
                                    placeholder={
                                        contentFormData.type === 'video'
                                            ? 'https://youtube.com/watch?v=...'
                                            : 'https://example.com'
                                    }
                                />
                            </div>
                        )}

                        {contentFormData.type === 'file' && (
                            <div className="space-y-2">
                                <Label htmlFor="content-file">File Upload</Label>
                                <Input
                                    id="content-file"
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setContentFormData({
                                                ...contentFormData,
                                                content: file.name,
                                                url: URL.createObjectURL(file)
                                            });
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {contentFormData.type !== 'text' && (
                            <div className="space-y-2">
                                <Label htmlFor="content-description">Description (Optional)</Label>
                                <Textarea
                                    id="content-description"
                                    value={contentFormData.content}
                                    onChange={(e) => setContentFormData({ ...contentFormData, content: e.target.value })}
                                    placeholder="Add a description for this content"
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddContent}>
                            Add Content
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Chapter Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Chapter</DialogTitle>
                        <DialogDescription>
                            Update chapter information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-chapter-title">Chapter Title</Label>
                            <Input
                                id="edit-chapter-title"
                                value={chapterFormData.title}
                                onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-chapter-description">Description</Label>
                            <Textarea
                                id="edit-chapter-description"
                                value={chapterFormData.description}
                                onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-chapter-course">Course</Label>
                            <Select value={chapterFormData.courseId} onValueChange={(value) => setChapterFormData({ ...chapterFormData, courseId: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-chapter-published"
                                checked={chapterFormData.isPublished}
                                onCheckedChange={(checked) => setChapterFormData({ ...chapterFormData, isPublished: checked })}
                            />
                            <Label htmlFor="edit-chapter-published">Published</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateChapter}>
                            Update Chapter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}