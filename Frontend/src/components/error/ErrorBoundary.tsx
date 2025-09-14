'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    RefreshCw,
    Home,
    Bug,
    ChevronDown,
    ChevronUp,
    Copy,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
    level?: 'page' | 'component' | 'global';
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
    copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    private retryCount = 0;
    private maxRetries = 3;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            copied: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 Error Boundary Caught Error');
            console.error('Error:', error);
            console.error('Error Info:', errorInfo);
            console.error('Component Stack:', errorInfo.componentStack);
            console.groupEnd();
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // In production, you would send this to an error reporting service
        this.reportError(error, errorInfo);
    }

    private reportError = (error: Error, errorInfo: ErrorInfo) => {
        // This would typically send to an error reporting service like Sentry
        const errorReport = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            level: this.props.level || 'component'
        };

        // For now, just log to console
        console.error('Error Report:', errorReport);

        // TODO: Send to error reporting service
        // errorReportingService.captureException(error, errorReport);
    };

    private handleRetry = () => {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                showDetails: false
            });
            toast.info(`Retrying... (${this.retryCount}/${this.maxRetries})`);
        } else {
            toast.error('Maximum retry attempts reached. Please refresh the page.');
        }
    };

    private handleRefresh = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    private toggleDetails = () => {
        this.setState(prev => ({ showDetails: !prev.showDetails }));
    };

    private copyErrorDetails = async () => {
        const { error, errorInfo } = this.state;
        const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
        `.trim();

        try {
            await navigator.clipboard.writeText(errorText);
            this.setState({ copied: true });
            toast.success('Error details copied to clipboard');
            setTimeout(() => this.setState({ copied: false }), 2000);
        } catch (err) {
            toast.error('Failed to copy error details');
        }
    };

    private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch')) {
            return 'medium';
        }
        if (message.includes('chunk') || message.includes('loading')) {
            return 'low';
        }
        if (message.includes('auth') || message.includes('permission')) {
            return 'high';
        }
        return 'critical';
    };

    private getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'bg-yellow-100 text-yellow-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'high': return 'bg-red-100 text-red-800';
            case 'critical': return 'bg-red-200 text-red-900';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    render() {
        if (this.state.hasError) {
            const { error, errorInfo, showDetails, copied } = this.state;
            const { fallback, level = 'component' } = this.props;

            if (fallback) {
                return fallback;
            }

            const severity = error ? this.getErrorSeverity(error) : 'critical';
            const isComponentLevel = level === 'component';

            return (
                <div className={`flex items-center justify-center ${isComponentLevel ? 'h-full min-h-[200px]' : 'min-h-screen'} p-4`}>
                    <Card className={`w-full ${isComponentLevel ? 'max-w-md' : 'max-w-2xl'} border-destructive/20`}>
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="flex items-center justify-center gap-2">
                                Something went wrong
                                <Badge className={this.getSeverityColor(severity)}>
                                    {severity.toUpperCase()}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {isComponentLevel
                                    ? 'This component encountered an error and cannot be displayed.'
                                    : 'An unexpected error occurred. We apologize for the inconvenience.'
                                }
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Error Message */}
                            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                                <p className="text-sm font-medium text-destructive">
                                    {error?.message || 'Unknown error occurred'}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                {this.retryCount < this.maxRetries && (
                                    <Button
                                        onClick={this.handleRetry}
                                        className="flex-1"
                                        variant="default"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Try Again ({this.maxRetries - this.retryCount} left)
                                    </Button>
                                )}

                                {!isComponentLevel && (
                                    <>
                                        <Button
                                            onClick={this.handleRefresh}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Refresh Page
                                        </Button>

                                        <Button
                                            onClick={this.handleGoHome}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <Home className="h-4 w-4 mr-2" />
                                            Go Home
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Error Details Toggle */}
                            <div className="border-t pt-4">
                                <Button
                                    onClick={this.toggleDetails}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <Bug className="h-4 w-4" />
                                        Technical Details
                                    </span>
                                    {showDetails ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>

                                {showDetails && (
                                    <div className="mt-3 space-y-3">
                                        <div className="bg-muted rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Error Stack
                                                </span>
                                                <Button
                                                    onClick={this.copyErrorDetails}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2"
                                                >
                                                    {copied ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                            <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                                                {error?.stack || 'No stack trace available'}
                                            </pre>
                                        </div>

                                        {errorInfo?.componentStack && (
                                            <div className="bg-muted rounded-lg p-3">
                                                <span className="text-xs font-medium text-muted-foreground block mb-2">
                                                    Component Stack
                                                </span>
                                                <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                                                    {errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p><strong>URL:</strong> {window.location.href}</p>
                                            <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                                            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorHandler() {
    const reportError = (error: Error, context?: any) => {
        console.error('Manual error report:', error, context);

        // In production, send to error reporting service
        toast.error(error.message || 'An error occurred');
    };

    return { reportError };
}