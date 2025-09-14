'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    FolderOpen,
    Image,
    Video,
    Music,
    FileText,
    Users,
    HardDrive,
    Settings,
    Trash2,
    Download,
    Plus
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { MediaGallery } from '@/components/ui/media-gallery';
import { FILE_CONFIGS, formatFileSize } from '@/lib/storage.service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';

interface StorageStats {
    totalFiles: number;
    totalSize: number;
    usedSpace: number;
    availableSpace: number;
    filesByType: {
        images: number;
        videos: number;
        audio: number;
        documents: number;
    };
}

function FileManagementContent() {
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedBucket, setSelectedBucket] = useState<keyof typeof FILE_CONFIGS>('images');

    // Mock storage stats - in real app, this would come from API
    const storageStats: StorageStats = {
        totalFiles: 1247,
        totalSize: 2.4 * 1024 * 1024 * 1024, // 2.4GB
        usedSpace: 1.8 * 1024 * 1024 * 1024, // 1.8GB
        availableSpace: 8.2 * 1024 * 1024 * 1024, // 8.2GB
        filesByType: {
            images: 456,
            videos: 123,
            audio: 89,
            documents: 579
        }
    };

    const bucketConfigs = [
        {
            key: 'images' as const,
            title: 'Course Images',
            description: 'Thumbnails, diagrams, and visual content',
            icon: Image,
            color: 'bg-green-100 text-green-800',
            count: storageStats.filesByType.images
        },
        {
            key: 'videos' as const,
            title: 'Course Videos',
            description: 'Lecture videos and demonstrations',
            icon: Video,
            color: 'bg-blue-100 text-blue-800',
            count: storageStats.filesByType.videos
        },
        {
            key: 'audio' as const,
            title: 'Audio Files',
            description: 'Podcasts, music, and audio content',
            icon: Music,
            color: 'bg-purple-100 text-purple-800',
            count: storageStats.filesByType.audio
        },
        {
            key: 'documents' as const,
            title: 'Documents',
            description: 'PDFs, presentations, and text files',
            icon: FileText,
            color: 'bg-orange-100 text-orange-800',
            count: storageStats.filesByType.documents
        },
        {
            key: 'avatars' as const,
            title: 'User Avatars',
            description: 'Profile pictures and user images',
            icon: Users,
            color: 'bg-pink-100 text-pink-800',
            count: 234
        },
        {
            key: 'assignments' as const,
            title: 'Assignment Submissions',
            description: 'Student submissions and uploads',
            icon: Upload,
            color: 'bg-indigo-100 text-indigo-800',
            count: 567
        }
    ];

    const handleFileUpload = (results: Array<{ url: string; path: string; file: File }>) => {
        toast.success(`${results.length} file(s) uploaded successfully`);
        // Refresh file lists or update state as needed
    };

    const handleFileDelete = (file: any) => {
        toast.success(`${file.name} deleted successfully`);
        // Update state or refresh file lists
    };

    const usagePercentage = (storageStats.usedSpace / (storageStats.usedSpace + storageStats.availableSpace)) * 100;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">File Management</h1>
                    <p className="text-muted-foreground">
                        Manage course content, media files, and user uploads
                    </p>
                </div>
                <Button onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Files
                </Button>
            </div>

            {/* Storage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storageStats.totalFiles.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across all buckets</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatFileSize(storageStats.usedSpace)}</div>
                        <p className="text-xs text-muted-foreground">
                            {usagePercentage.toFixed(1)}% of total space
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Available Space</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatFileSize(storageStats.availableSpace)}</div>
                        <p className="text-xs text-muted-foreground">Remaining capacity</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Storage Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-green-600">Good</div>
                            <HardDrive className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            {/* Storage Usage Bar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Storage Usage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Used: {formatFileSize(storageStats.usedSpace)}</span>
                            <span>Available: {formatFileSize(storageStats.availableSpace)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                            <div
                                className="bg-primary h-3 rounded-full transition-all duration-300"
                                style={{ width: `${usagePercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {usagePercentage.toFixed(1)}% of {formatFileSize(storageStats.usedSpace + storageStats.availableSpace)} used
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* File Management Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="avatars">Avatars</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bucketConfigs.map((bucket) => {
                            const IconComponent = bucket.icon;
                            return (
                                <Card key={bucket.key} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${bucket.color}`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{bucket.title}</CardTitle>
                                                    <CardDescription className="text-sm">
                                                        {bucket.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-2xl font-bold">{bucket.count}</div>
                                                <p className="text-xs text-muted-foreground">files</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setActiveTab(bucket.key)}
                                                >
                                                    <FolderOpen className="h-4 w-4 mr-1" />
                                                    Browse
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedBucket(bucket.key);
                                                        setUploadDialogOpen(true);
                                                    }}
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Upload
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Recent Files */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Files</CardTitle>
                            <CardDescription>
                                Recently uploaded files across all buckets
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MediaGallery
                                selectable={false}
                                deletable={true}
                                onFileDelete={handleFileDelete}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Individual Bucket Tabs */}
                {bucketConfigs.map((bucket) => (
                    <TabsContent key={bucket.key} value={bucket.key} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <bucket.icon className="h-5 w-5" />
                                            {bucket.title}
                                        </CardTitle>
                                        <CardDescription>{bucket.description}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedBucket(bucket.key);
                                                setUploadDialogOpen(true);
                                            }}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Files
                                        </Button>
                                        <Button variant="outline">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Settings
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 p-4 bg-muted rounded-lg">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <div className="font-medium">Max File Size</div>
                                            <div className="text-muted-foreground">
                                                {formatFileSize(FILE_CONFIGS[bucket.key].maxSize)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Allowed Types</div>
                                            <div className="text-muted-foreground">
                                                {FILE_CONFIGS[bucket.key].allowedTypes.length} types
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Total Files</div>
                                            <div className="text-muted-foreground">{bucket.count}</div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Bucket</div>
                                            <div className="text-muted-foreground font-mono text-xs">
                                                {FILE_CONFIGS[bucket.key].bucket}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <MediaGallery
                                    bucket={FILE_CONFIGS[bucket.key].bucket}
                                    selectable={false}
                                    deletable={true}
                                    onFileDelete={handleFileDelete}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Upload Dialog */}
            {uploadDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Upload Files</CardTitle>
                                    <CardDescription>
                                        Upload files to {bucketConfigs.find(b => b.key === selectedBucket)?.title}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setUploadDialogOpen(false)}
                                >
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                bucket={selectedBucket}
                                multiple={true}
                                onUploadComplete={handleFileUpload}
                                onUploadError={(error) => toast.error(error)}
                                maxFiles={10}
                                showPreview={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function FileManagementPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <FileManagementContent />
        </ProtectedRoute>
    );
}