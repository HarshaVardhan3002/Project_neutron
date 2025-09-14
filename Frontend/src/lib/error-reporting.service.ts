/**
 * @fileoverview Error reporting service integration
 * Provides integration with external error reporting services like Sentry, LogRocket, etc.
 */

import { ErrorReport, ErrorType, ErrorSeverity } from './error-handler.service';

export interface ErrorReportingConfig {
    enabled: boolean;
    service: 'sentry' | 'logrocket' | 'bugsnag' | 'custom';
    apiKey?: string;
    projectId?: string;
    environment: string;
    userId?: string;
    userEmail?: string;
    release?: string;
    customEndpoint?: string;
}

export interface ErrorReportingService {
    initialize(config: ErrorReportingConfig): Promise<void>;
    reportError(report: ErrorReport): Promise<void>;
    setUser(userId: string, email?: string, metadata?: Record<string, any>): void;
    addBreadcrumb(message: string, category?: string, level?: string): void;
    setContext(key: string, context: Record<string, any>): void;
    captureMessage(message: string, level?: string): void;
}

class SentryService implements ErrorReportingService {
    private initialized = false;

    async initialize(config: ErrorReportingConfig): Promise<void> {
        if (!config.apiKey) {
            console.warn('Sentry API key not provided');
            return;
        }

        try {
            // In a real implementation, you would import and initialize Sentry
            // const Sentry = await import('@sentry/nextjs');
            // Sentry.init({
            //     dsn: config.apiKey,
            //     environment: config.environment,
            //     release: config.release,
            //     tracesSampleRate: 1.0,
            // });
            
            this.initialized = true;
            console.log('Sentry initialized');
        } catch (error) {
            console.error('Failed to initialize Sentry:', error);
        }
    }

    async reportError(report: ErrorReport): Promise<void> {
        if (!this.initialized) return;

        try {
            // In a real implementation:
            // Sentry.withScope((scope) => {
            //     scope.setTag('errorType', report.type);
            //     scope.setLevel(this.mapSeverityToSentryLevel(report.severity));
            //     scope.setContext('errorReport', {
            //         id: report.id,
            //         timestamp: report.timestamp,
            //         context: report.context
            //     });
            //     Sentry.captureException(new Error(report.message));
            // });

            console.log('Would report to Sentry:', report);
        } catch (error) {
            console.error('Failed to report error to Sentry:', error);
        }
    }

    setUser(userId: string, email?: string, metadata?: Record<string, any>): void {
        if (!this.initialized) return;

        // Sentry.setUser({
        //     id: userId,
        //     email,
        //     ...metadata
        // });
        
        console.log('Would set Sentry user:', { userId, email, metadata });
    }

    addBreadcrumb(message: string, category = 'default', level = 'info'): void {
        if (!this.initialized) return;

        // Sentry.addBreadcrumb({
        //     message,
        //     category,
        //     level: level as any,
        //     timestamp: Date.now() / 1000
        // });
        
        console.log('Would add Sentry breadcrumb:', { message, category, level });
    }

    setContext(key: string, context: Record<string, any>): void {
        if (!this.initialized) return;

        // Sentry.setContext(key, context);
        
        console.log('Would set Sentry context:', { key, context });
    }

    captureMessage(message: string, level = 'info'): void {
        if (!this.initialized) return;

        // Sentry.captureMessage(message, level as any);
        
        console.log('Would capture Sentry message:', { message, level });
    }

    private mapSeverityToSentryLevel(severity: ErrorSeverity): string {
        switch (severity) {
            case 'low': return 'info';
            case 'medium': return 'warning';
            case 'high': return 'error';
            case 'critical': return 'fatal';
            default: return 'error';
        }
    }
}

class LogRocketService implements ErrorReportingService {
    private initialized = false;

    async initialize(config: ErrorReportingConfig): Promise<void> {
        if (!config.apiKey) {
            console.warn('LogRocket API key not provided');
            return;
        }

        try {
            // In a real implementation:
            // const LogRocket = await import('logrocket');
            // LogRocket.init(config.apiKey);
            
            this.initialized = true;
            console.log('LogRocket initialized');
        } catch (error) {
            console.error('Failed to initialize LogRocket:', error);
        }
    }

    async reportError(report: ErrorReport): Promise<void> {
        if (!this.initialized) return;

        try {
            // LogRocket.captureException(new Error(report.message));
            
            console.log('Would report to LogRocket:', report);
        } catch (error) {
            console.error('Failed to report error to LogRocket:', error);
        }
    }

    setUser(userId: string, email?: string, metadata?: Record<string, any>): void {
        if (!this.initialized) return;

        // LogRocket.identify(userId, {
        //     email,
        //     ...metadata
        // });
        
        console.log('Would set LogRocket user:', { userId, email, metadata });
    }

    addBreadcrumb(message: string, category = 'default', level = 'info'): void {
        // LogRocket doesn't have explicit breadcrumbs, but we can log events
        console.log('Would add LogRocket event:', { message, category, level });
    }

    setContext(key: string, context: Record<string, any>): void {
        // LogRocket.getSessionURL((sessionURL) => {
        //     console.log('LogRocket session:', sessionURL);
        // });
        
        console.log('Would set LogRocket context:', { key, context });
    }

    captureMessage(message: string, level = 'info'): void {
        console.log('Would capture LogRocket message:', { message, level });
    }
}

class CustomService implements ErrorReportingService {
    private config: ErrorReportingConfig | null = null;

    async initialize(config: ErrorReportingConfig): Promise<void> {
        this.config = config;
        console.log('Custom error reporting service initialized');
    }

    async reportError(report: ErrorReport): Promise<void> {
        if (!this.config?.customEndpoint) return;

        try {
            await fetch(this.config.customEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    ...report,
                    environment: this.config.environment,
                    userId: this.config.userId,
                    userEmail: this.config.userEmail
                })
            });
        } catch (error) {
            console.error('Failed to report error to custom service:', error);
        }
    }

    setUser(userId: string, email?: string, metadata?: Record<string, any>): void {
        if (this.config) {
            this.config.userId = userId;
            this.config.userEmail = email;
        }
    }

    addBreadcrumb(message: string, category = 'default', level = 'info'): void {
        console.log('Custom breadcrumb:', { message, category, level });
    }

    setContext(key: string, context: Record<string, any>): void {
        console.log('Custom context:', { key, context });
    }

    captureMessage(message: string, level = 'info'): void {
        console.log('Custom message:', { message, level });
    }
}

class ErrorReportingManager {
    private service: ErrorReportingService | null = null;
    private config: ErrorReportingConfig | null = null;

    async initialize(config: ErrorReportingConfig): Promise<void> {
        this.config = config;

        if (!config.enabled) {
            console.log('Error reporting disabled');
            return;
        }

        switch (config.service) {
            case 'sentry':
                this.service = new SentryService();
                break;
            case 'logrocket':
                this.service = new LogRocketService();
                break;
            case 'custom':
                this.service = new CustomService();
                break;
            default:
                console.warn(`Unknown error reporting service: ${config.service}`);
                return;
        }

        await this.service.initialize(config);
    }

    async reportError(report: ErrorReport): Promise<void> {
        if (!this.service || !this.config?.enabled) return;

        // Add additional context
        this.service.setContext('errorReport', {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });

        await this.service.reportError(report);
    }

    setUser(userId: string, email?: string, metadata?: Record<string, any>): void {
        if (!this.service || !this.config?.enabled) return;
        this.service.setUser(userId, email, metadata);
    }

    addBreadcrumb(message: string, category?: string, level?: string): void {
        if (!this.service || !this.config?.enabled) return;
        this.service.addBreadcrumb(message, category, level);
    }

    setContext(key: string, context: Record<string, any>): void {
        if (!this.service || !this.config?.enabled) return;
        this.service.setContext(key, context);
    }

    captureMessage(message: string, level?: string): void {
        if (!this.service || !this.config?.enabled) return;
        this.service.captureMessage(message, level);
    }

    isEnabled(): boolean {
        return this.config?.enabled ?? false;
    }
}

// Global error reporting manager instance
export const errorReporting = new ErrorReportingManager();

// Initialize error reporting based on environment variables
if (typeof window !== 'undefined') {
    const config: ErrorReportingConfig = {
        enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_ERROR_REPORTING_ENABLED,
        service: (process.env.NEXT_PUBLIC_ERROR_REPORTING_SERVICE as any) || 'sentry',
        apiKey: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.NEXT_PUBLIC_ERROR_REPORTING_API_KEY,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.NEXT_PUBLIC_APP_VERSION,
        customEndpoint: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT
    };

    errorReporting.initialize(config).catch(error => {
        console.error('Failed to initialize error reporting:', error);
    });
}

// Convenience functions
export function reportError(report: ErrorReport) {
    return errorReporting.reportError(report);
}

export function setErrorReportingUser(userId: string, email?: string, metadata?: Record<string, any>) {
    errorReporting.setUser(userId, email, metadata);
}

export function addErrorBreadcrumb(message: string, category?: string, level?: string) {
    errorReporting.addBreadcrumb(message, category, level);
}

export function setErrorContext(key: string, context: Record<string, any>) {
    errorReporting.setContext(key, context);
}

export function captureErrorMessage(message: string, level?: string) {
    errorReporting.captureMessage(message, level);
}