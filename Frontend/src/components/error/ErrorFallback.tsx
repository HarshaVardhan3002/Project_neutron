'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    RefreshCw,
    Home,
    Wifi,
    WifiOff,
    Server,
    Database,
    Shield
} from 'lucide-react';

export interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
    type?: 'network' | 'auth' | 'server' | 'client' | 'permission' | 'generic';
    title?: string;
    description?: string;
    showRetry?: boolean;
    showHome?: boolean;
    actions?: React.ReactNode;
}

const errorTypeConfig = {
    network: {
        icon: WifiOff,
        title: 'Connection Problem',
        description: 'Unable to connect to the server. Please check your internet connection.',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Contact support if the problem persists'
        ]
    },
    auth: {
        icon: Shield,
        title: 'Authentication Error',
        description: 'Your session has expired or you don\'t have permission to access this resource.',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        suggestions: [
            'Try signing in again',
            'Contact an administrator for access',
            'Clear your browser cache and cookies'
        ]
    },
    server: {
        icon: Server,
        title: 'Server Error',
        description: 'The server encountered an error while processing your request.',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        suggestions: [
            'Try again in a few moments',
            'The issue has been reported to our team',
            'Contact support if the problem continues'
        ]
    },
    client: {
        icon: AlertTriangle,
        title: 'Application Error',
        description: 'Something went wrong in the application.',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Try using a different browser'
        ]
    },
    permission: {
        icon: Shield,
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource.',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        suggestions: [
            'Contact an administrator for access',
            'Make sure you\'re signed in with the correct account',
            'Check if your account has the required permissions'
        ]
    },
    generic: {
        icon: AlertTriangle,
        title: 'Something went wrong',
        description: 'An unexpected error occurred.',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        suggestions: [
            'Try refreshing the page',
            'Contact support if the problem persists'
        ]
    }
};

export function ErrorFallback({
    error,
    resetError,
    type = 'generic',
    title,
    description,
    showRetry = true,
    showHome = true,
    actions
}: ErrorFallbackProps) {
    const config = errorTypeConfig[type];
    const Icon = config.icon;

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const displayTitle = title || config.title;
    const displayDescription = description || config.description;

    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className={`mx-auto p-3 rounded-full w-fit ${config.bgColor}`}>
                        <Icon className={`h-8 w-8 ${config.color}`} />
                    </div>
                    <CardTitle className="mt-4">{displayTitle}</CardTitle>
                    <CardDescription>{displayDescription}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Error Message */}
                    {error && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-left">
                                <strong>Error:</strong> {error.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        {actions || (
                            <>
                                {showRetry && resetError && (
                                    <Button onClick={resetError} className="w-full">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Try Again
                                    </Button>
                                )}

                                <Button
                                    onClick={handleRefresh}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Page
                                </Button>

                                {showHome && (
                                    <Button
                                        onClick={handleGoHome}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Home className="h-4 w-4 mr-2" />
                                        Go Home
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Suggestions */}
                    <div className="text-left">
                        <h4 className="text-sm font-medium mb-2">What you can try:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {config.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-xs mt-1">•</span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Specific error fallback components
export function NetworkErrorFallback(props: Omit<ErrorFallbackProps, 'type'>) {
    return <ErrorFallback {...props} type="network" />;
}

export function AuthErrorFallback(props: Omit<ErrorFallbackProps, 'type'>) {
    return <ErrorFallback {...props} type="auth" />;
}

export function ServerErrorFallback(props: Omit<ErrorFallbackProps, 'type'>) {
    return <ErrorFallback {...props} type="server" />;
}

export function PermissionErrorFallback(props: Omit<ErrorFallbackProps, 'type'>) {
    return <ErrorFallback {...props} type="permission" />;
}

// Loading error fallback for lazy-loaded components
export function LazyLoadErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
    return (
        <ErrorFallback
            error={error}
            resetError={retry}
            type="client"
            title="Failed to Load Component"
            description="This component failed to load. This might be due to a network issue or the component being temporarily unavailable."
            showHome={false}
        />
    );
}