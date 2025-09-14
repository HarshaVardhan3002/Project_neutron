/**
 * Profile Routes for Project_Neutron LMS
 */

const express = require('express');
const prisma = require('../lib/database.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');

const router = express.Router();

/**
 * GET /api/profile/dashboard
 * Get user dashboard data
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get user's enrollments with progress
    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId,
            status: 'active'
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    shortDescription: true,
                    thumbnailS3Key: true,
                    difficulty: true
                }
            }
        },
        orderBy: { lastAccessedAt: 'desc' },
        take: 5
    });

    // Get recent test attempts
    const recentAttempts = await prisma.testAttempt.findMany({
        where: {
            userId,
            status: { in: ['submitted', 'graded'] }
        },
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
        orderBy: { submittedAt: 'desc' },
        take: 5
    });

    // Get upcoming assignments
    const upcomingAssignments = await prisma.assignment.findMany({
        where: {
            course: {
                enrollments: {
                    some: {
                        userId,
                        status: 'active'
                    }
                }
            },
            dueAt: {
                gte: new Date()
            }
        },
        include: {
            course: {
                select: {
                    title: true
                }
            }
        },
        orderBy: { dueAt: 'asc' },
        take: 5
    });

    // Get notifications
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
            read: false
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    // Calculate overall statistics
    const stats = {
        totalEnrollments: await prisma.enrollment.count({
            where: { userId }
        }),
        completedCourses: await prisma.enrollment.count({
            where: { userId, status: 'completed' }
        }),
        totalTestAttempts: await prisma.testAttempt.count({
            where: { userId }
        }),
        averageScore: await prisma.testAttempt.aggregate({
            where: {
                userId,
                status: { in: ['submitted', 'graded'] },
                maxScore: { gt: 0 }
            },
            _avg: {
                totalScore: true
            }
        })
    };

    res.json({
        enrollments,
        recentAttempts,
        upcomingAssignments,
        notifications,
        stats: {
            ...stats,
            averageScore: stats.averageScore._avg.totalScore || 0
        }
    });
}));

/**
 * GET /api/profile/progress
 * Get detailed learning progress
 */
router.get('/progress', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const moduleProgress = await prisma.moduleProgress.findMany({
        where: { userId },
        include: {
            module: {
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
        orderBy: { updatedAt: 'desc' }
    });

    // Group by course
    const progressByCourse = moduleProgress.reduce((acc, progress) => {
        const courseTitle = progress.module.course.title;
        if (!acc[courseTitle]) {
            acc[courseTitle] = [];
        }
        acc[courseTitle].push(progress);
        return acc;
    }, {});

    res.json({ progressByCourse });
}));

/**
 * GET /api/profile/certificates
 * Get user's certificates
 */
router.get('/certificates', asyncHandler(async (req, res) => {
    // Get completed enrollments that could have certificates
    const completedEnrollments = await prisma.enrollment.findMany({
        where: {
            userId: req.user.id,
            status: 'completed'
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    thumbnailS3Key: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    // For now, we'll return the completed courses as potential certificates
    // In a real implementation, you'd have a separate certificates table
    const certificates = completedEnrollments.map(enrollment => ({
        id: enrollment.id,
        courseTitle: enrollment.course.title,
        completedAt: enrollment.updatedAt,
        certificateUrl: null // Would be generated when certificate system is implemented
    }));

    res.json({ certificates });
}));

/**
 * GET /api/profile/activity
 * Get user activity feed
 */
router.get('/activity', asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;

    // Get recent activities (test attempts, enrollments, etc.)
    const [testAttempts, enrollments] = await Promise.all([
        prisma.testAttempt.findMany({
            where: { userId },
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
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit) / 2
        }),
        prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { startedAt: 'desc' },
            take: parseInt(limit) / 2
        })
    ]);

    // Combine and format activities
    const activities = [
        ...testAttempts.map(attempt => ({
            id: attempt.id,
            type: 'test_attempt',
            title: `Attempted ${attempt.test.title}`,
            description: `Course: ${attempt.test.course?.title || 'Unknown'}`,
            timestamp: attempt.createdAt,
            status: attempt.status,
            score: attempt.totalScore
        })),
        ...enrollments.map(enrollment => ({
            id: enrollment.id,
            type: 'enrollment',
            title: `Enrolled in ${enrollment.course.title}`,
            description: `Plan: ${enrollment.plan}`,
            timestamp: enrollment.startedAt,
            status: enrollment.status,
            progress: enrollment.progressPercent
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
        activities: activities.slice(skip, skip + parseInt(limit)),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: activities.length
        }
    });
}));

/**
 * PUT /api/profile/notifications/:id/read
 * Mark notification as read
 */
router.put('/notifications/:id/read', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
        where: {
            id,
            userId: req.user.id
        }
    });

    if (!notification) {
        throw new AppError('Notification not found', 404);
    }

    await prisma.notification.update({
        where: { id },
        data: { read: true }
    });

    res.json({ message: 'Notification marked as read' });
}));

/**
 * PUT /api/profile/notifications/read-all
 * Mark all notifications as read
 */
router.put('/notifications/read-all', asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
        where: {
            userId: req.user.id,
            read: false
        },
        data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
}));

/**
 * GET /api/profile/stats
 * Get detailed user statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const [
        enrollmentStats,
        testStats,
        timeStats
    ] = await Promise.all([
        // Enrollment statistics
        prisma.enrollment.groupBy({
            by: ['status'],
            where: { userId },
            _count: true
        }),
        // Test performance statistics
        prisma.testAttempt.aggregate({
            where: {
                userId,
                status: { in: ['submitted', 'graded'] }
            },
            _count: true,
            _avg: {
                totalScore: true
            },
            _max: {
                totalScore: true
            }
        }),
        // Time-based activity (last 30 days)
        prisma.testAttempt.groupBy({
            by: ['createdAt'],
            where: {
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            _count: true
        })
    ]);

    res.json({
        enrollments: enrollmentStats,
        tests: testStats,
        recentActivity: timeStats.length
    });
}));

module.exports = router;
