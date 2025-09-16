'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase.service';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) {
                setError(error.message);
                toast.error(error.message);
            } else {
                setSent(true);
                toast.success('Password reset email sent!');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        Project Neutron LMS
                    </Link>
                    <Button variant="ghost" asChild>
                        <Link href="/auth/signin">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-center">
                    <Card className="w-full max-w-md shadow-xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                            <CardDescription>
                                {sent
                                    ? "Check your email for reset instructions"
                                    : "Enter your email address and we'll send you a link to reset your password"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {sent ? (
                                <div className="text-center space-y-4">
                                    <div className="bg-green-100 p-4 rounded-lg">
                                        <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="text-green-800 font-medium">Email Sent!</p>
                                        <p className="text-green-700 text-sm mt-1">
                                            We've sent a password reset link to {email}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setSent(false);
                                                setEmail('');
                                            }}
                                        >
                                            Send Another Email
                                        </Button>
                                        <Button variant="ghost" className="w-full" asChild>
                                            <Link href="/auth/signin">
                                                Back to Sign In
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </Button>
                                </form>
                            )}

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Remember your password?{' '}
                                    <Link href="/auth/signin" className="text-primary hover:underline">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}