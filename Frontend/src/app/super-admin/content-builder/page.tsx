'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Trash2,
    Save,
    Eye,
    BookOpen,
    Video,
    Image,
    FileText,
    Headphones,
    Upload,
    Move,
    Edit,
    Copy,
    Settings,
    Play,
    Pause,
    SkipForward,
    Volume2,
    Download,
    Link as LinkIcon,
    Clock,
    Target,
    Users,
    Star,
    DollarSign
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { MediaGallery } from '@/components/ui/media-gallery';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface CourseModule {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'audio' | 'text' | 'quiz' | 'assignment' | 'live_session';
    content: {
        videoUrl?: string;
        audioUrl?: string;
        textContent?: string;
        duration?: number;
        resources?: Array<{
            title: string;
            url: string;
            type: string;
        }>;
    };
    orderIndex: number;
    isPublished: boolean;
    isFree: boolean;
}

interface CourseChapter {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    modules: CourseModule[];
    isPublished: boolean;
}

interface Course {
    id?: string;
    title: string;
    description: string;
    shortDescription: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    price: number;
    thumbnailUrl: string;
    previewVideoUrl?: string;
    instructorId: string;
    chapters: CourseChapter[];
    tags: string[];
    requirements: string[];
    learningOutcomes: string[];
    isPublished: boolean;
    isFeatured: boolean;
}

const MODULE_TYPES = [
    { value: 'video', label: 'Video Lesson', icon: Video },
    { value: 'audio', label: 'Audio Lesson', icon: Headphones },
    { value: 'text', label: 'Text Content', icon: FileText },
    { value: 'quiz', label: 'Quiz', icon: Target },
    { value: 'assignment', label: 'Assignment', icon: Edit },
    { value: 'live_session', label: 'Live Session', icon: Users }
];

const CATEGORIES = [
    'IELTS Preparation',
    'TOEFL Preparation',
    'GRE Preparation',
    'PTE Preparation',
    'General English',
    'Business English',
    'Academic Writing',
    'Speaking Skills',
    'Grammar',
    'Vocabulary'
];

function ContentBuilderContent() {
    const [course, setCourse] = useState<Course>({
        title: '',
        description: '',
        shortDescription: '',
        category: '',
        level: 'beginner',
        price: 0,
        thumbnailUrl: '',
        instructorId: '',
        chapters: [],
        tags: [],
        requirements: [],
        learningOutcomes: [],
        isPublished: false,
        isFeatured: false
    });

    const [currentChapter, setCurrentChapter] = useState<string>('');
    const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);

    const addChapter = () => {
        const newChapter: CourseChapter = {
            id: `chapter-${Date.now()}`,
            title: `Chapter ${course.chapters.length + 1}`,
            description: '',
            orderIndex: course.chapters.length,
            modules: [],
            isPublished: false
        };

        setCourse(prev => ({
            ...prev,
            chapters: [...prev.chapters, newChapter]
        }));

        setCurrentChapter(newChapter.id);
    };

    const updateChapter = (chapterId: string, updates: Partial<CourseChapter>) => {
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.map(chapter =>
                chapter.id === chapterId ? { ...chapter, ...updates } : chapter
            )
        }));
    };

    const deleteChapter = (chapterId: string) => {
        setCourse(prev => ({
            ...prev,
            chapters: prev.chapters.filter(chapter => chapter.id !== chapterId)
        }));

        if (currentChapter === chapterId) {
            setCurrentChapter('');
            setCurrentModule(null);
        }
    };

    const addModule = (chapterId: string) => {
        const chapter = course.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        const newModule: CourseModule = {
            id: `module-${Date.now()}`,
            title: `Module ${chapter.modules.length + 1}`,
            description: '',
            type: 'video',
            content: {},
            orderIndex: chapter.modules.length,
            isPublished: false,
            isFree: false
        };

        updateChapter(chapterId, {
            modules: [...chapter.modules, newModule]
        });

        setCurrentModule(newModule);
    };

    const updateModule = (chapterId: string, moduleId: string, updates: Partial<CourseModule>) => {
        const updatedModule = currentModule?.id === moduleId
            ? { ...currentModule, ...updates }
            : currentModule;

        if (updatedModule && currentModule?.id === moduleId) {
            setCurrentModule(updatedModule);
        }

        updateChapter(chapterId, {
            modules: course.chapters.find(c => c.id === chapterId)?.modules.map(module =>
                module.id === moduleId ? { ...module, ...updates } : module
            ) || []
        });
    };

    const deleteModule = (chapterId: string, moduleId: string) => {
        updateChapter(chapterId, {
            modules: course.chapters.find(c => c.id === chapterId)?.modules.filter(module =>
                module.id !== moduleId
            ) || []
        });

        if (currentModule?.id === moduleId) {
            setCurrentModule(null);
        }
    };

    const saveCourse = async () => {
        try {
            setSaving(true);

            // Validate course
            if (!course.title.trim()) {
                toast.error('Please enter a course title');
                return;
            }

            if (course.chapters.length === 0) {
                toast.error('Please add at least one chapter');
                return;
            }

            // API call to save course
            const response = await fetch('/api/super-admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(course)
            });

            if (response.ok) {
                toast.success('Course saved successfully');
            } else {
                throw new Error('Failed to save course');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    const publishCourse = async () => {
        try {
            setSaving(true);
            await saveCourse();

            setCourse(prev => ({ ...prev, isPublished: true }));
            toast.success('Course published successfully');
        } catch (error) {
            console.error('Error publishing course:', error);
            toast.error('Failed to publish course');
        } finally {
            setSaving(false);
        }
    };

    const renderModuleEditor = () => {
        if (!currentModule) {
            return (
                <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Module Selected</h3>
                    <p className="text-muted-foreground">
                        Select a module from the left panel or create a new one to start editing.
                    </p>
                </div>
            );
        }

        const chapterId = currentChapter;

        return (
            <div className="space-y-6">
                {/* Module Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Module Title</Label>
                        <Input
                            value={currentModule.title}
                            onChange={(e) => updateModule(chapterId, currentModule.id, { title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Module Type</Label>
                        <Select
                            value={currentModule.type}
                            onValueChange={(value: any) => updateModule(chapterId, currentModule.id, { type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MODULE_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <type.icon className="h-4 w-4" />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Module Description</Label>
                    <Textarea
                        value={currentModule.description}
                        onChange={(e) => updateModule(chapterId, currentModule.id, { description: e.target.value })}
                        rows={3}
                    />
                </div>

                {/* Module Content Based on Type */}
                {currentModule.type === 'video' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Video URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={currentModule.content.videoUrl || ''}
                                    onChange={(e) => updateModule(chapterId, currentModule.id, {
                                        content: { ...currentModule.content, videoUrl: e.target.value }
                                    })}
                                    placeholder="https://example.com/video.mp4"
                                />
                                <Button variant="outline" onClick={() => setShowMediaLibrary(true)}>
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input
                                type="number"
                                value={currentModule.content.duration || ''}
                                onChange={(e) => updateModule(chapterId, currentModule.id, {
                                    content: { ...currentModule.content, duration: parseInt(e.target.value) || 0 }
                                })}
                            />
                        </div>
                    </div>
                )}

                {currentModule.type === 'audio' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Audio URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={currentModule.content.audioUrl || ''}
                                    onChange={(e) => updateModule(chapterId, currentModule.id, {
                                        content: { ...currentModule.content, audioUrl: e.target.value }
                                    })}
                                    placeholder="https://example.com/audio.mp3"
                                />
                                <Button variant="outline" onClick={() => setShowMediaLibrary(true)}>
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input
                                type="number"
                                value={currentModule.content.duration || ''}
                                onChange={(e) => updateModule(chapterId, currentModule.id, {
                                    content: { ...currentModule.content, duration: parseInt(e.target.value) || 0 }
                                })}
                            />
                        </div>
                    </div>
                )}

                {currentModule.type === 'text' && (
                    <div className="space-y-2">
                        <Label>Text Content</Label>
                        <Textarea
                            value={currentModule.content.textContent || ''}
                            onChange={(e) => updateModule(chapterId, currentModule.id, {
                                content: { ...currentModule.content, textContent: e.target.value }
                            })}
                            rows={12}
                            placeholder="Enter your lesson content here..."
                        />
                    </div>
                )}

                {/* Module Settings */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={currentModule.isPublished}
                            onCheckedChange={(checked) => updateModule(chapterId, currentModule.id, { isPublished: checked })}
                        />
                        <Label>Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={currentModule.isFree}
                            onCheckedChange={(checked) => updateModule(chapterId, currentModule.id, { isFree: checked })}
                        />
                        <Label>Free Preview</Label>
                    </div>
                </div>

                {/* Resources */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Additional Resources</Label>
                        <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resource
                        </Button>
                    </div>
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        No additional resources added yet
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-lg">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Course Content Builder</h1>
                        <p className="text-muted-foreground">
                            Create comprehensive courses with videos, audio, text, and interactive content
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {previewMode ? 'Edit Mode' : 'Preview'}
                    </Button>
                    <Button variant="outline" onClick={saveCourse} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button onClick={publishCourse} disabled={saving}>
                        <Play className="mr-2 h-4 w-4" />
                        Publish Course
                    </Button>
                </div>
            </div>

            {/* Course Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Configuration</CardTitle>
                    <CardDescription>
                        Set up the basic information for your course
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Course Title</Label>
                            <Input
                                value={course.title}
                                onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter course title..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={course.category} onValueChange={(value) => setCourse(prev => ({ ...prev, category: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Course Description</Label>
                        <Textarea
                            value={course.description}
                            onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            placeholder="Detailed course description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Short Description</Label>
                        <Input
                            value={course.shortDescription}
                            onChange={(e) => setCourse(prev => ({ ...prev, shortDescription: e.target.value }))}
                            placeholder="Brief course summary for cards..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Select value={course.level} onValueChange={(value: any) => setCourse(prev => ({ ...prev, level: value }))}>
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
                        <div className="space-y-2">
                            <Label>Price (USD)</Label>
                            <Input
                                type="number"
                                value={course.price}
                                onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Instructor ID</Label>
                            <Input
                                value={course.instructorId}
                                onChange={(e) => setCourse(prev => ({ ...prev, instructorId: e.target.value }))}
                                placeholder="instructor-id"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={course.isPublished}
                                onCheckedChange={(checked) => setCourse(prev => ({ ...prev, isPublished: checked }))}
                            />
                            <Label>Published</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={course.isFeatured}
                                onCheckedChange={(checked) => setCourse(prev => ({ ...prev, isFeatured: checked }))}
                            />
                            <Label>Featured Course</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Course Builder Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Chapters & Modules Panel */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Course Structure</CardTitle>
                                <Button size="sm" onClick={addChapter}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {course.chapters.map((chapter) => (
                                <div key={chapter.id} className="space-y-3">
                                    <div
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${currentChapter === chapter.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => setCurrentChapter(chapter.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{chapter.title}</div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteChapter(chapter.id);
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {chapter.modules.length} module{chapter.modules.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    {currentChapter === chapter.id && (
                                        <div className="space-y-2 ml-4">
                                            {chapter.modules.map((module, index) => {
                                                const ModuleIcon = MODULE_TYPES.find(t => t.value === module.type)?.icon || FileText;
                                                return (
                                                    <div
                                                        key={module.id}
                                                        className={`p-2 text-sm border rounded cursor-pointer transition-colors ${currentModule?.id === module.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                                            }`}
                                                        onClick={() => setCurrentModule(module)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <ModuleIcon className="h-3 w-3" />
                                                                <span>{module.title}</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteModule(chapter.id, module.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {module.type} • {module.isPublished ? 'Published' : 'Draft'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => addModule(chapter.id)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Module
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Content Editor */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Editor</CardTitle>
                            <CardDescription>
                                {currentModule
                                    ? `Editing ${currentModule.type} module: ${currentModule.title}`
                                    : 'Select or create a module to start editing'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderModuleEditor()}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Course Summary */}
            {course.chapters.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Course Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{course.chapters.length}</div>
                                <div className="text-sm text-muted-foreground">Chapters</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {course.chapters.reduce((total, chapter) => total + chapter.modules.length, 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Modules</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {course.chapters.reduce((total, chapter) =>
                                        total + chapter.modules.reduce((moduleTotal, module) =>
                                            moduleTotal + (module.content.duration || 0), 0
                                        ), 0
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Minutes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">${course.price}</div>
                                <div className="text-sm text-muted-foreground">Course Price</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{course.level}</div>
                                <div className="text-sm text-muted-foreground">Difficulty Level</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Media Library Modal */}
            {showMediaLibrary && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Media Library</CardTitle>
                                <Button variant="ghost" onClick={() => setShowMediaLibrary(false)}>
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MediaGallery
                                selectable={true}
                                onFileSelect={(file) => {
                                    // Handle file selection based on current module type
                                    if (currentModule && currentChapter) {
                                        if (currentModule.type === 'video') {
                                            updateModule(currentChapter, currentModule.id, {
                                                content: { ...currentModule.content, videoUrl: file.url }
                                            });
                                        } else if (currentModule.type === 'audio') {
                                            updateModule(currentChapter, currentModule.id, {
                                                content: { ...currentModule.content, audioUrl: file.url }
                                            });
                                        }
                                        setShowMediaLibrary(false);
                                        toast.success('Media file selected');
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function ContentBuilderPage() {
    return (
        <ProtectedRoute requiredRole="super_admin">
            <ContentBuilderContent />
        </ProtectedRoute>
    );
}