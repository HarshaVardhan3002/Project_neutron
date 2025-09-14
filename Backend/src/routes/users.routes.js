/**
 * User Management Routes for Project_Neutron LMS
 * Handles user profiles, roles, and user-related operations
 */

const express = require('express');
const prisma = require('../lib/database.service');
const { supabaseAdmin } = require('../lib/supabase.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
    const profile = await prisma.profile.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            locale: true,
            timezone: true,
            bio: true,
            avatarS3Key: true,
            country: true,
            dateOfBirth: true,
            createdAt: true,
            updatedAt: true,
            metadata: true
        }
    });

    if (!profile) {
        throw new AppError('Profile not found', 404);
    }

    res.json({
        success: true,
        data: { profile }
    });
}));

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
    const {
        displayName,
        firstName,
        lastName,
        phone,
        locale,
        timezone,
        bio,
        country,
        dateOfBirth,
        metadata
    } = req.body;

    const updatedProfile = await prisma.profile.update({
        where: { id: req.user.id },
        data: {
            displayName,
            firstName,
            lastName,
            phone,
            locale,
            timezone,
            bio,
            country,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            metadata,
            updatedAt: new Date()
        },
        select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            locale: true,
            timezone: true,
            bio: true,
            avatarS3Key: true,
            country: true,
            dateOfBirth: true,
            createdAt: true,
            updatedAt: true,
            metadata: true
        }
    });

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { profile: updatedProfile }
    });
}));

/**
 * GET /api/users/dashboard
 * Get user dashboard data
 */
router.get('/dashboard', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get user's enrollments with course info
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    shortDescription: true,
                    thumbnailS3Key: true,
                    difficulty: true,
                    testType: true
                }
            }
        },
        orderBy: { startedAt: 'desc' },
        take: 5
    });

    // Get recent test attempts
    const recentTests = await prisma.testAttempt.findMany({
        where: { userId },
        include: {
            test: {
                select: {
                    id: true,
                    title: true,
                    kind: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    // Get progress statistics
    const progressStats = await prisma.moduleProgress.aggregate({
        where: { userId },
        _avg: { completionScore: true },
        _count: { completed: true }
    });

    // Get total completed modules
    const completedModules = await prisma.moduleProgress.count({
        where: { userId, completed: true }
    });

    // Get notifications
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    const dashboardData = {
        enrollments,
        recentTests,
        stats: {
            totalEnrollments: enrollments.length,
            completedModules,
            averageScore: progressStats._avg.completionScore || 0,
            totalAttempts: recentTests.length
        },
        notifications
    };

    res.json({
        success: true,
        data: dashboardData
    });
}));

/**
 * GET /api/users/progress
 * Get user's learning progress
 */
router.get('/progress', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const progress = await prisma.moduleProgress.findMany({
        where: { userId },
        include: {
            module: {
                select: {
                    id: true,
                    title: true,
                    orderIndex: true
                }
            },
            course: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: [
            { course: { title: 'asc' } },
            { module: { orderIndex: 'asc' } }
        ]
    });

    res.json({
        success: true,
        data: { progress }
    });
}));

/**
 * Admin Routes - Require admin authentication
 */

/**
 * GET /api/users/admin/all
 * Get all users (admin only)
 */
router.get('/admin/all', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (role && role !== 'all') {
        where.role = role;
    }

    if (search) {
        where.OR = [
            { displayName: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [users, total] = await Promise.all([
        prisma.profile.findMany({
            where,
            select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                role: true,
                country: true,
                createdAt: true,
                _count: {
                    select: {
                        enrollments: true,
                        testAttempts: true
                    }
                }
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        }),
        prisma.profile.count({ where })
    ]);

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
}));

/**
 * PUT /api/users/admin/:id/role
 * Update user role (admin only)
 */
router.put('/admin/:id/role', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin', 'super_admin'].includes(role)) {
        throw new AppError('Invalid role', 400);
    }

    const updatedProfile = await prisma.profile.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            displayName: true,
            role: true
        }
    });

    res.json({
        success: true,
        message: 'User role updated successfully',
        data: { profile: updatedProfile }
    });
}));

/**
 * POST /api/users/admin/create
 * Create new user (admin only)
 */
router.post('/admin/create', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const {
        email,
        password,
        displayName,
        firstName,
        lastName,
        role = 'student'
    } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            display_name: displayName
        }
    });

    if (authError) {
        throw new AppError(`Failed to create user: ${authError.message}`, 400);
    }

    // Create profile in our database
    const profile = await prisma.profile.create({
        data: {
            id: authUser.user.id,
            displayName,
            firstName,
            lastName,
            role
        }
    });

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { profile }
    });
}));

/**
 * DELETE /api/users/admin/:id
 * Delete user (admin only)
 */
router.delete('/admin/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
        console.error('Error deleting user from Supabase Auth:', authError);
        // Continue with profile deletion even if auth deletion fails
    }

    // Delete profile (this will cascade delete related records)
    await prisma.profile.delete({
        where: { id }
    });

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
}));

module.exports = router;
