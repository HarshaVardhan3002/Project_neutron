/**
 * Admin Content Management Routes for Project_Neutron LMS
 * Handles courses, modules, lessons, tests, and questions
 */

const express = require('express');
const prisma = require('../lib/database.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);


/**
 * POST /api/admin/tests
 * Create a new test
 */
router.post('/tests', asyncHandler(async (req, res) => {
    const {
        courseId,
        moduleId,
        title,
        kind,
        timeLimitSeconds,
        passingScore = 60,
        allowedAttempts,
        randomized = false,
        questions = []
    } = req.body;

    if (!title || !kind) {
        throw new AppError('Test title and kind are required', 400);
    }

    const test = await prisma.test.create({
        data: {
            courseId,
            moduleId,
            title,
            kind,
            timeLimitSeconds,
            passingScore,
            allowedAttempts,
            randomized,
            createdBy: req.user.id
        }
    });

    // Create questions if provided
    if (questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
            const questionData = questions[i];
            const { options, ...questionInfo } = questionData;

            const question = await prisma.question.create({
                data: {
                    ...questionInfo,
                    testId: test.id,
                    orderIndex: i,
                    createdBy: req.user.id
                }
            });

            // Create options if provided
            if (options && options.length > 0) {
                for (let j = 0; j < options.length; j++) {
                    await prisma.questionOption.create({
                        data: {
                            ...options[j],
                            questionId: question.id,
                            orderIndex: j
                        }
                    });
                }
            }
        }
    }

    const testWithQuestions = await prisma.test.findUnique({
        where: { id: test.id },
        include: {
            questions: {
                include: {
                    options: true
                },
                orderBy: { orderIndex: 'asc' }
            }
        }
    });

    res.status(201).json({
        message: 'Test created successfully',
        test: testWithQuestions
    });
}));

/**
 * PUT /api/admin/tests/:id
 * Update test
 */
router.put('/tests/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const test = await prisma.test.update({
        where: { id },
        data: {
            ...updateData,
            updatedAt: new Date()
        }
    });

    res.json({
        message: 'Test updated successfully',
        test
    });
}));

/**
 * DELETE /api/admin/tests/:id
 * Delete test
 */
router.delete('/tests/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.test.delete({
        where: { id }
    });

    res.json({ message: 'Test deleted successfully' });
}));

/**
 * GET /api/admin/tests/:id
 * Get test with questions and options
 */
router.get('/tests/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            course: {
                select: {
                    title: true
                }
            },
            module: {
                select: {
                    title: true
                }
            },
            questions: {
                include: {
                    options: {
                        orderBy: { orderIndex: 'asc' }
                    }
                },
                orderBy: { orderIndex: 'asc' }
            },
            _count: {
                select: {
                    testAttempts: true
                }
            }
        }
    });

    if (!test) {
        throw new AppError('Test not found', 404);
    }

    res.json({ test });
}));

/**
 * POST /api/admin/tests/:testId/questions
 * Add question to test
 */
router.post('/tests/:testId/questions', asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { stem, kind, points = 1, orderIndex, options = [] } = req.body;

    if (!stem || !kind) {
        throw new AppError('Question stem and kind are required', 400);
    }

    const question = await prisma.question.create({
        data: {
            testId,
            stem,
            kind,
            points,
            orderIndex,
            createdBy: req.user.id
        }
    });

    // Create options if provided
    if (options.length > 0) {
        for (let i = 0; i < options.length; i++) {
            await prisma.questionOption.create({
                data: {
                    ...options[i],
                    questionId: question.id,
                    orderIndex: i
                }
            });
        }
    }

    const questionWithOptions = await prisma.question.findUnique({
        where: { id: question.id },
        include: {
            options: {
                orderBy: { orderIndex: 'asc' }
            }
        }
    });

    res.status(201).json({
        message: 'Question created successfully',
        question: questionWithOptions
    });
}));

/**
 * PUT /api/admin/questions/:id
 * Update question
 */
router.put('/questions/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stem, kind, points, orderIndex, options } = req.body;

    const question = await prisma.question.update({
        where: { id },
        data: {
            stem,
            kind,
            points,
            orderIndex,
            updatedAt: new Date()
        }
    });

    // Update options if provided
    if (options) {
        // Delete existing options
        await prisma.questionOption.deleteMany({
            where: { questionId: id }
        });

        // Create new options
        for (let i = 0; i < options.length; i++) {
            await prisma.questionOption.create({
                data: {
                    ...options[i],
                    questionId: id,
                    orderIndex: i
                }
            });
        }
    }

    const questionWithOptions = await prisma.question.findUnique({
        where: { id },
        include: {
            options: {
                orderBy: { orderIndex: 'asc' }
            }
        }
    });

    res.json({
        message: 'Question updated successfully',
        question: questionWithOptions
    });
}));

/**
 * DELETE /api/admin/questions/:id
 * Delete question
 */
router.delete('/questions/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.question.delete({
        where: { id }
    });

    res.json({ message: 'Question deleted successfully' });
}));

/**
 * GET /api/admin/content-overview
 * Get overview of all content for management
 */
router.get('/content-overview', asyncHandler(async (req, res) => {
    const [courses, tests, totalUsers, totalEnrollments] = await Promise.all([
        prisma.course.findMany({
            include: {
                _count: {
                    select: {
                        modules: true,
                        enrollments: true,
                        tests: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.test.findMany({
            include: {
                course: {
                    select: {
                        title: true
                    }
                },
                module: {
                    select: {
                        title: true
                    }
                },
                _count: {
                    select: {
                        questions: true,
                        testAttempts: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.profile.count(),
        prisma.enrollment.count()
    ]);

    res.json({
        overview: {
            totalCourses: courses.length,
            totalTests: tests.length,
            totalUsers,
            totalEnrollments
        },
        courses,
        tests
    });
}));

/**
 * GET /api/admin/content/chapters
 * Get all chapters/modules for management
 */
router.get('/chapters', asyncHandler(async (req, res) => {
    const chapters = await prisma.module.findMany({
        include: {
            course: {
                select: { title: true }
            },
            lessons: {
                orderBy: { orderIndex: 'asc' }
            },
            _count: {
                select: {
                    lessons: true
                }
            }
        },
        orderBy: [{ courseId: 'asc' }, { orderIndex: 'asc' }]
    });

    // Transform to match frontend expectations
    const transformedChapters = chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        order: chapter.orderIndex,
        isPublished: true, // Assuming published by default
        courseId: chapter.courseId,
        createdAt: chapter.createdAt,
        course: chapter.course,
        contents: chapter.lessons.map(lesson => ({
            id: lesson.id,
            type: lesson.kind,
            title: lesson.title,
            content: lesson.description,
            url: lesson.contentS3Key,
            order: lesson.orderIndex
        })),
        _count: {
            contents: chapter._count.lessons
        }
    }));

    res.json({
        success: true,
        data: { chapters: transformedChapters }
    });
}));

/**
 * POST /api/admin/content/chapters
 * Create a new chapter
 */
router.post('/chapters', asyncHandler(async (req, res) => {
    const { title, description, courseId, isPublished } = req.body;

    // Get the next order number for this course
    const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { orderIndex: 'desc' }
    });

    const orderIndex = lastModule ? lastModule.orderIndex + 1 : 0;

    const chapter = await prisma.module.create({
        data: {
            title,
            description,
            courseId,
            orderIndex,
            // Note: isPublished is not in the schema, so we'll ignore it for now
        }
    });

    res.json({
        success: true,
        data: { chapter }
    });
}));

/**
 * PUT /api/admin/content/chapters/:id
 * Update chapter
 */
router.put('/chapters/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, courseId, isPublished } = req.body;

    const chapter = await prisma.module.update({
        where: { id },
        data: {
            title,
            description,
            courseId,
            updatedAt: new Date()
        }
    });

    res.json({
        success: true,
        data: { chapter }
    });
}));

/**
 * DELETE /api/admin/content/chapters/:id
 * Delete chapter
 */
router.delete('/chapters/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.module.delete({
        where: { id }
    });

    res.json({
        success: true,
        message: 'Chapter deleted successfully'
    });
}));

/**
 * PUT /api/admin/content/chapters/:id/reorder
 * Reorder chapter
 */
router.put('/chapters/:id/reorder', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { direction } = req.body;

    const chapter = await prisma.module.findUnique({
        where: { id }
    });

    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }

    const newOrder = direction === 'up' ? chapter.orderIndex - 1 : chapter.orderIndex + 1;

    // Find the chapter to swap with
    const swapChapter = await prisma.module.findFirst({
        where: {
            courseId: chapter.courseId,
            orderIndex: newOrder
        }
    });

    if (swapChapter) {
        // Swap orders using a transaction
        await prisma.$transaction([
            prisma.module.update({
                where: { id: chapter.id },
                data: { orderIndex: newOrder }
            }),
            prisma.module.update({
                where: { id: swapChapter.id },
                data: { orderIndex: chapter.orderIndex }
            })
        ]);
    }

    res.json({
        success: true,
        message: 'Chapter reordered successfully'
    });
}));

/**
 * POST /api/admin/content/chapters/:chapterId/contents
 * Add content to chapter
 */
router.post('/chapters/:chapterId/contents', asyncHandler(async (req, res) => {
    const { chapterId } = req.params;
    const { type, title, content, url, order } = req.body;

    const newContent = await prisma.lesson.create({
        data: {
            moduleId: chapterId,
            title,
            kind: type,
            description: content,
            contentS3Key: url,
            orderIndex: order || 0
        }
    });

    res.json({
        success: true,
        data: { content: newContent }
    });
}));

/**
 * PUT /api/admin/content/chapters/:chapterId/contents/:contentId
 * Update content
 */
router.put('/chapters/:chapterId/contents/:contentId', asyncHandler(async (req, res) => {
    const { contentId } = req.params;
    const { type, title, content, url, order } = req.body;

    const updatedContent = await prisma.lesson.update({
        where: { id: contentId },
        data: {
            title,
            kind: type,
            description: content,
            contentS3Key: url,
            orderIndex: order
        }
    });

    res.json({
        success: true,
        data: { content: updatedContent }
    });
}));

/**
 * DELETE /api/admin/content/chapters/:chapterId/contents/:contentId
 * Delete content
 */
router.delete('/chapters/:chapterId/contents/:contentId', asyncHandler(async (req, res) => {
    const { contentId } = req.params;

    await prisma.lesson.update({
        where: { id: contentId },
        data: {
            deletedAt: new Date()
        }
    });

    res.json({
        success: true,
        message: 'Content deleted successfully'
    });
}));

module.exports = router;
