'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Palette,
    Eye,
    Save,
    Plus,
    Trash2,
    Edit,
    Check,
    X,
    Globe,
    Gift,
    Sparkles,
    Moon,
    Flower,
    Star,
    Heart,
    Zap,
    Sun
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api.service';

interface Theme {
    id: string;
    name: string;
    description: string;
    occasion: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        border: string;
    };
    is_active: boolean;
    created_by?: string;
    created_at: string;
    updated_at?: string;
    metadata?: Record<string, any>;
}

interface CreateThemeData {
    name: string;
    description?: string;
    occasion?: string;
    colors: Theme['colors'];
    metadata?: Record<string, any>;
}

const OCCASIONS = [
    { value: 'default', label: 'Default', icon: Globe, color: 'bg-blue-500' },
    { value: 'christmas', label: 'Christmas', icon: Gift, color: 'bg-red-500' },
    { value: 'diwali', label: 'Diwali', icon: Sparkles, color: 'bg-orange-500' },
    { value: 'ramadan', label: 'Ramadan', icon: Moon, color: 'bg-purple-500' },
    { value: 'holi', label: 'Holi', icon: Flower, color: 'bg-pink-500' },
    { value: 'new-year', label: 'New Year', icon: Star, color: 'bg-yellow-500' },
    { value: 'valentine', label: 'Valentine\'s Day', icon: Heart, color: 'bg-rose-500' },
    { value: 'halloween', label: 'Halloween', icon: Zap, color: 'bg-orange-600' },
    { value: 'easter', label: 'Easter', icon: Sun, color: 'bg-green-500' }
];

function ThemeManagementContent() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
    const [newTheme, setNewTheme] = useState<CreateThemeData>({
        name: '',
        description: '',
        occasion: 'default',
        colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#06b6d4',
            background: '#ffffff',
            foreground: '#0f172a',
            muted: '#f1f5f9',
            border: '#e2e8f0'
        }
    });

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getThemes();

            if (response.error) {
                toast.error(response.error);
                return;
            }

            const themesData = (response.data as { themes: any[] })?.themes || [];
            setThemes(themesData);

            // Set active theme as selected, or first theme if none active
            const activeTheme = themesData.find(t => t.is_active) || themesData[0];
            if (activeTheme) {
                setSelectedTheme(activeTheme);
            }
        } catch (error) {
            console.error('Error loading themes:', error);
            toast.error('Failed to load themes');
        } finally {
            setLoading(false);
        }
    };

    const createTheme = async () => {
        try {
            setSaving(true);
            const response = await apiClient.createTheme(newTheme);

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success('Theme created successfully');
            setShowCreateDialog(false);
            resetNewTheme();

            // Reload themes
            await loadThemes();
        } catch (error) {
            console.error('Error creating theme:', error);
            toast.error('Failed to create theme');
        } finally {
            setSaving(false);
        }
    };

    const updateTheme = async (themeId: string, updates: Partial<CreateThemeData>) => {
        try {
            setSaving(true);
            const response = await apiClient.updateTheme(themeId, updates);

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success('Theme updated successfully');

            // Update local state
            const updatedTheme = (response.data as { theme: any })?.theme;
            setThemes(prev => prev.map(theme =>
                theme.id === themeId
                    ? { ...theme, ...updatedTheme }
                    : theme
            ));

            if (selectedTheme?.id === themeId) {
                setSelectedTheme(prev => prev ? { ...prev, ...updatedTheme } : null);
            }
        } catch (error) {
            console.error('Error updating theme:', error);
            toast.error('Failed to update theme');
        } finally {
            setSaving(false);
        }
    };

    const activateTheme = async (themeId: string) => {
        try {
            setSaving(true);
            const response = await apiClient.activateTheme(themeId);

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success('Theme activated successfully');

            // Update local state - deactivate all themes and activate selected
            setThemes(prev => prev.map(theme => ({
                ...theme,
                is_active: theme.id === themeId
            })));
        } catch (error) {
            console.error('Error activating theme:', error);
            toast.error('Failed to activate theme');
        } finally {
            setSaving(false);
        }
    };

    const deleteTheme = async (themeId: string) => {
        if (!confirm('Are you sure you want to delete this theme?')) {
            return;
        }

        try {
            setSaving(true);
            const response = await apiClient.deleteTheme(themeId);

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success('Theme deleted successfully');

            // Remove from local state
            setThemes(prev => prev.filter(theme => theme.id !== themeId));

            if (selectedTheme?.id === themeId) {
                const remainingThemes = themes.filter(theme => theme.id !== themeId);
                setSelectedTheme(remainingThemes[0] || null);
            }
        } catch (error) {
            console.error('Error deleting theme:', error);
            toast.error('Failed to delete theme');
        } finally {
            setSaving(false);
        }
    };

    const resetNewTheme = () => {
        setNewTheme({
            name: '',
            description: '',
            occasion: 'default',
            colors: {
                primary: '#3b82f6',
                secondary: '#64748b',
                accent: '#06b6d4',
                background: '#ffffff',
                foreground: '#0f172a',
                muted: '#f1f5f9',
                border: '#e2e8f0'
            }
        });
    };

    const getOccasionInfo = (occasion: string) => {
        return OCCASIONS.find(o => o.value === occasion) || OCCASIONS[0];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading themes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-lg">
                        <Palette className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Theme Management</h1>
                        <p className="text-muted-foreground">
                            Customize website appearance for different occasions and seasons
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Theme
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Theme Library */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Theme Library</CardTitle>
                            <CardDescription>
                                Choose from available themes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {themes.map((theme) => {
                                const occasion = getOccasionInfo(theme.occasion);
                                const IconComponent = occasion.icon;

                                return (
                                    <div
                                        key={theme.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTheme?.id === theme.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedTheme(theme)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <IconComponent className="h-4 w-4" />
                                            <span className="font-medium text-sm">{theme.name}</span>
                                            {theme.is_active && (
                                                <Badge variant="secondary" className="text-xs">Active</Badge>
                                            )}
                                        </div>

                                        <div className="flex gap-1 mb-2">
                                            {Object.values(theme.colors).slice(0, 5).map((color, index) => (
                                                <div
                                                    key={index}
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-xs text-muted-foreground">{theme.description}</p>

                                        <div className="flex gap-1 mt-3">
                                            <Button
                                                size="sm"
                                                variant={theme.is_active ? "secondary" : "default"}
                                                className="flex-1 text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    activateTheme(theme.id);
                                                }}
                                                disabled={saving}
                                            >
                                                {theme.is_active ? 'Active' : 'Activate'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTheme(theme.id);
                                                }}
                                                disabled={saving || theme.is_active}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Theme Editor */}
                <div className="lg:col-span-3">
                    {selectedTheme ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Theme: {selectedTheme.name}</CardTitle>
                                <CardDescription>
                                    Customize the selected theme
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Theme Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Theme Name</Label>
                                        <Input
                                            value={selectedTheme.name}
                                            onChange={(e) => updateTheme(selectedTheme.id, { name: e.target.value })}
                                            disabled={saving}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Occasion</Label>
                                        <Select
                                            value={selectedTheme.occasion}
                                            onValueChange={(value) => updateTheme(selectedTheme.id, { occasion: value })}
                                            disabled={saving}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {OCCASIONS.map(occasion => (
                                                    <SelectItem key={occasion.value} value={occasion.value}>
                                                        <div className="flex items-center gap-2">
                                                            <occasion.icon className="h-4 w-4" />
                                                            {occasion.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={selectedTheme.description}
                                        onChange={(e) => updateTheme(selectedTheme.id, { description: e.target.value })}
                                        disabled={saving}
                                    />
                                </div>

                                {/* Color Inputs */}
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Colors</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(selectedTheme.colors).map(([colorKey, colorValue]) => (
                                            <div key={colorKey} className="space-y-2">
                                                <Label className="capitalize">{colorKey.replace(/([A-Z])/g, ' $1')}</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={colorValue}
                                                        onChange={(e) => updateTheme(selectedTheme.id, {
                                                            colors: {
                                                                ...selectedTheme.colors,
                                                                [colorKey]: e.target.value
                                                            }
                                                        })}
                                                        className="w-16 h-10 p-1 border rounded"
                                                        disabled={saving}
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={colorValue}
                                                        onChange={(e) => updateTheme(selectedTheme.id, {
                                                            colors: {
                                                                ...selectedTheme.colors,
                                                                [colorKey]: e.target.value
                                                            }
                                                        })}
                                                        className="flex-1"
                                                        disabled={saving}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Preview</Label>
                                    <div
                                        className="p-6 rounded-lg border"
                                        style={{
                                            backgroundColor: selectedTheme.colors.background,
                                            color: selectedTheme.colors.foreground,
                                            borderColor: selectedTheme.colors.border
                                        }}
                                    >
                                        <div className="space-y-4">
                                            <h3
                                                className="text-xl font-bold"
                                                style={{ color: selectedTheme.colors.primary }}
                                            >
                                                Sample Heading
                                            </h3>
                                            <p style={{ color: selectedTheme.colors.secondary }}>
                                                This is how your content will look with this theme.
                                            </p>
                                            <div className="flex gap-2">
                                                <div
                                                    className="px-4 py-2 rounded text-white"
                                                    style={{ backgroundColor: selectedTheme.colors.primary }}
                                                >
                                                    Primary Button
                                                </div>
                                                <div
                                                    className="px-4 py-2 rounded border"
                                                    style={{
                                                        borderColor: selectedTheme.colors.border,
                                                        backgroundColor: selectedTheme.colors.muted
                                                    }}
                                                >
                                                    Secondary Button
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Select a theme to edit</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Theme Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Theme</DialogTitle>
                        <DialogDescription>
                            Create a custom theme for your website
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Theme Name</Label>
                                <Input
                                    value={newTheme.name}
                                    onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter theme name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Occasion</Label>
                                <Select
                                    value={newTheme.occasion}
                                    onValueChange={(value) => setNewTheme(prev => ({ ...prev, occasion: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OCCASIONS.map(occasion => (
                                            <SelectItem key={occasion.value} value={occasion.value}>
                                                <div className="flex items-center gap-2">
                                                    <occasion.icon className="h-4 w-4" />
                                                    {occasion.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={newTheme.description}
                                onChange={(e) => setNewTheme(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter theme description"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Colors</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(newTheme.colors).map(([colorKey, colorValue]) => (
                                    <div key={colorKey} className="space-y-2">
                                        <Label className="capitalize">{colorKey.replace(/([A-Z])/g, ' $1')}</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={colorValue}
                                                onChange={(e) => setNewTheme(prev => ({
                                                    ...prev,
                                                    colors: {
                                                        ...prev.colors,
                                                        [colorKey]: e.target.value
                                                    }
                                                }))}
                                                className="w-16 h-10 p-1 border rounded"
                                            />
                                            <Input
                                                type="text"
                                                value={colorValue}
                                                onChange={(e) => setNewTheme(prev => ({
                                                    ...prev,
                                                    colors: {
                                                        ...prev.colors,
                                                        [colorKey]: e.target.value
                                                    }
                                                }))}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowCreateDialog(false);
                            resetNewTheme();
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={createTheme} disabled={saving || !newTheme.name}>
                            {saving ? 'Creating...' : 'Create Theme'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ThemeManagementPage() {
    return (
        <ProtectedRoute requiredRole="super_admin">
            <ThemeManagementContent />
        </ProtectedRoute>
    );
}