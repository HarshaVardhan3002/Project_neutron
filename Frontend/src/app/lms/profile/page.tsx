/**
 * @fileoverview User Profile page for the LMS.
 * Allows users to view and edit their profile information, track learning stats, and manage settings.
 */
'use client';

import React from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, BarChart, UserCog, Shield, Bell } from 'lucide-react';
import { AnimatedDiv } from '@/components/AnimatedDiv';

/**
 * Renders the User Profile and Settings page.
 * @returns {JSX.Element} The profile page component.
 */
export default function ProfilePage() {
    return (
        <div className="space-y-8">
            <AnimatedDiv>
                <PageHeader
                    title="My Profile & Settings"
                    description="Manage your account details, track your progress, and configure notifications."
                />
            </AnimatedDiv>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card & Stats */}
                <div className="lg:col-span-1 space-y-8">
                    <AnimatedDiv delay={100}>
                        <Card className="text-center bg-card/50 backdrop-blur-lg animated-border-card">
                            <CardHeader className="items-center">
                                <Avatar className="h-24 w-24 mb-4 border-4">
                                    <AvatarImage src="https://placehold.co/100x100" alt="Aditi Singh" data-ai-hint="person portrait" />
                                    <AvatarFallback>AS</AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-2xl">Aditi Singh</CardTitle>
                                <CardDescription>aditi.singh@example.com</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button>Edit Profile</Button>
                            </CardContent>
                        </Card>
                    </AnimatedDiv>
                    <AnimatedDiv delay={200}>
                        <Card className="bg-card/50 backdrop-blur-lg animated-border-card">
                            <CardHeader>
                                <CardTitle>Learning Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                                    <div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-yellow-500" /><span>Points Earned</span></div>
                                    <span className="font-bold">1,250 XP</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                                    <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-blue-500" /><span>Time Spent</span></div>
                                    <span className="font-bold">12h 45m</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                                    <div className="flex items-center gap-3"><BarChart className="h-5 w-5 text-green-500" /><span>Mock Tests</span></div>
                                    <span className="font-bold">3 Taken</span>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedDiv>
                </div>

                {/* Settings Tabs */}
                <AnimatedDiv className="lg:col-span-2" delay={300}>
                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="account"><UserCog className="w-4 h-4 mr-2" /> Account</TabsTrigger>
                            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" /> Security</TabsTrigger>
                            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="account">
                            <Card className="bg-card/50 backdrop-blur-lg animated-border-card">
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" defaultValue="Aditi Singh" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" defaultValue="aditi.singh@example.com" disabled />
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Button>Save Changes</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="security">
                             <Card className="bg-card/50 backdrop-blur-lg animated-border-card">
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>Change your password here. It's a good idea to use a strong password.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" />
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Button>Update Password</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="notifications">
                             <Card className="bg-card/50 backdrop-blur-lg animated-border-card">
                                <CardHeader>
                                    <CardTitle>Notification Settings</CardTitle>
                                    <CardDescription>Manage how you receive notifications from us.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Notification settings will be available soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </AnimatedDiv>
            </div>
        </div>
    );
}
