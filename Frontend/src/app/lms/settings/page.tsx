'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Bell,
    Shield,
    Globe,
    Palette,
    Save,
    Camera,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Languages,
    Volume2,
    Eye,
    Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function SettingsContent() {
    const { user, profile, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        display_name: profile?.display_name || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        bio: profile?.bio || '',
        phone: profile?.phone || '',
        country: profile?.country || '',
        timezone: profile?.timezone || 'UTC',
        language: profile?.locale || 'en',
        date_of_birth: profile?.date_of_birth || ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email_notifications: true,
        push_notifications: true,
        class_reminders: true,
        assignment_reminders: true,
        marketing_emails: false,
        weekly_digest: true
    });

    const [privacySettings, setPrivacySettings] = useState({
        profile_visibility: 'public',
        show_progress: true,
        show_achievements: true,
        allow_messages: true
    });

    const handleProfileUpdate = async () => {
        try {
            setLoading(true);
            await updateProfile(profileData);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async () => {
        try {
            setLoading(true);
            // API call to update notification settings
            toast.success('Notification settings updated');
        } catch (error) {
            toast.error('Failed to update notification settings');
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacyUpdate = async () => {
        try {
            setLoading(true);
            // API call to update privacy settings
            toast.success('Privacy settings updated');
        } catch (error) {
            toast.error('Failed to update privacy settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Privacy
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Preferences
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal information and profile details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Profile Picture */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                                        {profile?.avatar_s3_key ? (
                                            <img
                                                src={profile.avatar_s3_key}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div>
                                    <h3 className="font-medium">Profile Picture</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Upload a new profile picture. Recommended size: 400x400px
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        Change Picture
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="firstName"
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={profileData.last_name}
                                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={profileData.display_name}
                                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell us about yourself..."
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            {/* Contact Information */}
                            <Separator />
                            <h3 className="text-lg font-medium">Contact Information</h3>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="pl-10 bg-muted"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed. Contact support if you need to update your email.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="country"
                                            value={profileData.country}
                                            onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={profileData.date_of_birth}
                                            onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select value={profileData.timezone} onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                            <SelectItem value="Europe/London">London</SelectItem>
                                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleProfileUpdate} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose how you want to be notified about important updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.email_notifications}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings({ ...notificationSettings, email_notifications: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive push notifications in your browser
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.push_notifications}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings({ ...notificationSettings, push_notifications: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Class Reminders</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get reminded about upcoming classes
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.class_reminders}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings({ ...notificationSettings, class_reminders: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Assignment Reminders</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get reminded about assignment deadlines
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.assignment_reminders}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings({ ...notificationSettings, assignment_reminders: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Marketing Emails</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive updates about new features and courses
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.marketing_emails}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings({ ...notificationSettings, marketing_emails: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Weekly Digest</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive a weekly summary of your progress
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.weekly_digest}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings({ ...notificationSettings, weekly_digest: checked })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleNotificationUpdate} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Privacy Settings */}
                <TabsContent value="privacy" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy Settings</CardTitle>
                            <CardDescription>
                                Control who can see your information and activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Profile Visibility</Label>
                                    <Select
                                        value={privacySettings.profile_visibility}
                                        onValueChange={(value) => setPrivacySettings({ ...privacySettings, profile_visibility: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                                            <SelectItem value="students">Students Only - Only other students can see</SelectItem>
                                            <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Show Progress</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow others to see your learning progress
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacySettings.show_progress}
                                        onCheckedChange={(checked) =>
                                            setPrivacySettings({ ...privacySettings, show_progress: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Show Achievements</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display your certificates and achievements
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacySettings.show_achievements}
                                        onCheckedChange={(checked) =>
                                            setPrivacySettings({ ...privacySettings, show_achievements: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Allow Messages</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Let other students and instructors message you
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacySettings.allow_messages}
                                        onCheckedChange={(checked) =>
                                            setPrivacySettings({ ...privacySettings, allow_messages: checked })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handlePrivacyUpdate} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences */}
                <TabsContent value="preferences" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Preferences</CardTitle>
                            <CardDescription>
                                Customize your learning experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Preferred Language</Label>
                                    <div className="relative">
                                        <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Select value={profileData.language} onValueChange={(value) => setProfileData({ ...profileData, language: value })}>
                                            <SelectTrigger className="pl-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="de">German</SelectItem>
                                                <SelectItem value="zh">Chinese</SelectItem>
                                                <SelectItem value="ja">Japanese</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Audio Quality</Label>
                                    <div className="relative">
                                        <Volume2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Select defaultValue="high">
                                            <SelectTrigger className="pl-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low (saves bandwidth)</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High (best quality)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Auto-play Videos</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically play the next video in a course
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Show Subtitles</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display subtitles by default in video lessons
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Dark Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Use dark theme for better viewing in low light
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button>Save Preferences</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage your account security and password
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                    Your account is secured with industry-standard encryption.
                                    We recommend using a strong, unique password and enabling two-factor authentication.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Last changed 3 months ago
                                        </p>
                                    </div>
                                    <Button variant="outline">Change Password</Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Button variant="outline">Enable 2FA</Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Active Sessions</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Manage devices that are signed into your account
                                        </p>
                                    </div>
                                    <Button variant="outline">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Sessions
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Download Your Data</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Export all your personal data and learning progress
                                        </p>
                                    </div>
                                    <Button variant="outline">Download Data</Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                                    <div>
                                        <h4 className="font-medium text-red-600">Delete Account</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Permanently delete your account and all associated data
                                        </p>
                                    </div>
                                    <Button variant="destructive">Delete Account</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    );
}