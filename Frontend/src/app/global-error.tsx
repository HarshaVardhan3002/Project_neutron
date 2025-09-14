'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * Global error boundary for the entire Next.js application
 * This catches errors that occur outside of the normal React component tree
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console and error reporting service
        console.error('Global Error:', error);

        // In production, send to error reporting service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to error reporting service
            // errorReportingService.captureException(error, {
            //   tags: { boundary: 'global' },
            //   extra: { digest: error.digest }
            // });
        }
    }, [error]);

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="w-full max-w-lg text-center border-destructive/20">
                        <CardHeader>
                            <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
                                <AlertTriangle className="h-12 w-12 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl">Application Error</CardTitle>
                            <CardDescription className="text-base">
                                A critical error occurred that prevented the application from loading properly.
                                We apologize for the inconvenience.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Error Details */}
                            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bug className="h-4 w-4 text-destructive" />
                                    <span className="font-medium text-sm">Error Details</span>
                                </div>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Error ID: {error.digest}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button onClick={reset} className="w-full" size="lg">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button onClick={handleRefresh} variant="outline">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh Page
                                    </Button>

                                    <Button onClick={handleGoHome} variant="outline">
                                        <Home className="h-4 w-4 mr-2" />
                                        Go Home
                                    </Button>
                                </div>
                            </div>

                            {/* Help Text */}
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p className="font-medium">What you can try:</p>
                                <ul className="text-left space-y-1">
                                    <li>• Refresh the page or try again</li>
                                    <li>• Clear your browser cache and cookies</li>
                                    <li>• Try using a different browser</li>
                                    <li>• Check your internet connection</li>
                                    <li>• Contact support if the problem persists</li>
                                </ul>
                            </div>

                            {/* Contact Information */}
                            <div className="border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    If this problem continues, please contact our support team with the error ID above.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </body>
        </html>
    );
}