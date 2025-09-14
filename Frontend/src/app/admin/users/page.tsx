/**
 * @fileoverview User management page for the admin dashboard.
 * Allows admins to view, add, edit, and delete users using local state for a prototype experience.
 */
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Search } from 'lucide-react';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock data for users. In a real app, this would be fetched from a database.
 */
const mockUsers: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@projectneutron.com',
        role: 'admin',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Regular User',
        email: 'user@gmail.com',
        role: 'user',
        createdAt: new Date().toISOString()
    }
];

/**
 * Renders the User Management page, powered by local mock data.
 * @returns {JSX.Element} The user management page component.
 */
export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Opens the dialog for creating or editing a user.
   * @param {User | null} user - The user to edit, or null to create a new one.
   */
  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };
  
  /**
   * Closes the dialog.
   */
  const closeDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  /**
   * Saves user data (either creating or updating).
   * @param {Partial<User>} userData - The user data to save.
   */
  const handleSaveUser = (userData: Partial<User>) => {
     if (editingUser) {
        // Update existing user
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } as User : u));
        toast.success(`User "${userData.name}" updated successfully!`);
    } else {
        // Create new user
        const newUser: User = {
            id: uuidv4(),
            name: userData.name || 'New User',
            email: userData.email || 'new.user@example.com',
            role: userData.role || 'user',
            createdAt: new Date().toISOString(),
        };
        setUsers([newUser, ...users]);
        toast.success(`User "${newUser.name}" created successfully!`);
    }
    closeDialog();
  };

  /**
   * Deletes a user from the local state.
   * @param {string} userId - The ID of the user to delete.
   */
  const handleDeleteUser = async (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success('User deleted successfully!');
  };


  return (
    <div className="space-y-8">
      <AnimatedDiv>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHeader
            title="User Management"
            description="View, add, and manage all users on your platform."
          />
          <Button onClick={() => openDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </AnimatedDiv>
      
      <AnimatedDiv delay={200}>
        <Card className="bg-background/60 backdrop-blur-lg border-white/10">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>A list of all registered users.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            className="pl-8 w-full md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                               <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                                {user.role}
                            </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(user.createdAt), 'PP')}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDialog(user)}>
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
                                        This action cannot be undone. This will permanently delete the user account.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
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

      <UserEditDialog 
        isOpen={isDialogOpen}
        onClose={closeDialog}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}

/**
 * A dialog component for adding or editing a user.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the dialog is open.
 * @param {() => void} props.onClose - Function to close the dialog.
 * @param {User | null} props.user - The user being edited, or null for a new user.
 * @param {(data: Partial<User>) => void} props.onSave - Callback to save the user data.
 * @returns {JSX.Element} The user edit dialog component.
 */
function UserEditDialog({ isOpen, onClose, user, onSave }: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (data: Partial<User>) => void;
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');

    /**
     * Effect to populate the form fields when the dialog opens with a user to edit,
     * or to reset the fields for a new user.
     */
    useEffect(() => {
      if (isOpen) {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
        } else {
            // Reset for new user
            setName('');
            setEmail('');
            setRole('user');
        }
      }
    }, [user, isOpen]);

    /**
     * Handles the form submission, validates input, and calls the onSave callback.
     */
    const handleSubmit = () => {
        if (!name || !email) {
            toast.error('Name and Email are required.');
            return;
        }
        
        const userData: Partial<User> = { name, email, role };
        onSave(userData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                       {user ? "Update the user's details and permissions." : "Create a new user account for the platform."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select onValueChange={(value: 'admin' | 'user') => setRole(value)} value={role}>
                            <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save User</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
