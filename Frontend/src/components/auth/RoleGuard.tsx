'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext.context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ('student' | 'instructor' | 'admin' | 'super_admin')[];
    fallback?: React.ReactNode;
    showError?: boolean;
}

export function RoleGuard({
    children,
    allowedRoles,
    fallback,
    showError = true
}: RoleGuardProps) {
    const { profile, loading } = useAuth();

    // Don't render anything while loading
    if (loading) {
        return null;
    }

    // If no profile, don't render
    if (!profile) {
        return null;
    }

    // Check if user's role is in allowed roles
    const hasPermission = allowedRoles.includes(profile.role);

    if (!hasPermission) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (showError) {
            return (
                <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to access this content. Required role: {allowedRoles.join(', ')}
                    </AlertDescription>
                </Alert>
            );
        }

        return null;
    }

    return <>{children}</>;
}

// Convenience hook for checking roles
export function useRole() {
    const { profile } = useAuth();

    const hasRole = (role: 'student' | 'instructor' | 'admin' | 'super_admin') => {
        return profile?.role === role;
    };

    const hasAnyRole = (roles: ('student' | 'instructor' | 'admin' | 'super_admin')[]) => {
        return profile ? roles.includes(profile.role) : false;
    };

    const isAdmin = () => {
        return profile?.role === 'admin' || profile?.role === 'super_admin';
    };

    const isSuperAdmin = () => {
        return profile?.role === 'super_admin';
    };

    const isInstructor = () => {
        return profile?.role === 'instructor' || isAdmin();
    };

    return {
        role: profile?.role,
        hasRole,
        hasAnyRole,
        isAdmin,
        isSuperAdmin,
        isInstructor,
    };
}

export default RoleGuard;