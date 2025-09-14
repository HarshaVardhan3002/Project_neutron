/**
 * Enrollments Routes for Project_Neutron LMS
 */

const express = require('express');
const prisma = require('../lib/database.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');

const router = express.Router();

/**
 * GET /api/enrollments
 * Get user's enrollments
 */
router.get('/', asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
        userId: req.user.id,
        ...(status && { status })
    };

    const [enrollments, total] = await Promise.all([
        prisma.enrollment.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { startedAt: 'desc' },
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
            }
        }),
        prisma.enrollment.count({ where })
    ]);

    res.json({
        enrollments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

/**
 * POST /api/enrollments
 * Enroll in a course
 */
router.post('/', asyncHandler(async (req, res) => {
    const { courseId, plan = 'trial' } = req.body;

    if (!courseId) {
        throw new AppError('Course ID is required', 400);
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { published: true, title: true }
    });

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    if (!course.published) {
        throw new AppError('Course is not available for enrollment', 403);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
            userId: req.user.id,
            courseId,
            status: { in: ['active', 'paused'] }
        }
    });

    if (existingEnrollment) {
        throw new AppError('Already enrolled in this course', 409);
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
        data: {
            userId: req.user.id,
            courseId,
            plan,
            status: 'active',
            trialEndsAt: plan === 'trial' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 days trial
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    shortDescription: true,
                    thumbnailS3Key: true
                }
            }
        }
    });

    res.status(201).json({
        message: 'Successfully enrolled in course',
        enrollment
    });
}));

/**
 * GET /api/enrollments/:id
 * Get enrollment details
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const enrollment = await prisma.enrollment.findFirst({
        where: {
            id,
            userId: req.user.id
        },
        include: {
            course: {
                include: {
                    modules: {
                        orderBy: { orderIndex: 'asc' },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            orderIndex: true,
                            _count: {
                                select: {
                                    lessons: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!enrollment) {
        throw new AppError('Enrollment not found', 404);
    }

    res.json({ enrollment });
}));

/**
 * PUT /api/enrollments/:id
 * Update enrollment (pause/resume)
 */
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'paused'].includes(status)) {
        throw new AppError('Invalid status. Must be active or paused', 400);
    }

    const enrollment = await prisma.enrollment.findFirst({
        where: {
            id,
            userId: req.user.id
        }
    });

    if (!enrollment) {
        throw new AppError('Enrollment not found', 404);
    }

    const updatedEnrollment = await prisma.enrollment.update({
        where: { id },
        data: {
            status,
            lastAccessedAt: new Date()
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

    res.json({
        message: `Enrollment ${status === 'active' ? 'resumed' : 'paused'} successfully`,
        enrollment: updatedEnrollment
    });
}));

/**
 * GET /api/enrollments/:id/progress
 * Get enrollment progress
 */
router.get('/:id/progress', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const enrollment = await prisma.enrollment.findFirst({
        where: {
            id,
            userId: req.user.id
        },
        select: {
            courseId: true,
            progressPercent: true
        }
    });

    if (!enrollment) {
        throw new AppError('Enrollment not found', 404);
    }

    // Get module progress
    const moduleProgress = await prisma.moduleProgress.findMany({
        where: {
            userId: req.user.id,
            courseId: enrollment.courseId
        },
        include: {
            module: {
                select: {
                    id: true,
                    title: true,
                    orderIndex: true
                }
            }
        },
        orderBy: {
            module: {
                orderIndex: 'asc'
            }
        }
    });

    res.json({
        overallProgress: enrollment.progressPercent,
        moduleProgress
    });
}));

module.exports = router;
