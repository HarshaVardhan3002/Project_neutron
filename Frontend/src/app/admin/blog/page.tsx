/**
 * @fileoverview Blog post management page for the admin dashboard.
 * Allows admins to create, edit, and delete blog posts using local state for a prototype experience.
 */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { toast } from 'sonner';
import type { Post } from '@/lib/types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { PostEditDialog } from '@/components/admin/blog-edit-dialog';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

/**
 * Mock data for blog posts. In a real application, this would be fetched from a CMS or database.
 */
const mockPosts: Post[] = [
    {
        id: 'post-1',
        title: 'Top 5 Tips for a Successful Study Abroad Application',
        slug: 'top-5-tips-for-a-successful-study-abroad-application',
        content: 'Navigating the study abroad application process can be daunting. Here are our top tips to help you succeed...',
        tags: ['study abroad', 'application', 'tips'],
        published: true,
        publishedAt: '2023-10-26T10:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'post-2',
        title: 'How to Ace Your IELTS Exam: A Comprehensive Guide',
        slug: 'how-to-ace-your-ielts-exam-a-comprehensive-guide',
        content: 'Our expert guide breaks down everything you need to know to get the best possible score on your IELTS exam...',
        tags: ['ielts', 'test prep', 'guide'],
        published: true,
        publishedAt: '2023-10-22T10:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

/**
 * Renders the Blog Posts management page, powered by local mock data.
 * @returns {JSX.Element} The blog posts management component.
 */
export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  /**
   * Opens the dialog to either create a new post or edit an existing one.
   * @param {Post | null} post - The post to edit, or null to create a new one.
   */
  const openDialog = (post: Post | null = null) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  /**
   * Closes the create/edit dialog.
   */
  const closeDialog = () => {
    setEditingPost(null);
    setIsDialogOpen(false);
  };

  /**
   * Handles saving a post (create or update) to the local state.
   * @param {Partial<Post>} postData - The data of the post to be saved.
   */
  const handleSave = (postData: Partial<Post>) => {
    if (editingPost) {
        // Update existing post
        const updatedPosts = posts.map(p => p.id === editingPost.id ? { ...p, ...postData, slug: slugify(postData.title || '', { lower: true, strict: true }), updatedAt: new Date().toISOString() } as Post : p);
        setPosts(updatedPosts);
        toast.success(`Post "${postData.title}" updated successfully!`);
    } else {
        // Create new post
        const newPost: Post = {
            id: uuidv4(),
            title: postData.title || 'Untitled Post',
            slug: slugify(postData.title || '', { lower: true, strict: true }),
            content: postData.content || '',
            tags: postData.tags || [],
            published: postData.published || false,
            publishedAt: postData.published ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setPosts([newPost, ...posts]);
        toast.success(`Post "${newPost.title}" created successfully!`);
    }
    closeDialog();
  };

  /**
   * Handles deleting a post from the local state.
   * @param {string} postId - The ID of the post to delete.
   */
  const handleDelete = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast.success('Post deleted successfully!');
  };

  return (
    <div className="space-y-8">
      <AnimatedDiv>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHeader
            title="Blog Posts"
            description="Create, edit, and manage all articles on your website."
          />
          <Button onClick={() => openDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Post
          </Button>
        </div>
      </AnimatedDiv>
      
      <AnimatedDiv delay={200}>
        <Card className="bg-background/60 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
            <CardDescription>A list of all blog posts in your content management system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-full md:w-[50%]">Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={post.published ? 'default' : 'secondary'}>
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(post.createdAt), 'PP')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDialog(post)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the post.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(post.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </AnimatedDiv>

      <PostEditDialog 
        isOpen={isDialogOpen}
        onClose={closeDialog}
        post={editingPost}
        onSave={handleSave}
      />
    </div>
  );
}
