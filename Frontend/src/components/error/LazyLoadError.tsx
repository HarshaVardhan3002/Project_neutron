'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, AlertTriangle, Wifi } from 'lucide-react';

interface LazyLoadErrorProps {
    error: Error;
    retry: () => void;
    isRetrying?: boolean;
    componentName?: string;
}

export function LazyLoadError({
    error,
    retry,
    isRetrying = false,
    componentName = 'Component'
}: LazyLoadErrorProps) {
    const isChunkError = error.message.includes('chunk') || error.message.includes('Loading');
    const isNetworkError = error.message.includes('fetch') || error.message.includes('network');

    const getErrorIcon = () => {
        if (isNetworkError) return Wifi;
        return AlertTriangle;
    };

    const getErrorTitle = () => {
        if (isChunkError) return 'Failed to Load Component';
        if (isNetworkError) return 'Network Error';
        return 'Loading Error';
    };

    const getErrorDescription = () => {
        if (isChunkError) {
            return `The ${componentName} failed to load. This might be due to a network issue or the component being temporarily unavailable.`;
        }
        if (isNetworkError) {
            return 'Unable to load the component due to a network connection issue.';
        }
        return `An error occurred while loading the ${componentName}.`;
    };

    const getSuggestions = () => {
        if (isChunkError) {
            return [
                'Try refreshing the page',
                'Check your internet connection',
                'Clear your browser cache'
            ];
        }
        if (isNetworkError) {
            return [
                'Check your internet connection',
                'Try again in a few moments',
                'Refresh the page if the problem persists'
            ];
        }
        return [
            'Try loading the component again',
            'Refresh the page if the problem continues'
        ];
    };

    const Icon = getErrorIcon();

    return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit">
                        <Icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">{getErrorTitle()}</CardTitle>
                    <CardDescription>
                        {getErrorDescription()}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Error Message */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-left text-sm">
                            <strong>Error:</strong> {error.message}
                        </AlertDescription>
                    </Alert>

                    {/* Retry Button */}
                    <Button
                        onClick={retry}
                        disabled={isRetrying}
                        className="w-full"
                    >
                        {isRetrying ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </>
                        )}
                    </Button>

                    {/* Suggestions */}
                    <div className="text-left">
                        <h4 className="text-sm font-medium mb-2">What you can try:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {getSuggestions().map((suggestion, index) => (
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

/**
 * Higher-order component to wrap lazy-loaded components with error handling
 */
export function withLazyErrorBoundary<P extends object>(
    LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
    componentName?: string
) {
    return React.forwardRef<any, P>((props, ref) => {
        const [error, setError] = React.useState<Error | null>(null);
        const [retryCount, setRetryCount] = React.useState(0);
        const [isRetrying, setIsRetrying] = React.useState(false);

        const retry = React.useCallback(() => {
            setIsRetrying(true);
            setError(null);
            setRetryCount(prev => prev + 1);

            // Small delay to show loading state
            setTimeout(() => {
                setIsRetrying(false);
            }, 500);
        }, []);

        if (error) {
            return (
                <LazyLoadError
                    error={error}
                    retry={retry}
                    isRetrying={isRetrying}
                    componentName={componentName}
                />
            );
        }

        return (
            <React.Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[200px]">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading {componentName || 'component'}...</span>
                        </div>
                    </div>
                }
            >
                <ErrorBoundaryWrapper
                    onError={setError}
                    retryKey={retryCount}
                >
                    <LazyComponent {...props} ref={ref} />
                </ErrorBoundaryWrapper>
            </React.Suspense>
        );
    });
}

/**
 * Internal error boundary wrapper for lazy components
 */
class ErrorBoundaryWrapper extends React.Component<{
    children: React.ReactNode;
    onError: (error: Error) => void;
    retryKey: number;
}, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        this.props.onError(error);
    }

    componentDidUpdate(prevProps: any) {
        // Reset error state when retry key changes
        if (prevProps.retryKey !== this.props.retryKey && this.state.hasError) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return null; // Error will be handled by parent component
        }

        return this.props.children;
    }
}