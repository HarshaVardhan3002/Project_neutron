/**
 * @fileoverview Protected route component that requires authentication
 */
'use client';

import { useAuth } from '@/contexts/AuthContext.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

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
            // Check if user is authenticated
            if (!user) {
                toast.error('Please sign in to access this page');
                router.push(redirectTo);
                return;
            }

            // Check if user has required role
            if (requiredRole && profile?.role !== requiredRole) {
                // Check for role hierarchy
                const roleHierarchy = {
                    'student': 0,
                    'instructor': 1,
                    'admin': 2,
                    'super_admin': 3
                };

                const userRoleLevel = roleHierarchy[profile?.role as keyof typeof roleHierarchy] || 0;
                const requiredRoleLevel = roleHierarchy[requiredRole];

                if (userRoleLevel < requiredRoleLevel) {
                    toast.error('You do not have permission to access this page');
                    router.push('/unauthorized');
                    return;
                }
            }
        }
    }, [user, profile, loading, requiredRole, router, redirectTo]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show nothing while redirecting
    if (!user || (requiredRole && profile?.role !== requiredRole)) {
        return null;
    }

    return <>{children}</>;
}

export default ProtectedRoute;