'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload,
    X,
    File,
    Image,
    Video,
    Music,
    FileText,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Eye,
    Download,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils.helper';
import { storageService, FILE_CONFIGS, formatFileSize, isImageFile, isVideoFile, isAudioFile } from '@/lib/storage.service';
import { toast } from 'sonner';

interface FileUploadProps {
    bucket: keyof typeof FILE_CONFIGS;
    onUploadComplete?: (results: Array<{ url: string; path: string; file: File }>) => void;
    onUploadError?: (error: string) => void;
    multiple?: boolean;
    disabled?: boolean;
    className?: string;
    accept?: string;
    maxFiles?: number;
    showPreview?: boolean;
    existingFiles?: Array<{ url: string; name: string; size?: number }>;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    url?: string;
    path?: string;
    error?: string;
}

export function FileUpload({
    bucket,
    onUploadComplete,
    onUploadError,
    multiple = false,
    disabled = false,
    className,
    accept,
    maxFiles = 10,
    showPreview = true,
    existingFiles = []
}: FileUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const config = FILE_CONFIGS[bucket];

    const getFileIcon = (file: File) => {
        if (isImageFile(file)) return Image;
        if (isVideoFile(file)) return Video;
        if (isAudioFile(file)) return Music;
        if (file.type.includes('pdf')) return FileText;
        return File;
    };

    const validateFiles = (files: FileList): { valid: File[]; errors: string[] } => {
        const validFiles: File[] = [];
        const errors: string[] = [];

        Array.from(files).forEach(file => {
            // Check file size
            if (file.size > config.maxSize) {
                errors.push(`${file.name}: File size exceeds ${formatFileSize(config.maxSize)} limit`);
                return;
            }

            // Check file type
            if (!config.allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: File type not allowed`);
                return;
            }

            validFiles.push(file);
        });

        // Check max files limit
        const totalFiles = uploadingFiles.length + existingFiles.length + validFiles.length;
        if (totalFiles > maxFiles) {
            errors.push(`Maximum ${maxFiles} files allowed`);
            return { valid: [], errors };
        }

        return { valid: validFiles, errors };
    };

    const handleFileUpload = async (files: FileList) => {
        if (disabled) return;

        const { valid: validFiles, errors } = validateFiles(files);

        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            onUploadError?.(errors.join(', '));
            return;
        }

        if (validFiles.length === 0) return;

        // Initialize uploading files
        const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
            file,
            progress: 0,
            status: 'uploading' as const
        }));

        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

        // Upload files
        const results: Array<{ url: string; path: string; file: File }> = [];

        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const fileIndex = uploadingFiles.length + i;

            try {
                const result = await storageService.uploadFile({
                    bucket: config.bucket,
                    path: '',
                    file,
                    onProgress: (progress) => {
                        setUploadingFiles(prev =>
                            prev.map((uploadFile, index) =>
                                index === fileIndex
                                    ? { ...uploadFile, progress }
                                    : uploadFile
                            )
                        );
                    }
                });

                if (result.success && result.url && result.path) {
                    setUploadingFiles(prev =>
                        prev.map((uploadFile, index) =>
                            index === fileIndex
                                ? {
                                    ...uploadFile,
                                    status: 'completed',
                                    progress: 100,
                                    url: result.url,
                                    path: result.path
                                }
                                : uploadFile
                        )
                    );

                    results.push({
                        url: result.url,
                        path: result.path,
                        file
                    });

                    toast.success(`${file.name} uploaded successfully`);
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';

                setUploadingFiles(prev =>
                    prev.map((uploadFile, index) =>
                        index === fileIndex
                            ? {
                                ...uploadFile,
                                status: 'error',
                                error: errorMessage
                            }
                            : uploadFile
                    )
                );

                toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
                onUploadError?.(errorMessage);
            }
        }

        if (results.length > 0) {
            onUploadComplete?.(results);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    };

    const removeUploadingFile = (index: number) => {
        setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const retryUpload = async (index: number) => {
        const uploadFile = uploadingFiles[index];
        if (!uploadFile || uploadFile.status !== 'error') return;

        setUploadingFiles(prev =>
            prev.map((file, i) =>
                i === index
                    ? { ...file, status: 'uploading', progress: 0, error: undefined }
                    : file
            )
        );

        try {
            const result = await storageService.uploadFile({
                bucket: config.bucket,
                path: '',
                file: uploadFile.file,
                onProgress: (progress) => {
                    setUploadingFiles(prev =>
                        prev.map((file, i) =>
                            i === index
                                ? { ...file, progress }
                                : file
                        )
                    );
                }
            });

            if (result.success && result.url && result.path) {
                setUploadingFiles(prev =>
                    prev.map((file, i) =>
                        i === index
                            ? {
                                ...file,
                                status: 'completed',
                                progress: 100,
                                url: result.url,
                                path: result.path
                            }
                            : file
                    )
                );

                onUploadComplete?.([{
                    url: result.url,
                    path: result.path,
                    file: uploadFile.file
                }]);

                toast.success(`${uploadFile.file.name} uploaded successfully`);
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';

            setUploadingFiles(prev =>
                prev.map((file, i) =>
                    i === index
                        ? { ...file, status: 'error', error: errorMessage }
                        : file
                )
            );

            toast.error(`Failed to upload ${uploadFile.file.name}: ${errorMessage}`);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Upload Area */}
            <Card
                className={cn(
                    "border-2 border-dashed transition-colors cursor-pointer",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <CardContent className="p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        {dragActive ? 'Drop files here' : 'Upload Files'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Drag and drop files here, or click to select files
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Allowed types: {config.allowedTypes.map(type => type.split('/')[1]).join(', ')}</p>
                        <p>Max size: {formatFileSize(config.maxSize)}</p>
                        {multiple && <p>Max files: {maxFiles}</p>}
                    </div>
                    <Button
                        variant="outline"
                        className="mt-4"
                        disabled={disabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                    >
                        Select Files
                    </Button>
                </CardContent>
            </Card>

            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept || config.allowedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            {/* File Configuration Info */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Upload Guidelines:</strong> Maximum {formatFileSize(config.maxSize)} per file.
                    Supported formats: {config.allowedTypes.map(type => type.split('/')[1]).join(', ')}.
                    {multiple && ` Up to ${maxFiles} files allowed.`}
                </AlertDescription>
            </Alert>

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium">Uploading Files</h4>
                    {uploadingFiles.map((uploadFile, index) => {
                        const FileIcon = getFileIcon(uploadFile.file);

                        return (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium truncate">{uploadFile.file.name}</p>
                                                <div className="flex items-center gap-2">
                                                    {uploadFile.status === 'uploading' && (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    )}
                                                    {uploadFile.status === 'completed' && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    )}
                                                    {uploadFile.status === 'error' && (
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeUploadingFile(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                                <span>{formatFileSize(uploadFile.file.size)}</span>
                                                <Badge variant={
                                                    uploadFile.status === 'completed' ? 'default' :
                                                        uploadFile.status === 'error' ? 'destructive' : 'secondary'
                                                }>
                                                    {uploadFile.status}
                                                </Badge>
                                            </div>
                                            {uploadFile.status === 'uploading' && (
                                                <Progress value={uploadFile.progress} className="h-2" />
                                            )}
                                            {uploadFile.status === 'error' && (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-red-600">{uploadFile.error}</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => retryUpload(index)}
                                                    >
                                                        Retry Upload
                                                    </Button>
                                                </div>
                                            )}
                                            {uploadFile.status === 'completed' && uploadFile.url && showPreview && (
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(uploadFile.url, '_blank')}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = uploadFile.url!;
                                                            link.download = uploadFile.file.name;
                                                            link.click();
                                                        }}
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Existing Files */}
            {existingFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium">Existing Files</h4>
                    {existingFiles.map((file, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <File className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            {file.size && (
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(file.url, '_blank')}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = file.url;
                                                link.download = file.name;
                                                link.click();
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}