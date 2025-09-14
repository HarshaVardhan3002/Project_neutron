const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { logSystemAction } = require('../lib/logging.service');

const router = express.Router();
const prisma = new PrismaClient();

// Get all tests for admin management
router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { testType, published, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [];
        let params = [];

        if (testType) {
            whereConditions.push(`t.metadata->>'testType' = $${params.length + 1}`);
            params.push(testType);
        }

        if (published !== undefined) {
            whereConditions.push(`c.published = $${params.length + 1}`);
            params.push(published === 'true');
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Get tests with question counts
        const testsQuery = `
      SELECT 
        t.id,
        t.title,
        t.kind,
        t.time_limit_seconds,
        t.passing_score,
        t.allowed_attempts,
        t.randomized,
        t.created_at,
        t.updated_at,
        t.metadata,
        c.title as course_title,
        c.published,
        m.title as module_title,
        p.display_name as created_by_name,
        COUNT(q.id) as question_count
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN modules m ON t.module_id = m.id
      LEFT JOIN profiles p ON t.created_by = p.id
      LEFT JOIN questions q ON t.id = q.test_id
      ${whereClause}
      GROUP BY t.id, c.title, c.published, m.title, p.display_name
      ORDER BY t.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(parseInt(limit), offset);

        const tests = await prisma.$queryRawUnsafe(testsQuery, ...params);

        // Get total count
        const countQuery = `
      SELECT COUNT(DISTINCT t.id) as total
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      ${whereClause}
    `;

        const totalResult = await prisma.$queryRawUnsafe(countQuery, ...params.slice(0, -2));
        const total = parseInt(totalResult[0].total);

        res.json({
            success: true,
            tests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tests'
        });
    }
});

// Get test by ID with full details
router.get('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const test = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.course_id,
        t.module_id,
        t.title,
        t.kind,
        t.time_limit_seconds,
        t.passing_score,
        t.allowed_attempts,
        t.randomized,
        t.created_by,
        t.created_at,
        t.updated_at,
        t.metadata,
        c.title as course_title,
        m.title as module_title,
        p.display_name as created_by_name
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN modules m ON t.module_id = m.id
      LEFT JOIN profiles p ON t.created_by = p.id
      WHERE t.id = ${id}::uuid
    `;

        if (test.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        // Get questions for this test
        const questions = await prisma.$queryRaw`
      SELECT 
        q.id,
        q.stem,
        q.kind,
        q.points,
        q.order_index,
        q.media_file_id,
        q.metadata,
        q.created_at,
        q.updated_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN qo.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', qo.id,
                'option_text', qo.option_text,
                'is_correct', qo.is_correct,
                'order_index', qo.order_index,
                'metadata', qo.metadata
              )
            END
          ) FILTER (WHERE qo.id IS NOT NULL), 
          '[]'::json
        ) as options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.test_id = ${id}::uuid
      GROUP BY q.id, q.stem, q.kind, q.points, q.order_index, q.media_file_id, q.metadata, q.created_at, q.updated_at
      ORDER BY q.order_index, q.created_at
    `;

        res.json({
            success: true,
            test: {
                ...test[0],
                questions
            }
        });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch test'
        });
    }
});

// Create new test
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const {
            title,
            description,
            testType,
            courseId,
            moduleId,
            kind = 'practice',
            timeLimitSeconds,
            passingScore = 60,
            allowedAttempts,
            randomized = false,
            instructions,
            sections = [],
            metadata = {}
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Prepare metadata
        const testMetadata = {
            ...metadata,
            testType,
            description,
            instructions,
            sections: sections.map(section => ({
                ...section,
                questions: [] // Questions will be added separately
            }))
        };

        const newTest = await prisma.$queryRaw`
      INSERT INTO tests (
        course_id, 
        module_id, 
        title, 
        kind, 
        time_limit_seconds, 
        passing_score, 
        allowed_attempts, 
        randomized, 
        created_by, 
        metadata
      )
      VALUES (
        ${courseId ? courseId : null}::uuid,
        ${moduleId ? moduleId : null}::uuid,
        ${title},
        ${kind}::test_kind,
        ${timeLimitSeconds || null},
        ${passingScore},
        ${allowedAttempts || null},
        ${randomized},
        ${userId}::uuid,
        ${JSON.stringify(testMetadata)}::jsonb
      )
      RETURNING id, title, kind, time_limit_seconds, passing_score, allowed_attempts, randomized, created_at, metadata
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Test created: ${title}`,
            userId,
            'create',
            'test',
            newTest[0].id,
            { testType, title, kind }
        );

        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            test: newTest[0]
        });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create test'
        });
    }
});

// Update test
router.put('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            testType,
            courseId,
            moduleId,
            kind,
            timeLimitSeconds,
            passingScore,
            allowedAttempts,
            randomized,
            instructions,
            sections,
            metadata = {}
        } = req.body;

        const userId = req.user.id;

        // Check if test exists
        const existingTest = await prisma.$queryRaw`
      SELECT id, title, metadata FROM tests WHERE id = ${id}::uuid
    `;

        if (existingTest.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        // Prepare updated metadata
        const currentMetadata = existingTest[0].metadata || {};
        const updatedMetadata = {
            ...currentMetadata,
            ...metadata,
            ...(testType && { testType }),
            ...(description && { description }),
            ...(instructions && { instructions }),
            ...(sections && { sections })
        };

        const updatedTest = await prisma.$queryRaw`
      UPDATE tests 
      SET 
        course_id = COALESCE(${courseId ? courseId : null}::uuid, course_id),
        module_id = COALESCE(${moduleId ? moduleId : null}::uuid, module_id),
        title = COALESCE(${title}, title),
        kind = COALESCE(${kind ? kind : null}::test_kind, kind),
        time_limit_seconds = COALESCE(${timeLimitSeconds}, time_limit_seconds),
        passing_score = COALESCE(${passingScore}, passing_score),
        allowed_attempts = COALESCE(${allowedAttempts}, allowed_attempts),
        randomized = COALESCE(${randomized}, randomized),
        metadata = ${JSON.stringify(updatedMetadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, title, kind, time_limit_seconds, passing_score, allowed_attempts, randomized, created_at, updated_at, metadata
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Test updated: ${updatedTest[0].title}`,
            userId,
            'update',
            'test',
            id,
            { title: updatedTest[0].title }
        );

        res.json({
            success: true,
            message: 'Test updated successfully',
            test: updatedTest[0]
        });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update test'
        });
    }
});

// Delete test
router.delete('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if test exists and get title for logging
        const test = await prisma.$queryRaw`
      SELECT id, title FROM tests WHERE id = ${id}::uuid
    `;

        if (test.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        // Check if test has attempts
        const attempts = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM test_attempts WHERE test_id = ${id}::uuid
    `;

        if (parseInt(attempts[0].count) > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete test with existing attempts. Archive it instead.'
            });
        }

        // Delete test (this will cascade to questions and options)
        await prisma.$queryRaw`DELETE FROM tests WHERE id = ${id}::uuid`;

        // Log the action
        await logSystemAction(
            'warning',
            `Test deleted: ${test[0].title}`,
            userId,
            'delete',
            'test',
            id,
            { title: test[0].title }
        );

        res.json({
            success: true,
            message: 'Test deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete test'
        });
    }
});

// Add question to test
router.post('/:testId/questions', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { testId } = req.params;
        const {
            stem,
            kind,
            points = 1,
            orderIndex,
            mediaFileId,
            options = [],
            metadata = {}
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!stem || !kind) {
            return res.status(400).json({
                success: false,
                error: 'Question stem and kind are required'
            });
        }

        // Check if test exists
        const test = await prisma.$queryRaw`
      SELECT id, title FROM tests WHERE id = ${testId}::uuid
    `;

        if (test.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        // Create question and options in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create question
            const question = await tx.$queryRaw`
        INSERT INTO questions (test_id, stem, kind, points, order_index, media_file_id, metadata, created_by)
        VALUES (
          ${testId}::uuid,
          ${stem},
          ${kind}::question_kind,
          ${points},
          ${orderIndex || 0},
          ${mediaFileId ? mediaFileId : null}::uuid,
          ${JSON.stringify(metadata)}::jsonb,
          ${userId}::uuid
        )
        RETURNING id, stem, kind, points, order_index, media_file_id, metadata, created_at
      `;

            const questionId = question[0].id;

            // Create options if provided
            const createdOptions = [];
            if (options.length > 0) {
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];
                    const createdOption = await tx.$queryRaw`
            INSERT INTO question_options (question_id, option_text, is_correct, order_index, metadata)
            VALUES (
              ${questionId}::uuid,
              ${option.text || ''},
              ${option.isCorrect || false},
              ${option.orderIndex || i},
              ${JSON.stringify(option.metadata || {})}::jsonb
            )
            RETURNING id, option_text, is_correct, order_index, metadata
          `;
                    createdOptions.push(createdOption[0]);
                }
            }

            return {
                ...question[0],
                options: createdOptions
            };
        });

        // Log the action
        await logSystemAction(
            'info',
            `Question added to test: ${test[0].title}`,
            userId,
            'create',
            'question',
            result.id,
            { testId, testTitle: test[0].title, questionKind: kind }
        );

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            question: result
        });
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add question'
        });
    }
});

// Update question
router.put('/:testId/questions/:questionId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { testId, questionId } = req.params;
        const {
            stem,
            kind,
            points,
            orderIndex,
            mediaFileId,
            options,
            metadata = {}
        } = req.body;

        const userId = req.user.id;

        // Check if question exists
        const existingQuestion = await prisma.$queryRaw`
      SELECT q.id, q.stem, t.title as test_title
      FROM questions q
      JOIN tests t ON q.test_id = t.id
      WHERE q.id = ${questionId}::uuid AND q.test_id = ${testId}::uuid
    `;

        if (existingQuestion.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update question
            const updatedQuestion = await tx.$queryRaw`
        UPDATE questions 
        SET 
          stem = COALESCE(${stem}, stem),
          kind = COALESCE(${kind ? kind : null}::question_kind, kind),
          points = COALESCE(${points}, points),
          order_index = COALESCE(${orderIndex}, order_index),
          media_file_id = COALESCE(${mediaFileId ? mediaFileId : null}::uuid, media_file_id),
          metadata = COALESCE(${JSON.stringify(metadata)}::jsonb, metadata),
          updated_at = NOW()
        WHERE id = ${questionId}::uuid
        RETURNING id, stem, kind, points, order_index, media_file_id, metadata, updated_at
      `;

            // Update options if provided
            let updatedOptions = [];
            if (options && Array.isArray(options)) {
                // Delete existing options
                await tx.$queryRaw`DELETE FROM question_options WHERE question_id = ${questionId}::uuid`;

                // Create new options
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];
                    const createdOption = await tx.$queryRaw`
            INSERT INTO question_options (question_id, option_text, is_correct, order_index, metadata)
            VALUES (
              ${questionId}::uuid,
              ${option.text || ''},
              ${option.isCorrect || false},
              ${option.orderIndex || i},
              ${JSON.stringify(option.metadata || {})}::jsonb
            )
            RETURNING id, option_text, is_correct, order_index, metadata
          `;
                    updatedOptions.push(createdOption[0]);
                }
            }

            return {
                ...updatedQuestion[0],
                options: updatedOptions
            };
        });

        // Log the action
        await logSystemAction(
            'info',
            `Question updated in test: ${existingQuestion[0].test_title}`,
            userId,
            'update',
            'question',
            questionId,
            { testId, testTitle: existingQuestion[0].test_title }
        );

        res.json({
            success: true,
            message: 'Question updated successfully',
            question: result
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update question'
        });
    }
});

// Delete question
router.delete('/:testId/questions/:questionId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { testId, questionId } = req.params;
        const userId = req.user.id;

        // Check if question exists
        const question = await prisma.$queryRaw`
      SELECT q.id, q.stem, t.title as test_title
      FROM questions q
      JOIN tests t ON q.test_id = t.id
      WHERE q.id = ${questionId}::uuid AND q.test_id = ${testId}::uuid
    `;

        if (question.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }

        // Delete question (this will cascade to options)
        await prisma.$queryRaw`DELETE FROM questions WHERE id = ${questionId}::uuid`;

        // Log the action
        await logSystemAction(
            'warning',
            `Question deleted from test: ${question[0].test_title}`,
            userId,
            'delete',
            'question',
            questionId,
            { testId, testTitle: question[0].test_title, questionStem: question[0].stem }
        );

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete question'
        });
    }
});

// Publish/Unpublish test
router.post('/:id/publish', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;
        const userId = req.user.id;

        // Check if test exists and has questions
        const testInfo = await prisma.$queryRaw`
      SELECT 
        t.id, 
        t.title, 
        c.published as course_published,
        COUNT(q.id) as question_count
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN questions q ON t.id = q.test_id
      WHERE t.id = ${id}::uuid
      GROUP BY t.id, t.title, c.published
    `;

        if (testInfo.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        const test = testInfo[0];

        if (published && parseInt(test.question_count) === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot publish test without questions'
            });
        }

        // Update course published status if needed
        if (test.course_id && published) {
            await prisma.$queryRaw`
        UPDATE courses 
        SET published = true, updated_at = NOW()
        WHERE id = ${test.course_id}::uuid
      `;
        }

        // Update test metadata to include published status
        await prisma.$queryRaw`
      UPDATE tests 
      SET 
        metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ published })}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Test ${published ? 'published' : 'unpublished'}: ${test.title}`,
            userId,
            published ? 'publish' : 'unpublish',
            'test',
            id,
            { title: test.title, published }
        );

        res.json({
            success: true,
            message: `Test ${published ? 'published' : 'unpublished'} successfully`
        });
    } catch (error) {
        console.error('Error publishing test:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update test publication status'
        });
    }
});

// Duplicate test
router.post('/:id/duplicate', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userId = req.user.id;

        // Get original test with questions
        const originalTest = await prisma.$queryRaw`
      SELECT 
        t.course_id,
        t.module_id,
        t.title,
        t.kind,
        t.time_limit_seconds,
        t.passing_score,
        t.allowed_attempts,
        t.randomized,
        t.metadata
      FROM tests t
      WHERE t.id = ${id}::uuid
    `;

        if (originalTest.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        const test = originalTest[0];
        const newTitle = title || `${test.title} (Copy)`;

        // Duplicate test and questions in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create new test
            const newTest = await tx.$queryRaw`
        INSERT INTO tests (
          course_id, module_id, title, kind, time_limit_seconds, 
          passing_score, allowed_attempts, randomized, created_by, metadata
        )
        VALUES (
          ${test.course_id}::uuid,
          ${test.module_id}::uuid,
          ${newTitle},
          ${test.kind}::test_kind,
          ${test.time_limit_seconds},
          ${test.passing_score},
          ${test.allowed_attempts},
          ${test.randomized},
          ${userId}::uuid,
          ${JSON.stringify({ ...test.metadata, published: false })}::jsonb
        )
        RETURNING id, title, created_at
      `;

            const newTestId = newTest[0].id;

            // Get original questions
            const questions = await tx.$queryRaw`
        SELECT 
          q.stem, q.kind, q.points, q.order_index, q.media_file_id, q.metadata,
          COALESCE(
            JSON_AGG(
              CASE WHEN qo.id IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'option_text', qo.option_text,
                  'is_correct', qo.is_correct,
                  'order_index', qo.order_index,
                  'metadata', qo.metadata
                )
              END
            ) FILTER (WHERE qo.id IS NOT NULL), 
            '[]'::json
          ) as options
        FROM questions q
        LEFT JOIN question_options qo ON q.id = qo.question_id
        WHERE q.test_id = ${id}::uuid
        GROUP BY q.id, q.stem, q.kind, q.points, q.order_index, q.media_file_id, q.metadata
        ORDER BY q.order_index
      `;

            // Duplicate questions and options
            for (const question of questions) {
                const newQuestion = await tx.$queryRaw`
          INSERT INTO questions (test_id, stem, kind, points, order_index, media_file_id, metadata, created_by)
          VALUES (
            ${newTestId}::uuid,
            ${question.stem},
            ${question.kind}::question_kind,
            ${question.points},
            ${question.order_index},
            ${question.media_file_id}::uuid,
            ${JSON.stringify(question.metadata)}::jsonb,
            ${userId}::uuid
          )
          RETURNING id
        `;

                const newQuestionId = newQuestion[0].id;

                // Duplicate options
                if (question.options && question.options.length > 0) {
                    for (const option of question.options) {
                        await tx.$queryRaw`
              INSERT INTO question_options (question_id, option_text, is_correct, order_index, metadata)
              VALUES (
                ${newQuestionId}::uuid,
                ${option.option_text},
                ${option.is_correct},
                ${option.order_index},
                ${JSON.stringify(option.metadata)}::jsonb
              )
            `;
                    }
                }
            }

            return newTest[0];
        });

        // Log the action
        await logSystemAction(
            'info',
            `Test duplicated: ${newTitle}`,
            userId,
            'duplicate',
            'test',
            result.id,
            { originalTestId: id, originalTitle: test.title, newTitle }
        );

        res.status(201).json({
            success: true,
            message: 'Test duplicated successfully',
            test: result
        });
    } catch (error) {
        console.error('Error duplicating test:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to duplicate test'
        });
    }
});

module.exports = router;
