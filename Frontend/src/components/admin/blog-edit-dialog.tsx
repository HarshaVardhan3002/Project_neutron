/**
 * @fileoverview A dialog component for creating or editing a blog post within the admin panel.
 */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { Post } from '@/lib/types';

/**
 * Props for the PostEditDialog component.
 */
type PostEditDialogProps = {
    /** Whether the dialog is currently open. */
    isOpen: boolean;
    /** Function to call when the dialog should be closed. */
    onClose: () => void;
    /** The post object to edit. If null, the dialog is in "create" mode. */
    post: Post | null;
    /** Function to call when the save button is clicked, passing the new post data. */
    onSave: (data: Partial<Post>) => void;
};

/**
 * A dialog component for creating or editing a blog post.
 * It provides a form for all the necessary post fields.
 * @param {PostEditDialogProps} props - The props for the component.
 * @returns {JSX.Element} The post edit dialog.
 */
export function PostEditDialog({ isOpen, onClose, post, onSave }: PostEditDialogProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [published, setPublished] = useState(false);

    /**
     * Effect to populate the form with the post data when the dialog opens in "edit" mode,
     * or to reset the form when opening in "create" mode.
     */
    useEffect(() => {
        if (isOpen) {
            if (post) {
                setTitle(post.title);
                setContent(post.content);
                setTags(post.tags.join(', '));
                setPublished(post.published);
            } else {
                // Reset form for a new post
                setTitle('');
                setContent('');
                setTags('');
                setPublished(false);
            }
        }
    }, [post, isOpen]);

    /**
     * Handles the form submission. Validates the input and calls the onSave callback.
     */
    const handleSubmit = () => {
        if (!title || !content) {
            toast.error('Title and Content are required.');
            return;
        }
        const postData = {
            title,
            content,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            published
        };
        onSave(postData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-2xl lg:max-w-4xl bg-background/80 backdrop-blur-xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                    <DialogDescription>
                        {post ? 'Make changes to your existing post.' : 'Fill in the details to create a new blog article.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4 overflow-y-auto pr-4 flex-grow">
                    <div className="space-y-2">
                        <Label htmlFor="title">Post Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your amazing blog post title" />
                    </div>
                   
                    <div className="space-y-2">
                        <Label htmlFor="content">Main Content</Label>
                        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your full post content here. Markdown is not yet supported." rows={10} />
                        <p className="text-xs text-muted-foreground">Note: A full rich-text editor could be implemented here.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. study abroad, ielts, tips" />
                        <p className="text-xs text-muted-foreground">Separate tags with a comma.</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="published" checked={published} onCheckedChange={setPublished} />
                        <Label htmlFor="published">Published</Label>
                    </div>
                </div>
                <div className="pt-6 border-t flex justify-end gap-2 shrink-0">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Post</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
