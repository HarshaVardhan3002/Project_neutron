/**
 * Progress Tracking Routes for Project_Neutron LMS
 * Handles module progress, course completion, and learning analytics
 */

const express = require('express');
const prisma = require('../lib/database.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/progress/dashboard
 * Get user's learning dashboard with progress overview
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get active enrollments with progress
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
                    difficulty: true,
                    _count: {
                        select: {
                            modules: true
                        }
                    }
                }
            }
        },
        orderBy: { lastAccessedAt: 'desc' },
        take: 5
    });

    // Get progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
            const moduleProgress = await prisma.moduleProgress.findMany({
                where: {
                    userId,
                    courseId: enrollment.courseId
                }
            });

            const totalModules = enrollment.course._count.modules;
            const completedModules = moduleProgress.filter(p => p.completed).length;
            const progressPercent = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

            return {
                ...enrollment,
                progress: {
                    totalModules,
                    completedModules,
                    progressPercent: Math.round(progressPercent)
                }
            };
        })
    );

    // Get recent test attempts
    const recentTests = await prisma.testAttempt.findMany({
        where: { userId },
        include: {
            test: {
                select: {
                    id: true,
                    title: true,
                    kind: true,
                    course: {
                        select: {
                            title: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    // Calculate overall statistics
    const totalEnrollments = await prisma.enrollment.count({
        where: { userId }
    });

    const totalCompletedModules = await prisma.moduleProgress.count({
        where: { userId, completed: true }
    });

    const averageScore = await prisma.moduleProgress.aggregate({
        where: { userId, completed: true },
        _avg: { completionScore: true }
    });

    const totalTestAttempts = await prisma.testAttempt.count({
        where: { userId }
    });

    res.json({
        success: true,
        data: {
            enrollments: enrollmentsWithProgress,
            recentTests,
            stats: {
                totalEnrollments,
                totalCompletedModules,
                averageScore: Math.round(averageScore._avg.completionScore || 0),
                totalTestAttempts
            }
        }
    });
}));

/**
 * GET /api/progress/course/:courseId
 * Get detailed progress for a specific course
 */
router.get('/course/:courseId', asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    shortDescription: true
                }
            }
        }
    });

    if (!enrollment) {
        throw new AppError('Not enrolled in this course', 403);
    }

    // Get modules with progress
    const modules = await prisma.module.findMany({
        where: { courseId },
        orderBy: { orderIndex: 'asc' },
        include: {
            lessons: {
                orderBy: { orderIndex: 'asc' },
                select: {
                    id: true,
                    title: true,
                    kind: true,
                    durationSeconds: true
                }
            },
            moduleProgress: {
                where: { userId },
                select: {
                    completed: true,
                    completionScore: true,
                    lastAttemptAt: true,
                    attemptsCount: true,
                    unlockedAt: true
                }
            }
        }
    });

    // Get test attempts for this course
    const testAttempts = await prisma.testAttempt.findMany({
        where: {
            userId,
            test: {
                courseId
            }
        },
        include: {
            test: {
                select: {
                    id: true,
                    title: true,
                    kind: true,
                    moduleId: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate overall course progress
    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.moduleProgress[0]?.completed).length;
    const progressPercent = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    res.json({
        success: true,
        data: {
            enrollment,
            modules: modules.map(module => ({
                ...module,
                progress: module.moduleProgress[0] || null
            })),
            testAttempts,
            overallProgress: {
                totalModules,
                completedModules,
                progressPercent: Math.round(progressPercent)
            }
        }
    });
}));

/**
 * POST /api/progress/module/:moduleId/complete
 * Mark a module as completed
 */
router.post('/module/:moduleId/complete', asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const { completionScore = 100 } = req.body;
    const userId = req.user.id;

    // Get module and verify enrollment
    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: {
            course: {
                select: {
                    id: true,
                    enrollments: {
                        where: { userId },
                        select: { id: true }
                    }
                }
            }
        }
    });

    if (!module) {
        throw new AppError('Module not found', 404);
    }

    if (module.course.enrollments.length === 0) {
        throw new AppError('Not enrolled in this course', 403);
    }

    // Update or create module progress
    const progress = await prisma.moduleProgress.upsert({
        where: {
            userId_moduleId: {
                userId,
                moduleId
            }
        },
        update: {
            completed: true,
            completionScore,
            lastAttemptAt: new Date(),
            attemptsCount: {
                increment: 1
            }
        },
        create: {
            userId,
            moduleId,
            courseId: module.courseId,
            completed: true,
            completionScore,
            lastAttemptAt: new Date(),
            attemptsCount: 1,
            unlockedAt: new Date()
        }
    });

    // Update enrollment progress
    const totalModules = await prisma.module.count({
        where: { courseId: module.courseId }
    });

    const completedModules = await prisma.moduleProgress.count({
        where: {
            userId,
            courseId: module.courseId,
            completed: true
        }
    });

    const progressPercent = (completedModules / totalModules) * 100;

    await prisma.enrollment.update({
        where: {
            userId_courseId: {
                userId,
                courseId: module.courseId
            }
        },
        data: {
            progressPercent,
            lastAccessedAt: new Date()
        }
    });

    res.json({
        success: true,
        message: 'Module marked as completed',
        data: {
            progress,
            courseProgress: {
                totalModules,
                completedModules,
                progressPercent: Math.round(progressPercent)
            }
        }
    });
}));

/**
 * GET /api/progress/analytics
 * Get user's learning analytics
 */
router.get('/analytics', asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Learning activity over time
    const dailyActivity = await prisma.moduleProgress.groupBy({
        by: ['lastAttemptAt'],
        where: {
            userId,
            lastAttemptAt: {
                gte: startDate
            }
        },
        _count: {
            id: true
        }
    });

    // Test performance over time
    const testPerformance = await prisma.testAttempt.findMany({
        where: {
            userId,
            submittedAt: {
                gte: startDate
            },
            status: 'completed'
        },
        select: {
            submittedAt: true,
            totalScore: true,
            maxScore: true,
            test: {
                select: {
                    title: true,
                    kind: true
                }
            }
        },
        orderBy: { submittedAt: 'asc' }
    });

    // Subject/difficulty breakdown
    const subjectProgress = await prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                select: {
                    testType: true,
                    difficulty: true
                }
            },
            _count: {
                select: {
                    moduleProgress: {
                        where: { completed: true }
                    }
                }
            }
        }
    });

    // Strengths and weaknesses analysis
    const testsBySubject = await prisma.testAttempt.groupBy({
        by: ['test'],
        where: {
            userId,
            status: 'completed'
        },
        _avg: {
            totalScore: true
        },
        _count: {
            id: true
        }
    });

    res.json({
        success: true,
        data: {
            period: parseInt(period),
            dailyActivity,
            testPerformance: testPerformance.map(attempt => ({
                date: attempt.submittedAt,
                percentage: attempt.maxScore > 0 ? (attempt.totalScore / attempt.maxScore) * 100 : 0,
                testTitle: attempt.test.title,
                testKind: attempt.test.kind
            })),
            subjectProgress,
            summary: {
                totalActiveDays: dailyActivity.length,
                totalTestsCompleted: testPerformance.length,
                averageTestScore: testPerformance.length > 0
                    ? testPerformance.reduce((sum, t) => sum + (t.totalScore / t.maxScore * 100), 0) / testPerformance.length
                    : 0
            }
        }
    });
}));

/**
 * GET /api/progress/leaderboard
 * Get course leaderboard (if user is enrolled)
 */
router.get('/leaderboard/:courseId', asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        }
    });

    if (!enrollment) {
        throw new AppError('Not enrolled in this course', 403);
    }

    // Get top performers
    const leaderboard = await prisma.enrollment.findMany({
        where: {
            courseId,
            status: 'active'
        },
        include: {
            user: {
                select: {
                    displayName: true,
                    firstName: true,
                    lastName: true
                }
            }
        },
        orderBy: [
            { progressPercent: 'desc' },
            { lastAccessedAt: 'desc' }
        ],
        take: parseInt(limit)
    });

    // Get user's rank
    const userRank = await prisma.enrollment.count({
        where: {
            courseId,
            status: 'active',
            progressPercent: {
                gt: enrollment.progressPercent
            }
        }
    }) + 1;

    res.json({
        success: true,
        data: {
            leaderboard: leaderboard.map((entry, index) => ({
                rank: index + 1,
                user: {
                    displayName: entry.user.displayName,
                    firstName: entry.user.firstName,
                    lastName: entry.user.lastName
                },
                progressPercent: entry.progressPercent,
                lastAccessedAt: entry.lastAccessedAt,
                isCurrentUser: entry.userId === userId
            })),
            userRank,
            totalParticipants: await prisma.enrollment.count({
                where: { courseId, status: 'active' }
            })
        }
    });
}));

/**
 * Admin Routes
 */

/**
 * GET /api/progress/admin/course/:courseId/analytics
 * Get course analytics for instructors/admins
 */
router.get('/admin/course/:courseId/analytics', requireAdmin, asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Enrollment statistics
    const enrollmentStats = await prisma.enrollment.groupBy({
        by: ['status'],
        where: { courseId },
        _count: { id: true }
    });

    // Progress distribution
    const progressDistribution = await prisma.enrollment.findMany({
        where: { courseId },
        select: { progressPercent: true }
    });

    // Module completion rates
    const moduleCompletionRates = await prisma.module.findMany({
        where: { courseId },
        include: {
            _count: {
                select: {
                    moduleProgress: {
                        where: { completed: true }
                    }
                }
            }
        }
    });

    const totalEnrollments = await prisma.enrollment.count({
        where: { courseId }
    });

    // Test performance
    const testPerformance = await prisma.testAttempt.findMany({
        where: {
            test: { courseId },
            status: 'completed'
        },
        select: {
            totalScore: true,
            maxScore: true,
            test: {
                select: {
                    title: true,
                    kind: true
                }
            }
        }
    });

    res.json({
        success: true,
        data: {
            enrollmentStats,
            progressDistribution: {
                ranges: {
                    '0-25%': progressDistribution.filter(p => p.progressPercent <= 25).length,
                    '26-50%': progressDistribution.filter(p => p.progressPercent > 25 && p.progressPercent <= 50).length,
                    '51-75%': progressDistribution.filter(p => p.progressPercent > 50 && p.progressPercent <= 75).length,
                    '76-100%': progressDistribution.filter(p => p.progressPercent > 75).length
                }
            },
            moduleCompletionRates: moduleCompletionRates.map(module => ({
                moduleId: module.id,
                title: module.title,
                completionRate: totalEnrollments > 0
                    ? (module._count.moduleProgress / totalEnrollments) * 100
                    : 0
            })),
            testPerformance: {
                averageScore: testPerformance.length > 0
                    ? testPerformance.reduce((sum, t) => sum + (t.totalScore / t.maxScore * 100), 0) / testPerformance.length
                    : 0,
                totalAttempts: testPerformance.length
            },
            totalEnrollments
        }
    });
}));

module.exports = router;
