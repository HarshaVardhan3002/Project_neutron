/**
 * @fileoverview A simulated file/image uploader component for forms.
 * This is a placeholder and does not perform actual file uploads.
 */
'use client';

import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';

type FileUploaderProps = {
  initialUrl?: string;
  onFileSelect: (url: string) => void;
};

/**
 * Renders a drag-and-drop file uploader with a preview.
 * Simulates file upload by using a placeholder URL.
 * @param {FileUploaderProps} props - The component props.
 * @returns {JSX.Element} The file uploader component.
 */
export function FileUploader({ initialUrl = '', onFileSelect }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl);

  useEffect(() => {
    setPreview(initialUrl);
  }, [initialUrl]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        // In a real app, you'd upload the file and get a URL back.
        // Here, we just pass the data URL for preview purposes.
        onFileSelect(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });
  
  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect('');
  };

  if (preview) {
    return (
      <div className="relative aspect-video w-full rounded-lg border overflow-hidden">
        <Image src={preview} alt="Image preview" fill className="object-cover" />
        <Button 
          variant="destructive" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7 rounded-full"
          onClick={clearPreview}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`aspect-video w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors
      ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
      <p className="text-sm font-semibold">
        {isDragActive ? 'Drop the files here...' : 'Drag & drop an image, or click to select'}
      </p>
      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
    </div>
  );
}
