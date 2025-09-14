const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticateToken } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error-handler.middleware');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/tests
 * Get all available tests
 */
router.get('/', asyncHandler(async (req, res) => {
    const { testType, difficulty, limit = 10, page = 1 } = req.query;

    const where = {
        published: true,
        ...(testType && { testType }),
        ...(difficulty && { difficulty })
    };

    const tests = await prisma.test.findMany({
        where,
        select: {
            id: true,
            title: true,
            description: true,
            testType: true,
            difficulty: true,
            timeLimit: true,
            passingScore: true,
            _count: {
                select: {
                    questions: true
                }
            }
        },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        orderBy: {
            createdAt: 'desc'
        }
    });

    const total = await prisma.test.count({ where });

    res.json({
        tests,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

/**
 * GET /api/tests/:id
 * Get test details
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            questions: {
                include: {
                    options: true
                },
                orderBy: {
                    orderIndex: 'asc'
                }
            }
        }
    });

    if (!test) {
        return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ test });
}));

/**
 * POST /api/tests/:id/attempts
 * Start a new test attempt
 */
router.post('/:id/attempts', authenticateToken, asyncHandler(async (req, res) => {
    const { id: testId } = req.params;
    const userId = req.user.id;

    // Check if test exists
    const test = await prisma.test.findUnique({
        where: { id: testId }
    });

    if (!test) {
        return res.status(404).json({ error: 'Test not found' });
    }

    // Create new attempt
    const attempt = await prisma.testAttempt.create({
        data: {
            testId,
            userId,
            status: 'in_progress',
            startedAt: new Date()
        }
    });

    res.status(201).json({
        message: 'Test attempt started',
        attempt: {
            id: attempt.id,
            testId: attempt.testId,
            status: attempt.status,
            startedAt: attempt.startedAt
        }
    });
}));

/**
 * POST /api/tests/:testId/attempts/:attemptId/responses
 * Submit an answer for a question
 */
router.post('/:testId/attempts/:attemptId/responses', authenticateToken, asyncHandler(async (req, res) => {
    const { testId, attemptId } = req.params;
    const { questionId, answer } = req.body;
    const userId = req.user.id;

    // Verify attempt belongs to user
    const attempt = await prisma.testAttempt.findFirst({
        where: {
            id: attemptId,
            testId,
            userId,
            status: 'in_progress'
        }
    });

    if (!attempt) {
        return res.status(404).json({ error: 'Test attempt not found or not in progress' });
    }

    // Get question details for scoring
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            options: true
        }
    });

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    // Calculate if answer is correct and points
    let isCorrect = false;
    let pointsAwarded = 0;

    if (question.type === 'multiple_choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && answer === correctOption.id;
        pointsAwarded = isCorrect ? (question.points || 1) : 0;
    }

    // Save response
    const response = await prisma.questionResponse.upsert({
        where: {
            attemptId_questionId: {
                attemptId,
                questionId
            }
        },
        update: {
            answer,
            isCorrect,
            pointsAwarded
        },
        create: {
            attemptId,
            questionId,
            answer,
            isCorrect,
            pointsAwarded
        }
    });

    res.json({
        message: 'Answer submitted successfully',
        response: {
            questionId,
            isCorrect,
            pointsAwarded
        }
    });
}));

/**
 * POST /api/tests/:testId/attempts/:attemptId/submit
 * Submit the entire test
 */
router.post('/:testId/attempts/:attemptId/submit', authenticateToken, asyncHandler(async (req, res) => {
    const { testId, attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await prisma.testAttempt.findFirst({
        where: {
            id: attemptId,
            testId,
            userId,
            status: 'in_progress'
        },
        include: {
            responses: true,
            test: {
                select: {
                    _count: {
                        select: {
                            questions: true
                        }
                    }
                }
            }
        }
    });

    if (!attempt) {
        return res.status(404).json({ error: 'Test attempt not found or already submitted' });
    }

    // Calculate final score
    const totalPoints = attempt.responses.reduce((sum, response) => sum + (response.pointsAwarded || 0), 0);
    const totalQuestions = attempt.test._count.questions;
    const scorePercentage = totalQuestions > 0 ? (totalPoints / totalQuestions) * 100 : 0;

    // Update attempt
    const updatedAttempt = await prisma.testAttempt.update({
        where: { id: attemptId },
        data: {
            status: 'completed',
            completedAt: new Date(),
            score: scorePercentage,
            totalPoints,
            totalQuestions
        }
    });

    res.json({
        message: 'Test submitted successfully',
        attempt: {
            id: updatedAttempt.id,
            score: updatedAttempt.score,
            totalPoints: updatedAttempt.totalPoints,
            totalQuestions: updatedAttempt.totalQuestions,
            completedAt: updatedAttempt.completedAt
        }
    });
}));

/**
 * GET /api/tests/:testId/attempts/:attemptId/results
 * Get test results
 */
router.get('/:testId/attempts/:attemptId/results', authenticateToken, asyncHandler(async (req, res) => {
    const { testId, attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await prisma.testAttempt.findFirst({
        where: {
            id: attemptId,
            testId,
            userId
        },
        include: {
            responses: {
                include: {
                    question: {
                        select: {
                            id: true,
                            questionText: true,
                            type: true,
                            points: true
                        }
                    }
                }
            },
            test: {
                select: {
                    title: true,
                    passingScore: true
                }
            }
        }
    });

    if (!attempt) {
        return res.status(404).json({ error: 'Test attempt not found' });
    }

    const passed = attempt.score >= (attempt.test.passingScore || 70);

    res.json({
        attempt: {
            id: attempt.id,
            score: attempt.score,
            totalPoints: attempt.totalPoints,
            totalQuestions: attempt.totalQuestions,
            passed,
            completedAt: attempt.completedAt,
            test: attempt.test,
            responses: attempt.responses
        }
    });
}));

module.exports = router;
