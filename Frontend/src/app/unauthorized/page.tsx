'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext.context';

export default function UnauthorizedPage() {
    const { user, profile } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="mt-4 text-2xl">Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to access this page
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-sm text-muted-foreground">
                            {user && profile ? (
                                <p>
                                    Your current role: <span className="font-medium capitalize">{profile.role}</span>
                                </p>
                            ) : (
                                <p>Please sign in to access this content</p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Button asChild>
                                <Link href="/dashboard">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go to Dashboard
                                </Link>
                            </Button>

                            {!user && (
                                <Button variant="outline" asChild>
                                    <Link href="/auth/signin">
                                        Sign In
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}