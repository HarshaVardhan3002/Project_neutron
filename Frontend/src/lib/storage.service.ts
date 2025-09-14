/**
 * @fileoverview File storage utilities for Supabase Storage integration
 * Handles file uploads, downloads, and management with proper validation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cfaxcledtqenebxunxpf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYXhjbGVkdHFlbmVieHVueHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDI3OTQsImV4cCI6MjA3MzI3ODc5NCJ9.ND8MgiXclpoqrWdtLI_2scIVFpmHOLeY5ok0pijXx4Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (progress: number) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface FileUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// File type configurations
export const FILE_CONFIGS = {
  images: {
    bucket: 'course-images',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    path: 'images'
  },
  videos: {
    bucket: 'course-videos',
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    path: 'videos'
  },
  documents: {
    bucket: 'course-documents',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ],
    path: 'documents'
  },
  audio: {
    bucket: 'course-audio',
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    path: 'audio'
  },
  avatars: {
    bucket: 'user-avatars',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    path: 'avatars'
  },
  assignments: {
    bucket: 'assignment-submissions',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ],
    path: 'submissions'
  }
};

class StorageService {
  /**
   * Validate file before upload
   */
  private validateFile(file: File, config: typeof FILE_CONFIGS.images): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(config.maxSize)} limit`
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique file path
   */
  private generateFilePath(userId: string, category: string, fileName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `${category}/${userId}/${timestamp}_${randomString}_${sanitizedName}`;
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
    try {
      const { bucket, file, onProgress } = options;
      
      // Get file configuration
      const configKey = Object.keys(FILE_CONFIGS).find(key => 
        FILE_CONFIGS[key as keyof typeof FILE_CONFIGS].bucket === bucket
      ) as keyof typeof FILE_CONFIGS;
      
      if (!configKey) {
        return { success: false, error: 'Invalid bucket configuration' };
      }

      const config = FILE_CONFIGS[configKey];
      
      // Validate file
      const validation = this.validateFile(file, config);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate unique file path
      const userId = 'current-user'; // This should come from auth context
      const filePath = options.path || this.generateFilePath(userId, config.path, file.name);

      // Upload file with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    bucket: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile({
        bucket,
        path: '',
        file,
        onProgress: (progress) => onProgress?.(i, progress)
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(bucket: string, path: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(bucket: string, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', {
          search: path
        });

      if (error) {
        throw error;
      }

      return data.find(file => file.name === path.split('/').pop());
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Create storage buckets if they don't exist
   */
  async initializeBuckets() {
    const buckets = Object.values(FILE_CONFIGS).map(config => config.bucket);
    const uniqueBuckets = [...new Set(buckets)];

    for (const bucketName of uniqueBuckets) {
      try {
        const { data: existingBuckets } = await supabase.storage.listBuckets();
        const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);

        if (!bucketExists) {
          await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: this.getAllowedMimeTypes(bucketName),
            fileSizeLimit: this.getMaxFileSize(bucketName)
          });
        }
      } catch (error) {
        console.error(`Error initializing bucket ${bucketName}:`, error);
      }
    }
  }

  private getAllowedMimeTypes(bucketName: string): string[] {
    const config = Object.values(FILE_CONFIGS).find(c => c.bucket === bucketName);
    return config?.allowedTypes || [];
  }

  private getMaxFileSize(bucketName: string): number {
    const config = Object.values(FILE_CONFIGS).find(c => c.bucket === bucketName);
    return config?.maxSize || 10 * 1024 * 1024; // Default 10MB
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export utility functions
export const getFileConfig = (type: keyof typeof FILE_CONFIGS) => FILE_CONFIGS[type];
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

export const isAudioFile = (file: File): boolean => {
  return file.type.startsWith('audio/');
};

export const isDocumentFile = (file: File): boolean => {
  const documentTypes = FILE_CONFIGS.documents.allowedTypes;
  return documentTypes.includes(file.type);
};