/**
 * Admin Routes for Project_Neutron LMS
 */

const express = require('express');
const prisma = require('../lib/database.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalTests,
        recentUsers,
        recentEnrollments,
        courseStats,
        testStats
    ] = await Promise.all([
        // Total counts
        prisma.profile.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.test.count(),

        // Recent activity
        prisma.profile.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                createdAt: true
            }
        }),
        prisma.enrollment.findMany({
            orderBy: { startedAt: 'desc' },
            take: 5,
            include: {
                user: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                course: {
                    select: {
                        title: true
                    }
                }
            }
        }),

        // Course statistics
        prisma.course.groupBy({
            by: ['published'],
            _count: true
        }),

        // Test statistics
        prisma.testAttempt.groupBy({
            by: ['status'],
            _count: true
        })
    ]);

    res.json({
        overview: {
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalTests
        },
        recentActivity: {
            users: recentUsers,
            enrollments: recentEnrollments
        },
        statistics: {
            courses: courseStats,
            tests: testStats
        }
    });
}));

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
router.get('/users', asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search,
        role,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
        ...(search && {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(role && { role })
    };

    const [users, total] = await Promise.all([
        prisma.profile.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { [sortBy]: sortOrder },
            select: {
                id: true,
                email: true,
                displayName: true,
                phone: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        enrollments: true,
                        testAttempts: true
                    }
                }
            }
        }),
        prisma.profile.count({ where })
    ]);

    res.json({
        users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 */
router.get('/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.profile.findUnique({
        where: { id },
        include: {
            enrollments: {
                include: {
                    course: {
                        select: {
                            title: true,
                            thumbnailS3Key: true
                        }
                    }
                },
                orderBy: { startedAt: 'desc' }
            },
            testAttempts: {
                include: {
                    test: {
                        select: {
                            title: true,
                            course: {
                                select: {
                                    title: true
                                }
                            }
                        }
                    }
                },
                orderBy: { startedAt: 'desc' },
                take: 10
            },
            notifications: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({ user });
}));

/**
 * PUT /api/admin/users/:id
 * Update user information
 */
router.put('/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, isEmailVerified, displayName, phone } = req.body;

    const user = await prisma.profile.update({
        where: { id },
        data: {
            role,
            isEmailVerified,
            displayName,
            phone,
            updatedAt: new Date()
        },
        select: {
            id: true,
            email: true,
            displayName: true,
            phone: true,
            role: true,
            isEmailVerified: true,
            updatedAt: true
        }
    });

    res.json({
        message: 'User updated successfully',
        user
    });
}));

/**
 * DELETE /api/admin/users/:id
 * Soft delete user
 */
router.delete('/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.profile.update({
        where: { id },
        data: {
            deletedAt: new Date()
        }
    });

    res.json({ message: 'User deleted successfully' });
}));

/**
 * GET /api/admin/courses
 * Get all courses for admin management
 */
router.get('/courses', asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search,
        published,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(published !== undefined && { published: published === 'true' })
    };

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { [sortBy]: sortOrder },
            include: {
                creator: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true,
                        modules: true
                    }
                }
            }
        }),
        prisma.course.count({ where })
    ]);

    res.json({
        courses,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

/**
 * PUT /api/admin/courses/:id/publish
 * Publish/unpublish course
 */
router.put('/courses/:id/publish', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { published } = req.body;

    const course = await prisma.course.update({
        where: { id },
        data: {
            published,
            updatedAt: new Date()
        },
        select: {
            id: true,
            title: true,
            published: true
        }
    });

    res.json({
        message: `Course ${published ? 'published' : 'unpublished'} successfully`,
        course
    });
}));

/**
 * GET /api/admin/analytics
 * Get platform analytics
 */
router.get('/analytics', asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;

    let dateFilter;
    switch (period) {
        case '7d':
            dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
        userGrowth,
        enrollmentTrends,
        testPerformance,
        popularCourses,
        revenueData
    ] = await Promise.all([
        // User registration trends
        prisma.profile.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: dateFilter }
            },
            _count: true
        }),

        // Enrollment trends
        prisma.enrollment.groupBy({
            by: ['startedAt'],
            where: {
                startedAt: { gte: dateFilter }
            },
            _count: true
        }),

        // Test performance metrics
        prisma.testAttempt.aggregate({
            where: {
                createdAt: { gte: dateFilter },
                status: { in: ['submitted', 'graded'] }
            },
            _avg: {
                totalScore: true
            },
            _count: true
        }),

        // Most popular courses
        prisma.course.findMany({
            select: {
                id: true,
                title: true,
                _count: {
                    select: {
                        enrollments: {
                            where: {
                                startedAt: { gte: dateFilter }
                            }
                        }
                    }
                }
            },
            orderBy: {
                enrollments: {
                    _count: 'desc'
                }
            },
            take: 10
        }),

        // Revenue data (if payments are implemented)
        prisma.payment.aggregate({
            where: {
                createdAt: { gte: dateFilter },
                status: 'completed'
            },
            _sum: {
                amountCents: true
            },
            _count: true
        })
    ]);

    res.json({
        period,
        userGrowth: userGrowth.length,
        enrollmentTrends: enrollmentTrends.length,
        testPerformance,
        popularCourses,
        revenue: {
            total: revenueData._sum.amountCents || 0,
            transactions: revenueData._count
        }
    });
}));

/**
 * GET /api/admin/system-settings
 * Get system settings
 */
router.get('/system-settings', asyncHandler(async (req, res) => {
    const settings = await prisma.systemSetting.findMany({
        orderBy: { key: 'asc' }
    });

    const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});

    res.json({ settings: settingsObject });
}));

/**
 * PUT /api/admin/system-settings
 * Update system settings
 */
router.put('/system-settings', asyncHandler(async (req, res) => {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
        throw new AppError('Settings object is required', 400);
    }

    // Update each setting
    const updatePromises = Object.entries(settings).map(([key, value]) =>
        prisma.systemSetting.upsert({
            where: { key },
            update: {
                value,
                updatedAt: new Date()
            },
            create: {
                key,
                value
            }
        })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'System settings updated successfully' });
}));

module.exports = router;
