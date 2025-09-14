/**
 * @fileoverview Settings page for the admin dashboard.
 * Provides controls for general site settings and content management.
 */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { List, LayoutTemplate, UserCog, ShieldCheck } from 'lucide-react';

/**
 * Placeholder for data that would be fetched from a backend.
 * Represents the editable content of the Hero section.
 */
const mockHeroContent = {
  line1: 'Learn smarter, not harder.',
  line2: 'Master any subject.',
  line3: 'Your learning journey starts here.',
  description: 'Project_Neutron is an advanced Learning Management System designed to revolutionize how you learn, track progress, and achieve your educational goals.',
};

/**
 * Renders the Settings page in the admin dashboard.
 * @returns {JSX.Element} The settings page component.
 */
export default function SettingsPage() {
  const [heroContent, setHeroContent] = useState(mockHeroContent);

  /**
   * Handles changes to the hero content input fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The event object.
   */
  const handleHeroContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHeroContent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Simulates saving settings to a backend.
   * @param {string} section - The name of the section being saved, for the toast message.
   */
  const saveSettings = (section: string) => {
    // This is a placeholder for a real API call to save the settings.
    toast.success(`${section} settings saved!`, {
      description: 'Note: This is a simulation. A real backend is needed to persist these changes.'
    });
  };

  return (
    <div className="space-y-8">
      <AnimatedDiv>
        <PageHeader
          title="Settings"
          description="Manage your website's configuration and content from one place."
        />
      </AnimatedDiv>

      <AnimatedDiv delay={200}>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-background/60 backdrop-blur-lg border-white/10">
            <TabsTrigger value="content"><LayoutTemplate className="w-4 h-4 mr-2" /> Content</TabsTrigger>
            <TabsTrigger value="general"><List className="w-4 h-4 mr-2" /> General</TabsTrigger>
            <TabsTrigger value="users"><UserCog className="w-4 h-4 mr-2" /> Users</TabsTrigger>
            <TabsTrigger value="security"><ShieldCheck className="w-4 h-4 mr-2" /> Security</TabsTrigger>
          </TabsList>

          {/* Content Management Tab */}
          <TabsContent value="content" className="mt-6">
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>Website Content Management</CardTitle>
                <CardDescription>
                  Edit the text and images displayed on your public-facing website.
                  More sections can be added here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example: Editing the Homepage Hero Section */}
                <div className="p-6 border rounded-lg bg-background/50">
                  <h3 className="font-headline text-lg font-semibold mb-4">Homepage Hero Section</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="line1">Headline - Line 1</Label>
                        <Input id="line1" name="line1" value={heroContent.line1} onChange={handleHeroContentChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="line2">Headline - Line 2</Label>
                        <Input id="line2" name="line2" value={heroContent.line2} onChange={handleHeroContentChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="line3">Headline - Line 3</Label>
                        <Input id="line3" name="line3" value={heroContent.line3} onChange={handleHeroContentChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={heroContent.description} onChange={handleHeroContentChange} rows={3} />
                    </div>
                  </div>
                   <div className="flex justify-end mt-4">
                    <Button onClick={() => saveSettings('Hero Section')}>Save Hero Content</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="mt-6">
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Update your site's basic information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="Project_Neutron" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description / Tagline</Label>
                  <Input id="site-description" defaultValue="Big on Ideas, Big on Execution." />
                </div>
                 <div className="flex justify-end mt-4">
                    <Button onClick={() => saveSettings('General')}>Save General Settings</Button>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
          
           {/* Placeholder Tabs */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>User & Role Management</CardTitle>
                <CardDescription>This feature is under development.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Define user roles and permissions here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <Card className="bg-background/60 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>This feature is under development.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Configure security options like two-factor authentication.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedDiv>
    </div>
  );
}
