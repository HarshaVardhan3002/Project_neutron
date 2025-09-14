'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    XCircle,
    Info,
    CheckCircle,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils.helper';

interface FormErrorDisplayProps {
    errors: Record<string, string | string[]>;
    className?: string;
    showFieldNames?: boolean;
    maxErrors?: number;
    onDismiss?: (field: string) => void;
}

export function FormErrorDisplay({
    errors,
    className,
    showFieldNames = true,
    maxErrors = 5,
    onDismiss
}: FormErrorDisplayProps) {
    const errorEntries = Object.entries(errors).slice(0, maxErrors);

    if (errorEntries.length === 0) {
        return null;
    }

    const formatFieldName = (field: string) => {
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    const getErrorMessages = (error: string | string[]) => {
        return Array.isArray(error) ? error : [error];
    };

    return (
        <div className={cn("space-y-2", className)}>
            {errorEntries.map(([field, error]) => {
                const messages = getErrorMessages(error);
                return (
                    <Alert key={field} variant="destructive" className="relative">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {showFieldNames && (
                                        <span className="font-medium">
                                            {formatFieldName(field)}:
                                        </span>
                                    )}
                                    <div className="mt-1">
                                        {messages.map((message, index) => (
                                            <div key={index} className="text-sm">
                                                {message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {onDismiss && (
                                    <button
                                        onClick={() => onDismiss(field)}
                                        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
                                        aria-label={`Dismiss ${field} error`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                );
            })}

            {Object.keys(errors).length > maxErrors && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        And {Object.keys(errors).length - maxErrors} more error(s)...
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

interface FieldErrorProps {
    error?: string | string[];
    className?: string;
    showIcon?: boolean;
}

export function FieldError({ error, className, showIcon = true }: FieldErrorProps) {
    if (!error) return null;

    const messages = Array.isArray(error) ? error : [error];

    return (
        <div className={cn("text-sm text-destructive mt-1", className)}>
            {messages.map((message, index) => (
                <div key={index} className="flex items-center gap-1">
                    {showIcon && <XCircle className="h-3 w-3 flex-shrink-0" />}
                    <span>{message}</span>
                </div>
            ))}
        </div>
    );
}

interface ValidationSummaryProps {
    errors: Record<string, string | string[]>;
    warnings?: Record<string, string | string[]>;
    successes?: Record<string, string | string[]>;
    className?: string;
    title?: string;
    collapsible?: boolean;
}

export function ValidationSummary({
    errors,
    warnings = {},
    successes = {},
    className,
    title = "Form Validation",
    collapsible = false
}: ValidationSummaryProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(collapsible);

    const errorCount = Object.keys(errors).length;
    const warningCount = Object.keys(warnings).length;
    const successCount = Object.keys(successes).length;

    const totalIssues = errorCount + warningCount;

    if (totalIssues === 0 && successCount === 0) {
        return null;
    }

    const formatFieldName = (field: string) => {
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    return (
        <div className={cn("border rounded-lg", className)}>
            <div
                className={cn(
                    "p-4 flex items-center justify-between",
                    collapsible && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {errorCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {errorCount} Error{errorCount !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {warningCount > 0 && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {successCount > 0 && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {successCount} Success{successCount !== 1 ? 'es' : ''}
                            </Badge>
                        )}
                    </div>
                    <span className="font-medium">{title}</span>
                </div>

                {collapsible && (
                    <button className="text-muted-foreground hover:text-foreground">
                        {isCollapsed ? '▼' : '▲'}
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <div className="border-t p-4 space-y-3">
                    {/* Errors */}
                    {errorCount > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Errors
                            </h4>
                            <ul className="space-y-1 text-sm">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field} className="text-destructive">
                                        <strong>{formatFieldName(field)}:</strong>{' '}
                                        {Array.isArray(error) ? error.join(', ') : error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {warningCount > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Warnings
                            </h4>
                            <ul className="space-y-1 text-sm">
                                {Object.entries(warnings).map(([field, warning]) => (
                                    <li key={field} className="text-yellow-700">
                                        <strong>{formatFieldName(field)}:</strong>{' '}
                                        {Array.isArray(warning) ? warning.join(', ') : warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Successes */}
                    {successCount > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Valid Fields
                            </h4>
                            <ul className="space-y-1 text-sm">
                                {Object.entries(successes).map(([field, success]) => (
                                    <li key={field} className="text-green-700">
                                        <strong>{formatFieldName(field)}:</strong>{' '}
                                        {Array.isArray(success) ? success.join(', ') : success}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface ErrorToastProps {
    error: string;
    onDismiss?: () => void;
    duration?: number;
}

export function ErrorToast({ error, onDismiss, duration = 5000 }: ErrorToastProps) {
    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onDismiss?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onDismiss]);

    return (
        <Alert variant="destructive" className="fixed top-4 right-4 w-auto max-w-md z-50 shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
                        aria-label="Dismiss error"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </AlertDescription>
        </Alert>
    );
}