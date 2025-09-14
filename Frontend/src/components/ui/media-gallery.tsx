'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Grid3X3,
    List,
    Search,
    Filter,
    Upload,
    Trash2,
    Eye,
    Download,
    Copy,
    Image,
    Video,
    Music,
    FileText,
    File,
    Loader2,
    MoreHorizontal,
    Calendar,
    User,
    HardDrive
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils.helper';
import { storageService, formatFileSize, isImageFile, isVideoFile, isAudioFile } from '@/lib/storage.service';
import { toast } from 'sonner';

interface MediaFile {
    id: string;
    name: string;
    url: string;
    path: string;
    size: number;
    type: string;
    bucket: string;
    createdAt: string;
    updatedAt: string;
    metadata?: {
        width?: number;
        height?: number;
        duration?: number;
    };
}

interface MediaGalleryProps {
    bucket?: string;
    onFileSelect?: (file: MediaFile) => void;
    onFileDelete?: (file: MediaFile) => void;
    selectable?: boolean;
    deletable?: boolean;
    uploadable?: boolean;
    className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';
type FilterBy = 'all' | 'images' | 'videos' | 'audio' | 'documents';

export function MediaGallery({
    bucket,
    onFileSelect,
    onFileDelete,
    selectable = false,
    deletable = false,
    uploadable = false,
    className
}: MediaGalleryProps) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [filterBy, setFilterBy] = useState<FilterBy>('all');
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

    useEffect(() => {
        loadFiles();
    }, [bucket]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            // This would typically come from your API
            // For now, we'll simulate loading files
            const mockFiles: MediaFile[] = [
                {
                    id: '1',
                    name: 'course-intro.mp4',
                    url: '/api/files/course-intro.mp4',
                    path: 'videos/course-intro.mp4',
                    size: 15728640, // 15MB
                    type: 'video/mp4',
                    bucket: 'course-videos',
                    createdAt: '2024-01-15T10:00:00Z',
                    updatedAt: '2024-01-15T10:00:00Z',
                    metadata: { duration: 300 }
                },
                {
                    id: '2',
                    name: 'lesson-diagram.png',
                    url: '/api/files/lesson-diagram.png',
                    path: 'images/lesson-diagram.png',
                    size: 2097152, // 2MB
                    type: 'image/png',
                    bucket: 'course-images',
                    createdAt: '2024-01-14T15:30:00Z',
                    updatedAt: '2024-01-14T15:30:00Z',
                    metadata: { width: 1920, height: 1080 }
                }
            ];
            setFiles(mockFiles);
        } catch (error) {
            console.error('Error loading files:', error);
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (file: MediaFile) => {
        if (file.type.startsWith('image/')) return Image;
        if (file.type.startsWith('video/')) return Video;
        if (file.type.startsWith('audio/')) return Music;
        if (file.type.includes('pdf')) return FileText;
        return File;
    };

    const getFileTypeColor = (file: MediaFile) => {
        if (file.type.startsWith('image/')) return 'bg-green-100 text-green-800';
        if (file.type.startsWith('video/')) return 'bg-blue-100 text-blue-800';
        if (file.type.startsWith('audio/')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const filteredAndSortedFiles = files
        .filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter =
                filterBy === 'all' ||
                (filterBy === 'images' && file.type.startsWith('image/')) ||
                (filterBy === 'videos' && file.type.startsWith('video/')) ||
                (filterBy === 'audio' && file.type.startsWith('audio/')) ||
                (filterBy === 'documents' && (file.type.includes('pdf') || file.type.includes('document')));
            const matchesBucket = !bucket || file.bucket === bucket;

            return matchesSearch && matchesFilter && matchesBucket;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return b.size - a.size;
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'date':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    const handleFileSelect = (file: MediaFile) => {
        if (selectable) {
            onFileSelect?.(file);
        } else {
            setPreviewFile(file);
        }
    };

    const handleFileDelete = async (file: MediaFile) => {
        try {
            const result = await storageService.deleteFile(file.bucket, file.path);
            if (result.success) {
                setFiles(prev => prev.filter(f => f.id !== file.id));
                toast.success(`${file.name} deleted successfully`);
                onFileDelete?.(file);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error(`Failed to delete ${file.name}`);
        }
        setDeleteDialogOpen(false);
        setFileToDelete(null);
    };

    const copyFileUrl = (file: MediaFile) => {
        navigator.clipboard.writeText(file.url);
        toast.success('File URL copied to clipboard');
    };

    const downloadFile = (file: MediaFile) => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.click();
    };

    const toggleFileSelection = (fileId: string) => {
        setSelectedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    };

    const renderGridView = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredAndSortedFiles.map((file) => {
                const FileIcon = getFileIcon(file);
                const isSelected = selectedFiles.has(file.id);

                return (
                    <Card
                        key={file.id}
                        className={cn(
                            "cursor-pointer hover:shadow-md transition-shadow",
                            isSelected && "ring-2 ring-primary"
                        )}
                        onClick={() => handleFileSelect(file)}
                    >
                        <CardContent className="p-3">
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                                )}
                                {selectable && (
                                    <div
                                        className="absolute top-2 right-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFileSelection(file.id);
                                        }}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center",
                                            isSelected ? "bg-primary border-primary" : "bg-white border-gray-300"
                                        )}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className={cn("text-xs", getFileTypeColor(file))}>
                                        {file.type.split('/')[1]}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Preview
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => downloadFile(file)}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => copyFileUrl(file)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy URL
                                            </DropdownMenuItem>
                                            {deletable && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setFileToDelete(file);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );

    const renderListView = () => (
        <div className="space-y-2">
            {filteredAndSortedFiles.map((file) => {
                const FileIcon = getFileIcon(file);
                const isSelected = selectedFiles.has(file.id);

                return (
                    <Card
                        key={file.id}
                        className={cn(
                            "cursor-pointer hover:shadow-sm transition-shadow",
                            isSelected && "ring-2 ring-primary"
                        )}
                        onClick={() => handleFileSelect(file)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                {selectable && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFileSelection(file.id);
                                        }}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center",
                                            isSelected ? "bg-primary border-primary" : "bg-white border-gray-300"
                                        )}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                )}
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium truncate">{file.name}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={cn("text-xs", getFileTypeColor(file))}>
                                                {file.type.split('/')[1]}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Preview
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => downloadFile(file)}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => copyFileUrl(file)}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy URL
                                                    </DropdownMenuItem>
                                                    {deletable && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setFileToDelete(file);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <HardDrive className="h-3 w-3" />
                                            {formatFileSize(file.size)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </span>
                                        {file.metadata?.width && file.metadata?.height && (
                                            <span>{file.metadata.width} × {file.metadata.height}</span>
                                        )}
                                        {file.metadata?.duration && (
                                            <span>{Math.floor(file.metadata.duration / 60)}:{(file.metadata.duration % 60).toString().padStart(2, '0')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading media files...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Media Gallery</h3>
                    <p className="text-sm text-muted-foreground">
                        {filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Files</SelectItem>
                            <SelectItem value="images">Images</SelectItem>
                            <SelectItem value="videos">Videos</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Selected Files Actions */}
            {selectedFiles.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                        {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedFiles(new Set())}>
                            Clear Selection
                        </Button>
                        {deletable && (
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Files */}
            {filteredAndSortedFiles.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Files Found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || filterBy !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Upload some files to get started.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                viewMode === 'grid' ? renderGridView() : renderListView()
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete File</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => fileToDelete && handleFileDelete(fileToDelete)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* File Preview Dialog */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{previewFile?.name}</DialogTitle>
                        <DialogDescription>
                            {previewFile && formatFileSize(previewFile.size)} • {previewFile?.type}
                        </DialogDescription>
                    </DialogHeader>
                    {previewFile && (
                        <div className="max-h-96 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                            {previewFile.type.startsWith('image/') ? (
                                <img
                                    src={previewFile.url}
                                    alt={previewFile.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : previewFile.type.startsWith('video/') ? (
                                <video
                                    src={previewFile.url}
                                    controls
                                    className="max-w-full max-h-full"
                                />
                            ) : previewFile.type.startsWith('audio/') ? (
                                <audio
                                    src={previewFile.url}
                                    controls
                                    className="w-full"
                                />
                            ) : (
                                <div className="text-center p-8">
                                    <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Preview not available for this file type</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => previewFile && downloadFile(previewFile)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                        <Button variant="outline" onClick={() => previewFile && copyFileUrl(previewFile)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}