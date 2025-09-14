'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'student' | 'instructor' | 'admin' | 'super_admin';
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/auth/signin'
}: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // If no user, redirect to sign in
            if (!user) {
                router.push(redirectTo);
                return;
            }

            // If user exists but no profile, wait for profile to load
            if (user && !profile) {
                return;
            }

            // Check role requirements
            if (requiredRole && profile) {
                const roleHierarchy = {
                    'student': 0,
                    'instructor': 1,
                    'admin': 2,
                    'super_admin': 3
                };

                const userRoleLevel = roleHierarchy[profile.role];
                const requiredRoleLevel = roleHierarchy[requiredRole];

                if (userRoleLevel < requiredRoleLevel) {
                    router.push('/unauthorized');
                    return;
                }
            }
        }
    }, [user, profile, loading, requiredRole, router, redirectTo]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading if user exists but profile is still loading
    if (user && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Setting up your profile...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!user || !profile) {
        return null;
    }

    // Check role requirements one more time
    if (requiredRole && profile) {
        const roleHierarchy = {
            'student': 0,
            'instructor': 1,
            'admin': 2,
            'super_admin': 3
        };

        const userRoleLevel = roleHierarchy[profile.role];
        const requiredRoleLevel = roleHierarchy[requiredRole];

        if (userRoleLevel < requiredRoleLevel) {
            return null;
        }
    }

    return <>{children}</>;
}

export default ProtectedRoute;