/**
 * @fileoverview React hooks for error handling
 * Provides hooks for error handling, retry logic, and error state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { errorHandler, AppError, ErrorContext, ErrorType, ErrorSeverity } from '@/lib/error-handler.service';

export interface UseErrorHandlerOptions {
    maxRetries?: number;
    retryDelay?: number;
    showToast?: boolean;
    context?: ErrorContext;
}

export interface ErrorState {
    error: Error | null;
    isError: boolean;
    retryCount: number;
    canRetry: boolean;
}

/**
 * Hook for handling errors with retry logic
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        showToast = true,
        context = {}
    } = options;

    const [errorState, setErrorState] = useState<ErrorState>({
        error: null,
        isError: false,
        retryCount: 0,
        canRetry: false
    });

    const retryTimeoutRef = useRef<NodeJS.Timeout>();

    const handleError = useCallback((error: Error | AppError, customContext?: ErrorContext) => {
        const mergedContext = { ...context, ...customContext };
        const report = errorHandler.handleError(error, mergedContext, showToast);
        
        const appError = error instanceof AppError ? error : new AppError(error.message);
        
        setErrorState(prev => ({
            error: appError,
            isError: true,
            retryCount: prev.retryCount,
            canRetry: appError.isRetryable && prev.retryCount < maxRetries
        }));

        return report;
    }, [context, showToast, maxRetries]);

    const retry = useCallback((fn?: () => void | Promise<void>) => {
        if (errorState.retryCount >= maxRetries) {
            return;
        }

        setErrorState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1,
            isError: false,
            error: null
        }));

        if (fn) {
            // Delay retry to avoid immediate re-execution
            retryTimeoutRef.current = setTimeout(() => {
                try {
                    const result = fn();
                    if (result instanceof Promise) {
                        result.catch(error => handleError(error));
                    }
                } catch (error) {
                    handleError(error as Error);
                }
            }, retryDelay);
        }
    }, [errorState.retryCount, maxRetries, retryDelay, handleError]);

    const clearError = useCallback(() => {
        setErrorState({
            error: null,
            isError: false,
            retryCount: 0,
            canRetry: false
        });
    }, []);

    const resetRetries = useCallback(() => {
        setErrorState(prev => ({
            ...prev,
            retryCount: 0,
            canRetry: prev.error instanceof AppError ? prev.error.isRetryable : false
        }));
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    return {
        ...errorState,
        handleError,
        retry,
        clearError,
        resetRetries
    };
}

/**
 * Hook for async operations with error handling
 */
export function useAsyncError<T = any>(options: UseErrorHandlerOptions = {}) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<T | null>(null);
    const errorHandler = useErrorHandler(options);

    const execute = useCallback(async (
        asyncFn: () => Promise<T>,
        customContext?: ErrorContext
    ): Promise<T | null> => {
        setLoading(true);
        errorHandler.clearError();

        try {
            const result = await asyncFn();
            setData(result);
            return result;
        } catch (error) {
            errorHandler.handleError(error as Error, customContext);
            return null;
        } finally {
            setLoading(false);
        }
    }, [errorHandler]);

    const retry = useCallback(() => {
        errorHandler.retry();
    }, [errorHandler]);

    return {
        loading,
        data,
        error: errorHandler.error,
        isError: errorHandler.isError,
        canRetry: errorHandler.canRetry,
        retryCount: errorHandler.retryCount,
        execute,
        retry,
        clearError: errorHandler.clearError
    };
}

/**
 * Hook for form validation errors
 */
export function useFormErrors<T extends Record<string, any>>() {
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const clearFieldError = useCallback((field: keyof T) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
        setFieldErrors(errors);
    }, []);

    const clearAllErrors = useCallback(() => {
        setFieldErrors({});
        setGeneralError(null);
    }, []);

    const hasErrors = Object.keys(fieldErrors).length > 0 || generalError !== null;

    const handleValidationError = useCallback((error: Error) => {
        // Try to parse validation errors from API response
        try {
            const errorData = JSON.parse(error.message);
            if (errorData.fieldErrors) {
                setFieldErrors(errorData.fieldErrors);
            }
            if (errorData.message) {
                setGeneralError(errorData.message);
            }
        } catch {
            // If not a structured validation error, set as general error
            setGeneralError(error.message);
        }
    }, []);

    return {
        fieldErrors,
        generalError,
        hasErrors,
        setFieldError,
        clearFieldError,
        setErrors,
        setGeneralError,
        clearAllErrors,
        handleValidationError
    };
}

/**
 * Hook for API call error handling with automatic retry
 */
export function useApiCall<T = any>(options: UseErrorHandlerOptions & {
    retryOn?: ErrorType[];
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
} = {}) {
    const {
        retryOn = ['network', 'server'],
        onSuccess,
        onError,
        ...errorOptions
    } = options;

    const [state, setState] = useState<{
        loading: boolean;
        data: T | null;
        error: Error | null;
    }>({
        loading: false,
        data: null,
        error: null
    });

    const errorHandler = useErrorHandler(errorOptions);

    const call = useCallback(async (
        apiCall: () => Promise<T>,
        customContext?: ErrorContext
    ): Promise<T | null> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await apiCall();
            setState(prev => ({ ...prev, data: result, loading: false }));
            onSuccess?.(result);
            return result;
        } catch (error) {
            const appError = error instanceof AppError ? error : new AppError((error as Error).message);
            
            setState(prev => ({ ...prev, error: appError, loading: false }));
            errorHandler.handleError(appError, customContext);
            onError?.(appError);

            // Auto-retry for certain error types
            if (retryOn.includes(appError.type) && errorHandler.canRetry) {
                setTimeout(() => {
                    call(apiCall, customContext);
                }, 2000);
            }

            return null;
        }
    }, [errorHandler, onSuccess, onError, retryOn]);

    const retry = useCallback((apiCall: () => Promise<T>, customContext?: ErrorContext) => {
        errorHandler.retry(() => call(apiCall, customContext));
    }, [errorHandler, call]);

    return {
        ...state,
        loading: state.loading,
        call,
        retry,
        clearError: errorHandler.clearError,
        canRetry: errorHandler.canRetry,
        retryCount: errorHandler.retryCount
    };
}

/**
 * Hook for handling network connectivity errors
 */
export function useNetworkError() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const errorHandler = useErrorHandler({
        context: { component: 'network' }
    });

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            errorHandler.clearError();
        };

        const handleOffline = () => {
            setIsOnline(false);
            errorHandler.handleError(
                new AppError(
                    'Network connection lost',
                    'network',
                    'high',
                    { action: 'connection_lost' },
                    'You appear to be offline. Please check your internet connection.',
                    true
                )
            );
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [errorHandler]);

    return {
        isOnline,
        isOffline: !isOnline,
        networkError: errorHandler.error,
        clearNetworkError: errorHandler.clearError
    };
}