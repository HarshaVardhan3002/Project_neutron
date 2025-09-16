'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Globe,
    Save,
    Eye,
    Plus,
    Trash2,
    Edit,
    Image,
    FileText,
    Upload,
    History,
    Settings,
    Monitor,
    Smartphone,
    Tablet,
    Check,
    X,
    AlertCircle,
    Users
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api.service';

interface WebsiteContent {
    id: string;
    section: string;
    content: Record<string, any>;
    is_active: boolean;
    created_by?: string;
    created_by_name?: string;
    created_at: string;
    updated_at?: string;
}

interface ContentSection {
    section: string;
    title: string;
    description: string;
    fields: ContentField[];
    icon: React.ComponentType<any>;
}

interface ContentField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'url' | 'boolean' | 'array';
    placeholder?: string;
    required?: boolean;
}

const CONTENT_SECTIONS: ContentSection[] = [
    {
        section: 'hero',
        title: 'Hero Section',
        description: 'Main landing page hero section',
        icon: Monitor,
        fields: [
            { key: 'title', label: 'Main Title', type: 'text', required: true },
            { key: 'subtitle', label: 'Subtitle', type: 'textarea', required: true },
            { key: 'backgroundImage', label: 'Background Image URL', type: 'image' },
            { key: 'ctaText', label: 'Call to Action Text', type: 'text', required: true },
            { key: 'ctaUrl', label: 'Call to Action URL', type: 'url' }
        ]
    },
    {
        section: 'features',
        title: 'Features Section',
        description: 'Platform features and benefits',
        icon: Settings,
        fields: [
            { key: 'title', label: 'Section Title', type: 'text', required: true },
            { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
            { key: 'items', label: 'Feature Items', type: 'array' }
        ]
    },
    {
        section: 'about',
        title: 'About Section',
        description: 'About us and company information',
        icon: FileText,
        fields: [
            { key: 'title', label: 'Section Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: true },
            { key: 'image', label: 'Section Image', type: 'image' },
            { key: 'stats', label: 'Statistics', type: 'array' }
        ]
    },
    {
        section: 'testimonials',
        title: 'Testimonials',
        description: 'Customer testimonials and reviews',
        icon: Users,
        fields: [
            { key: 'title', label: 'Section Title', type: 'text', required: true },
            { key: 'items', label: 'Testimonials', type: 'array' }
        ]
    },
    {
        section: 'contact',
        title: 'Contact Information',
        description: 'Contact details and information',
        icon: Globe,
        fields: [
            { key: 'email', label: 'Contact Email', type: 'text', required: true },
            { key: 'phone', label: 'Contact Phone', type: 'text' },
            { key: 'address', label: 'Address', type: 'textarea' },
            { key: 'socialLinks', label: 'Social Media Links', type: 'array' }
        ]
    }
];

function WebsiteContentManagementContent() {
    const [contentSections, setContentSections] = useState<WebsiteContent[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>('hero');
    const [currentContent, setCurrentContent] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadContent();
    }, []);

    useEffect(() => {
        if (selectedSection) {
            loadSectionContent(selectedSection);
        }
    }, [selectedSection, contentSections]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getAllContentSections();

            if (response.error) {
                toast.error(response.error);
                return;
            }

            setContentSections((response.data as { content: any[] })?.content || []);
        } catch (error) {
            console.error('Error loading content:', error);
            toast.error('Failed to load website content');
        } finally {
            setLoading(false);
        }
    };

    const loadSectionContent = (section: string) => {
        const sectionData = contentSections.find(c => c.section === section);
        if (sectionData) {
            setCurrentContent(sectionData.content || {});
        } else {
            // Initialize with empty content based on section definition
            const sectionDef = CONTENT_SECTIONS.find(s => s.section === section);
            if (sectionDef) {
                const emptyContent: Record<string, any> = {};
                sectionDef.fields.forEach(field => {
                    if (field.type === 'array') {
                        emptyContent[field.key] = [];
                    } else if (field.type === 'boolean') {
                        emptyContent[field.key] = false;
                    } else {
                        emptyContent[field.key] = '';
                    }
                });
                setCurrentContent(emptyContent);
            }
        }
    };

    const saveContent = async () => {
        try {
            setSaving(true);
            const response = await apiClient.createOrUpdateContentSection(selectedSection, {
                content: currentContent,
                is_active: true
            });

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success('Content saved successfully');

            // Reload content to get updated data
            await loadContent();
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    const toggleSectionActive = async (section: string) => {
        try {
            const response = await apiClient.toggleContentSection(section);

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success('Section status updated');
            await loadContent();
        } catch (error) {
            console.error('Error toggling section:', error);
            toast.error('Failed to update section status');
        }
    };

    const loadHistory = async (section: string) => {
        try {
            const response = await apiClient.getContentHistory(section, 20);

            if (response.error) {
                toast.error(response.error);
                return;
            }

            setHistory((response.data as { history: any[] })?.history || []);
            setShowHistory(true);
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error('Failed to load content history');
        }
    };

    const updateContentField = (key: string, value: any) => {
        setCurrentContent(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const addArrayItem = (key: string) => {
        setCurrentContent(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), {}]
        }));
    };

    const removeArrayItem = (key: string, index: number) => {
        setCurrentContent(prev => ({
            ...prev,
            [key]: (prev[key] || []).filter((_: any, i: number) => i !== index)
        }));
    };

    const updateArrayItem = (key: string, index: number, field: string, value: any) => {
        setCurrentContent(prev => ({
            ...prev,
            [key]: (prev[key] || []).map((item: any, i: number) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const renderField = (field: ContentField) => {
        const value = currentContent[field.key] || '';

        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => updateContentField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                    />
                );

            case 'image':
                return (
                    <div className="space-y-2">
                        <Input
                            type="url"
                            value={value}
                            onChange={(e) => updateContentField(field.key, e.target.value)}
                            placeholder="Enter image URL or upload"
                        />
                        {value && (
                            <div className="border rounded-lg p-2">
                                <img
                                    src={value}
                                    alt="Preview"
                                    className="max-w-full h-32 object-cover rounded"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                        </Button>
                    </div>
                );

            case 'url':
                return (
                    <Input
                        type="url"
                        value={value}
                        onChange={(e) => updateContentField(field.key, e.target.value)}
                        placeholder={field.placeholder || 'https://example.com'}
                    />
                );

            case 'boolean':
                return (
                    <Switch
                        checked={value}
                        onCheckedChange={(checked) => updateContentField(field.key, checked)}
                    />
                );

            case 'array':
                const arrayValue = Array.isArray(value) ? value : [];
                return (
                    <div className="space-y-4">
                        {arrayValue.map((item: any, index: number) => (
                            <Card key={index} className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium">Item {index + 1}</h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeArrayItem(field.key, index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={item.title || ''}
                                            onChange={(e) => updateArrayItem(field.key, index, 'title', e.target.value)}
                                            placeholder="Enter title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={item.description || ''}
                                            onChange={(e) => updateArrayItem(field.key, index, 'description', e.target.value)}
                                            placeholder="Enter description"
                                            rows={3}
                                        />
                                    </div>
                                    {field.key === 'items' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Icon</Label>
                                                <Input
                                                    value={item.icon || ''}
                                                    onChange={(e) => updateArrayItem(field.key, index, 'icon', e.target.value)}
                                                    placeholder="Icon name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Link URL</Label>
                                                <Input
                                                    value={item.url || ''}
                                                    onChange={(e) => updateArrayItem(field.key, index, 'url', e.target.value)}
                                                    placeholder="https://example.com"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => addArrayItem(field.key)}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                );

            default:
                return (
                    <Input
                        value={value}
                        onChange={(e) => updateContentField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
        }
    };

    const getCurrentSectionData = () => {
        return contentSections.find(c => c.section === selectedSection);
    };

    const getCurrentSectionDefinition = () => {
        return CONTENT_SECTIONS.find(s => s.section === selectedSection);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading website content...</p>
                </div>
            </div>
        );
    }

    const sectionData = getCurrentSectionData();
    const sectionDef = getCurrentSectionDefinition();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-green-600 p-3 rounded-lg">
                        <Globe className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Website Content Management</h1>
                        <p className="text-muted-foreground">
                            Manage landing page content, sections, and website information
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPreview(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </Button>
                    <Button onClick={saveContent} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Section Navigation */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Content Sections</CardTitle>
                            <CardDescription>
                                Select a section to edit
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {CONTENT_SECTIONS.map((section) => {
                                const sectionData = contentSections.find(c => c.section === section.section);
                                const IconComponent = section.icon;

                                return (
                                    <div
                                        key={section.section}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedSection === section.section
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedSection(section.section)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="h-4 w-4" />
                                                <span className="font-medium text-sm">{section.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {sectionData?.is_active ? (
                                                    <Badge variant="secondary" className="text-xs">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Content Editor */}
                <div className="lg:col-span-3">
                    {sectionDef ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <sectionDef.icon className="h-5 w-5" />
                                            {sectionDef.title}
                                        </CardTitle>
                                        <CardDescription>{sectionDef.description}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => loadHistory(selectedSection)}
                                        >
                                            <History className="h-4 w-4 mr-2" />
                                            History
                                        </Button>
                                        {sectionData && (
                                            <Switch
                                                checked={sectionData.is_active}
                                                onCheckedChange={() => toggleSectionActive(selectedSection)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {sectionDef.fields.map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            {field.label}
                                            {field.required && <span className="text-red-500">*</span>}
                                        </Label>
                                        {renderField(field)}
                                    </div>
                                ))}

                                {/* Section Status */}
                                {sectionData && (
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Last updated: {new Date(sectionData.updated_at || sectionData.created_at).toLocaleString()}</span>
                                            {sectionData.created_by_name && (
                                                <span>By: {sectionData.created_by_name}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Select a section to edit</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Content History: {sectionDef?.title}</DialogTitle>
                        <DialogDescription>
                            Recent changes to this content section
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {history.map((entry, index) => (
                            <div key={entry.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={
                                        entry.action === 'create' ? 'default' :
                                            entry.action === 'update' ? 'secondary' :
                                                entry.action === 'delete' ? 'destructive' : 'outline'
                                    }>
                                        {entry.action}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(entry.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm">{entry.message}</p>
                                {entry.user_name && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        By: {entry.user_name}
                                    </p>
                                )}
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No history available for this section
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowHistory(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function WebsiteContentManagementPage() {
    return (
        <ProtectedRoute requiredRole="super_admin">
            <WebsiteContentManagementContent />
        </ProtectedRoute>
    );
}