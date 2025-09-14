'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Eye, Users, Mail, Shield, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api.service';

interface User {
    id: string;
    email: string;
    displayName: string;
    role: 'student' | 'instructor' | 'admin' | 'super_admin';
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
    profile?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        country?: string;
        dateOfBirth?: string;
    };
    _count: {
        enrollments: number;
        testAttempts: number;
    };
}

interface UserManagerProps {
    searchQuery: string;
}

export function UserManager({ searchQuery }: UserManagerProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [userFormData, setUserFormData] = useState({
        email: '',
        displayName: '',
        role: 'student' as 'student' | 'instructor' | 'admin' | 'super_admin',
        isActive: true,
        firstName: '',
        lastName: '',
        phone: '',
        country: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getUsers();
            if (response.data) {
                setUsers((response.data as any)?.users || []);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        try {
            const response = await apiClient.createUser(userFormData);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('User created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            toast.error('Failed to create user');
            console.error('Error creating user:', error);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        try {
            const response = await apiClient.updateUserRole(selectedUser.id, userFormData.role);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('User updated successfully');
            setIsEditDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user');
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const response = await apiClient.deleteUser(userId);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
            console.error('Error deleting user:', error);
        }
    };

    const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            // Note: This functionality needs to be implemented in the API
            // For now, we'll show a message that this feature is coming soon
            toast.info('User status toggle feature coming soon');
            // TODO: Implement user activation/deactivation API endpoint
            // const response = await apiClient.toggleUserStatus(userId, !isActive);
            // if (response.error) {
            //     throw new Error(response.message);
            // }
            // toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
            // fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
            console.error('Error updating user status:', error);
        }
    };

    const handleSendPasswordReset = async (userId: string) => {
        try {
            const response = await apiClient.sendPasswordReset(userId);
            if (response.error) {
                throw new Error(response.message);
            }

            toast.success('Password reset email sent successfully');
        } catch (error) {
            toast.error('Failed to send password reset email');
            console.error('Error sending password reset:', error);
        }
    };

    const resetForm = () => {
        setUserFormData({
            email: '',
            displayName: '',
            role: 'student',
            isActive: true,
            firstName: '',
            lastName: '',
            phone: '',
            country: ''
        });
        setSelectedUser(null);
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setUserFormData({
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            isActive: user.isActive,
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            phone: user.profile?.phone || '',
            country: user.profile?.country || ''
        });
        setIsEditDialogOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.isActive) ||
            (filterStatus === 'inactive' && !user.isActive) ||
            (filterStatus === 'verified' && user.emailVerified) ||
            (filterStatus === 'unverified' && !user.emailVerified);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'super_admin': return 'destructive';
            case 'admin': return 'default';
            case 'instructor': return 'secondary';
            default: return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
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
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage users, roles, and permissions
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the platform
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user-email">Email</Label>
                                    <Input
                                        id="user-email"
                                        type="email"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user-displayName">Display Name</Label>
                                    <Input
                                        id="user-displayName"
                                        value={userFormData.displayName}
                                        onChange={(e) => setUserFormData({ ...userFormData, displayName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user-firstName">First Name</Label>
                                    <Input
                                        id="user-firstName"
                                        value={userFormData.firstName}
                                        onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user-lastName">Last Name</Label>
                                    <Input
                                        id="user-lastName"
                                        value={userFormData.lastName}
                                        onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user-phone">Phone</Label>
                                    <Input
                                        id="user-phone"
                                        value={userFormData.phone}
                                        onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                                        placeholder="+1234567890"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user-country">Country</Label>
                                    <Input
                                        id="user-country"
                                        value={userFormData.country}
                                        onChange={(e) => setUserFormData({ ...userFormData, country: e.target.value })}
                                        placeholder="United States"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-role">Role</Label>
                                <Select value={userFormData.role} onValueChange={(value: any) => setUserFormData({ ...userFormData, role: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="user-active"
                                    checked={userFormData.isActive}
                                    onCheckedChange={(checked) => setUserFormData({ ...userFormData, isActive: checked })}
                                />
                                <Label htmlFor="user-active">Active user</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateUser}>
                                Create User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="role-filter">Role:</Label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter">Status:</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Enrollments</TableHead>
                                <TableHead>Test Attempts</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                                                <AvatarFallback>
                                                    {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            <Shield className="h-3 w-3 mr-1" />
                                            {user.role.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Badge variant={user.emailVerified ? 'default' : 'outline'} className="text-xs">
                                                {user.emailVerified ? (
                                                    <><CheckCircle className="h-3 w-3 mr-1" />Verified</>
                                                ) : (
                                                    'Unverified'
                                                )}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {user._count.enrollments}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user._count.testAttempts}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {user.lastLoginAt
                                                ? new Date(user.lastLoginAt).toLocaleDateString()
                                                : 'Never'
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                            >
                                                {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSendPasswordReset(user.id)}
                                            >
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
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

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information and permissions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-email">Email</Label>
                                <Input
                                    id="edit-user-email"
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-displayName">Display Name</Label>
                                <Input
                                    id="edit-user-displayName"
                                    value={userFormData.displayName}
                                    onChange={(e) => setUserFormData({ ...userFormData, displayName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-firstName">First Name</Label>
                                <Input
                                    id="edit-user-firstName"
                                    value={userFormData.firstName}
                                    onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-lastName">Last Name</Label>
                                <Input
                                    id="edit-user-lastName"
                                    value={userFormData.lastName}
                                    onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-phone">Phone</Label>
                                <Input
                                    id="edit-user-phone"
                                    value={userFormData.phone}
                                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-country">Country</Label>
                                <Input
                                    id="edit-user-country"
                                    value={userFormData.country}
                                    onChange={(e) => setUserFormData({ ...userFormData, country: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-user-role">Role</Label>
                            <Select value={userFormData.role} onValueChange={(value: any) => setUserFormData({ ...userFormData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-user-active"
                                checked={userFormData.isActive}
                                onCheckedChange={(checked) => setUserFormData({ ...userFormData, isActive: checked })}
                            />
                            <Label htmlFor="edit-user-active">Active user</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateUser}>
                            Update User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}