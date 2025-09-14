/**
 * Global Error Handler Middleware for Project_Neutron LMS
 */

const { Prisma } = require('../../generated/prisma');

/**
 * Global error handling middleware
 */
function errorHandler(error, req, res, next) {
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({
                    error: 'Duplicate entry',
                    message: 'A record with this information already exists',
                    field: error.meta?.target
                });
            case 'P2025':
                return res.status(404).json({
                    error: 'Record not found',
                    message: 'The requested record does not exist'
                });
            case 'P2003':
                return res.status(400).json({
                    error: 'Foreign key constraint failed',
                    message: 'Referenced record does not exist'
                });
            default:
                return res.status(400).json({
                    error: 'Database error',
                    message: 'A database error occurred'
                });
        }
    }

    // Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Invalid data provided'
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            message: 'The provided token is malformed'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'The provided token has expired'
        });
    }

    // Validation errors (from Zod or similar)
    if (error.name === 'ZodError') {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Invalid input data',
            details: error.errors
        });
    }

    // Multer errors (file upload)
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            error: 'File too large',
            message: 'The uploaded file exceeds the size limit'
        });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            error: 'Too many files',
            message: 'Too many files uploaded'
        });
    }

    // Custom application errors
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            error: error.name || 'Application error',
            message: error.message
        });
    }

    // Default server error
    return res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development'
            ? error.message
            : 'An unexpected error occurred'
    });
}

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
    constructor(message, statusCode = 500, name = 'AppError') {
        super(message);
        this.statusCode = statusCode;
        this.name = name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async error wrapper to catch async errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    AppError,
    asyncHandler
};
