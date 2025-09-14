/**
 * @fileoverview Centralized error handling utilities
 * Provides error classification, reporting, and user-friendly message generation
 */

import { toast } from 'sonner';

export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    url?: string;
    timestamp?: string;
    userAgent?: string;
    additionalData?: Record<string, any>;
}

export interface ErrorReport {
    id: string;
    message: string;
    stack?: string;
    type: ErrorType;
    severity: ErrorSeverity;
    context: ErrorContext;
    timestamp: string;
}

export type ErrorType = 
    | 'network'
    | 'authentication'
    | 'authorization'
    | 'validation'
    | 'server'
    | 'client'
    | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export class AppError extends Error {
    public readonly type: ErrorType;
    public readonly severity: ErrorSeverity;
    public readonly context: ErrorContext;
    public readonly userMessage: string;
    public readonly isRetryable: boolean;

    constructor(
        message: string,
        type: ErrorType = 'unknown',
        severity: ErrorSeverity = 'medium',
        context: ErrorContext = {},
        userMessage?: string,
        isRetryable: boolean = false
    ) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.severity = severity;
        this.context = context;
        this.userMessage = userMessage || this.generateUserMessage();
        this.isRetryable = isRetryable;
    }

    private generateUserMessage(): string {
        switch (this.type) {
            case 'network':
                return 'Connection problem. Please check your internet connection and try again.';
            case 'authentication':
                return 'Please sign in to continue.';
            case 'authorization':
                return 'You don\'t have permission to perform this action.';
            case 'validation':
                return 'Please check your input and try again.';
            case 'server':
                return 'Server error. Please try again later.';
            case 'client':
                return 'Something went wrong. Please refresh the page.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    }
}

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorReports: ErrorReport[] = [];
    private maxReports = 100;

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Classify error based on error message and properties
     */
    public classifyError(error: Error): { type: ErrorType; severity: ErrorSeverity } {
        const message = error.message.toLowerCase();
        const stack = error.stack?.toLowerCase() || '';

        // Network errors
        if (
            message.includes('fetch') ||
            message.includes('network') ||
            message.includes('connection') ||
            message.includes('timeout') ||
            message.includes('cors') ||
            stack.includes('fetch')
        ) {
            return { type: 'network', severity: 'medium' };
        }

        // Authentication errors
        if (
            message.includes('unauthorized') ||
            message.includes('401') ||
            message.includes('authentication') ||
            message.includes('token') ||
            message.includes('session')
        ) {
            return { type: 'authentication', severity: 'high' };
        }

        // Authorization errors
        if (
            message.includes('forbidden') ||
            message.includes('403') ||
            message.includes('permission') ||
            message.includes('access denied')
        ) {
            return { type: 'authorization', severity: 'high' };
        }

        // Validation errors
        if (
            message.includes('validation') ||
            message.includes('invalid') ||
            message.includes('required') ||
            message.includes('400') ||
            message.includes('bad request')
        ) {
            return { type: 'validation', severity: 'low' };
        }

        // Server errors
        if (
            message.includes('500') ||
            message.includes('502') ||
            message.includes('503') ||
            message.includes('504') ||
            message.includes('server error') ||
            message.includes('internal server')
        ) {
            return { type: 'server', severity: 'high' };
        }

        // Client-side errors
        if (
            message.includes('chunk') ||
            message.includes('loading') ||
            message.includes('module') ||
            stack.includes('chunk')
        ) {
            return { type: 'client', severity: 'medium' };
        }

        // Critical errors (potential security or data integrity issues)
        if (
            message.includes('security') ||
            message.includes('xss') ||
            message.includes('injection') ||
            message.includes('csrf')
        ) {
            return { type: 'client', severity: 'critical' };
        }

        return { type: 'unknown', severity: 'medium' };
    }

    /**
     * Handle error with appropriate user feedback and logging
     */
    public handleError(
        error: Error | AppError,
        context: ErrorContext = {},
        showToast: boolean = true
    ): ErrorReport {
        let appError: AppError;

        if (error instanceof AppError) {
            appError = error;
        } else {
            const { type, severity } = this.classifyError(error);
            appError = new AppError(
                error.message,
                type,
                severity,
                context,
                undefined,
                type === 'network' || type === 'server'
            );
        }

        const report = this.createErrorReport(appError, context);
        this.storeErrorReport(report);

        // Show user-friendly toast notification
        if (showToast) {
            this.showErrorToast(appError);
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group(`🚨 Error [${appError.type}] - ${appError.severity}`);
            console.error('Original Error:', error);
            console.error('App Error:', appError);
            console.error('Context:', context);
            console.error('Report:', report);
            console.groupEnd();
        }

        // Send to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            this.reportToService(report);
        }

        return report;
    }

    /**
     * Create structured error report
     */
    private createErrorReport(error: AppError, context: ErrorContext): ErrorReport {
        return {
            id: this.generateErrorId(),
            message: error.message,
            stack: error.stack,
            type: error.type,
            severity: error.severity,
            context: {
                ...context,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Store error report locally
     */
    private storeErrorReport(report: ErrorReport): void {
        this.errorReports.unshift(report);
        
        // Keep only the most recent reports
        if (this.errorReports.length > this.maxReports) {
            this.errorReports = this.errorReports.slice(0, this.maxReports);
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('error_reports', JSON.stringify(this.errorReports.slice(0, 10)));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Show appropriate toast notification
     */
    private showErrorToast(error: AppError): void {
        const toastOptions = {
            duration: this.getToastDuration(error.severity),
            action: error.isRetryable ? {
                label: 'Retry',
                onClick: () => window.location.reload()
            } : undefined
        };

        switch (error.severity) {
            case 'low':
                toast.warning(error.userMessage, toastOptions);
                break;
            case 'medium':
                toast.error(error.userMessage, toastOptions);
                break;
            case 'high':
            case 'critical':
                toast.error(error.userMessage, {
                    ...toastOptions,
                    duration: 10000 // Longer duration for critical errors
                });
                break;
        }
    }

    /**
     * Get toast duration based on severity
     */
    private getToastDuration(severity: ErrorSeverity): number {
        switch (severity) {
            case 'low': return 3000;
            case 'medium': return 5000;
            case 'high': return 7000;
            case 'critical': return 10000;
            default: return 5000;
        }
    }

    /**
     * Generate unique error ID
     */
    private generateErrorId(): string {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Send error report to external service
     */
    private async reportToService(report: ErrorReport): Promise<void> {
        try {
            // TODO: Implement actual error reporting service integration
            // Examples: Sentry, LogRocket, Bugsnag, etc.
            
            // For now, just log that we would send it
            console.log('Would send error report to service:', report);
            
            // Example implementation:
            // await fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(report)
            // });
        } catch (e) {
            // Silently fail - don't create more errors when reporting errors
            console.warn('Failed to report error to service:', e);
        }
    }

    /**
     * Get recent error reports
     */
    public getRecentErrors(limit: number = 10): ErrorReport[] {
        return this.errorReports.slice(0, limit);
    }

    /**
     * Clear error reports
     */
    public clearErrors(): void {
        this.errorReports = [];
        try {
            localStorage.removeItem('error_reports');
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Get error statistics
     */
    public getErrorStats(): {
        total: number;
        byType: Record<ErrorType, number>;
        bySeverity: Record<ErrorSeverity, number>;
    } {
        const stats = {
            total: this.errorReports.length,
            byType: {} as Record<ErrorType, number>,
            bySeverity: {} as Record<ErrorSeverity, number>
        };

        this.errorReports.forEach(report => {
            stats.byType[report.type] = (stats.byType[report.type] || 0) + 1;
            stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1;
        });

        return stats;
    }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export function handleError(error: Error | AppError, context?: ErrorContext, showToast?: boolean) {
    return errorHandler.handleError(error, context, showToast);
}

export function createAppError(
    message: string,
    type?: ErrorType,
    severity?: ErrorSeverity,
    context?: ErrorContext,
    userMessage?: string,
    isRetryable?: boolean
) {
    return new AppError(message, type, severity, context, userMessage, isRetryable);
}

// Global error event listeners
if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        handleError(error, { component: 'global', action: 'unhandled_promise_rejection' });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
        const error = event.error || new Error(event.message);
        handleError(error, { 
            component: 'global', 
            action: 'global_error',
            additionalData: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            }
        });
    });
}