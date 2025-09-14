/**
 * Courses Routes for Project_Neutron LMS
 */

const express = require('express');
const prisma = require('../lib/database.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');
const { authenticateToken, requireInstructor } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/courses
 * Get all published courses (public)
 */
router.get('/', asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        search,
        difficulty,
        testType,
        language = 'en'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
        published: true,
        language,
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(difficulty && { difficulty }),
        ...(testType && { testType })
    };

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                shortDescription: true,
                difficulty: true,
                testType: true,
                thumbnailS3Key: true,
                language: true,
                createdAt: true,
                creator: {
                    select: {
                        displayName: true
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
 * GET /api/courses/:id
 * Get course details
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    displayName: true,
                    bio: true
                }
            },
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
            },
            _count: {
                select: {
                    enrollments: true
                }
            }
        }
    });

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    if (!course.published) {
        throw new AppError('Course is not available', 403);
    }

    res.json({ course });
}));

/**
 * POST /api/courses
 * Create a new course (instructor/admin only)
 */
router.post('/', authenticateToken, requireInstructor, asyncHandler(async (req, res) => {
    const {
        title,
        shortDescription,
        fullDescription,
        testType,
        difficulty,
        language = 'en',
        orgId
    } = req.body;

    if (!title) {
        throw new AppError('Course title is required', 400);
    }

    const course = await prisma.course.create({
        data: {
            title,
            shortDescription,
            fullDescription,
            testType,
            difficulty,
            language,
            orgId,
            createdBy: req.user.id,
            published: false
        },
        include: {
            creator: {
                select: {
                    displayName: true
                }
            }
        }
    });

    res.status(201).json({
        message: 'Course created successfully',
        course
    });
}));

/**
 * PUT /api/courses/:id
 * Update course (instructor/admin only)
 */
router.put('/:id', authenticateToken, requireInstructor, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        shortDescription,
        fullDescription,
        testType,
        difficulty,
        language,
        published
    } = req.body;

    // Check if user owns the course or is admin
    const existingCourse = await prisma.course.findUnique({
        where: { id },
        select: { createdBy: true }
    });

    if (!existingCourse) {
        throw new AppError('Course not found', 404);
    }

    if (existingCourse.createdBy !== req.user.id && !['admin', 'super_admin'].includes(req.user.profile.role)) {
        throw new AppError('Not authorized to update this course', 403);
    }

    const course = await prisma.course.update({
        where: { id },
        data: {
            title,
            shortDescription,
            fullDescription,
            testType,
            difficulty,
            language,
            published,
            updatedAt: new Date()
        },
        include: {
            creator: {
                select: {
                    displayName: true
                }
            }
        }
    });

    res.json({
        message: 'Course updated successfully',
        course
    });
}));

/**
 * DELETE /api/courses/:id
 * Delete course (instructor/admin only)
 */
router.delete('/:id', authenticateToken, requireInstructor, asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the course or is admin
    const existingCourse = await prisma.course.findUnique({
        where: { id },
        select: { createdBy: true }
    });

    if (!existingCourse) {
        throw new AppError('Course not found', 404);
    }

    if (existingCourse.createdBy !== req.user.id && !['admin', 'super_admin'].includes(req.user.profile.role)) {
        throw new AppError('Not authorized to delete this course', 403);
    }

    await prisma.course.delete({
        where: { id }
    });

    res.json({ message: 'Course deleted successfully' });
}));

/**
 * GET /api/courses/:id/modules
 * Get course modules with lessons
 */
router.get('/:id/modules', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
        where: { id },
        select: { published: true }
    });

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    if (!course.published) {
        throw new AppError('Course is not available', 403);
    }

    const modules = await prisma.module.findMany({
        where: { courseId: id },
        orderBy: { orderIndex: 'asc' },
        include: {
            lessons: {
                orderBy: { orderIndex: 'asc' },
                select: {
                    id: true,
                    title: true,
                    kind: true,
                    description: true,
                    durationSeconds: true,
                    orderIndex: true
                }
            }
        }
    });

    res.json({ modules });
}));

/**
 * POST /api/courses/:id/enroll
 * Enroll in a course (authenticated users)
 */
router.post('/:id/enroll', authenticateToken, asyncHandler(async (req, res) => {
    const { id: courseId } = req.params;
    const { plan = 'trial' } = req.body;
    const userId = req.user.id;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, published: true, title: true }
    });

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    if (!course.published) {
        throw new AppError('Course is not available for enrollment', 403);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        }
    });

    if (existingEnrollment) {
        throw new AppError('Already enrolled in this course', 400);
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
        data: {
            userId,
            courseId,
            plan,
            status: 'active',
            startedAt: new Date(),
            trialEndsAt: plan === 'trial' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 days trial
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

    res.status(201).json({
        message: 'Successfully enrolled in course',
        enrollment
    });
}));

/**
 * GET /api/courses/:id/enrollment
 * Get user's enrollment status for a course
 */
router.get('/:id/enrollment', authenticateToken, asyncHandler(async (req, res) => {
    const { id: courseId } = req.params;
    const userId = req.user.id;

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
                    title: true
                }
            }
        }
    });

    if (!enrollment) {
        return res.json({
            enrolled: false,
            enrollment: null
        });
    }

    // Get progress
    const progress = await prisma.moduleProgress.findMany({
        where: {
            userId,
            courseId
        },
        select: {
            moduleId: true,
            completed: true,
            completionScore: true
        }
    });

    const totalModules = await prisma.module.count({
        where: { courseId }
    });

    const completedModules = progress.filter(p => p.completed).length;
    const progressPercent = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    res.json({
        enrolled: true,
        enrollment: {
            ...enrollment,
            progress: {
                totalModules,
                completedModules,
                progressPercent: Math.round(progressPercent)
            }
        }
    });
}));

/**
 * GET /api/courses/my-courses
 * Get user's enrolled courses
 */
router.get('/my-courses', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status = 'active' } = req.query;

    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId,
            ...(status !== 'all' && { status })
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    shortDescription: true,
                    thumbnailS3Key: true,
                    difficulty: true,
                    testType: true,
                    _count: {
                        select: {
                            modules: true
                        }
                    }
                }
            }
        },
        orderBy: { startedAt: 'desc' }
    });

    // Get progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
            const progress = await prisma.moduleProgress.findMany({
                where: {
                    userId,
                    courseId: enrollment.courseId
                },
                select: {
                    completed: true,
                    completionScore: true
                }
            });

            const totalModules = enrollment.course._count.modules;
            const completedModules = progress.filter(p => p.completed).length;
            const progressPercent = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

            return {
                ...enrollment,
                progress: {
                    totalModules,
                    completedModules,
                    progressPercent: Math.round(progressPercent),
                    averageScore: progress.length > 0
                        ? progress.reduce((sum, p) => sum + (p.completionScore || 0), 0) / progress.length
                        : 0
                }
            };
        })
    );

    res.json({
        enrollments: enrollmentsWithProgress
    });
}));
module.exports = router;
