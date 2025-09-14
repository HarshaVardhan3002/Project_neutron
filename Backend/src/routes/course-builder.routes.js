const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { logSystemAction } = require('../lib/logging.service');

const router = express.Router();
const prisma = new PrismaClient();

// Get all courses for admin management
router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { published, testType, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [];
        let params = [];

        if (published !== undefined) {
            whereConditions.push(`c.published = $${params.length + 1}`);
            params.push(published === 'true');
        }

        if (testType) {
            whereConditions.push(`c.test_type = $${params.length + 1}`);
            params.push(testType);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Get courses with module and lesson counts
        const coursesQuery = `
      SELECT 
        c.id,
        c.title,
        c.short_description,
        c.full_description,
        c.test_type,
        c.difficulty,
        c.thumbnail_s3_key,
        c.language,
        c.published,
        c.created_by,
        c.created_at,
        c.updated_at,
        c.metadata,
        p.display_name as created_by_name,
        COUNT(DISTINCT m.id) as module_count,
        COUNT(DISTINCT l.id) as lesson_count,
        COUNT(DISTINCT e.id) as enrollment_count
      FROM courses c
      LEFT JOIN profiles p ON c.created_by = p.id
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      ${whereClause}
      GROUP BY c.id, p.display_name
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(parseInt(limit), offset);

        const courses = await prisma.$queryRawUnsafe(coursesQuery, ...params);

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `;

        const totalResult = await prisma.$queryRawUnsafe(countQuery, ...params.slice(0, -2));
        const total = parseInt(totalResult[0].total);

        res.json({
            success: true,
            courses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses'
        });
    }
});

// Get course by ID with full details
router.get('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const course = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.org_id,
        c.title,
        c.short_description,
        c.full_description,
        c.test_type,
        c.difficulty,
        c.thumbnail_s3_key,
        c.language,
        c.published,
        c.created_by,
        c.created_at,
        c.updated_at,
        c.metadata,
        p.display_name as created_by_name
      FROM courses c
      LEFT JOIN profiles p ON c.created_by = p.id
      WHERE c.id = ${id}::uuid
    `;

        if (course.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Get modules with lessons
        const modules = await prisma.$queryRaw`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.order_index,
        m.created_at,
        m.updated_at,
        m.unlock_condition,
        COALESCE(
          JSON_AGG(
            CASE WHEN l.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', l.id,
                'title', l.title,
                'kind', l.kind,
                'description', l.description,
                'content_s3_key', l.content_s3_key,
                'duration_seconds', l.duration_seconds,
                'order_index', l.order_index,
                'extra', l.extra,
                'created_at', l.created_at,
                'updated_at', l.updated_at
              )
            END ORDER BY l.order_index, l.created_at
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as lessons
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.module_id AND l.deleted_at IS NULL
      WHERE m.course_id = ${id}::uuid
      GROUP BY m.id, m.title, m.description, m.order_index, m.created_at, m.updated_at, m.unlock_condition
      ORDER BY m.order_index, m.created_at
    `;

        res.json({
            success: true,
            course: {
                ...course[0],
                modules
            }
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course'
        });
    }
});

// Create new course
router.post('/', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const {
            title,
            shortDescription,
            fullDescription,
            testType,
            difficulty,
            thumbnailS3Key,
            language = 'en',
            published = false,
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

        const newCourse = await prisma.$queryRaw`
      INSERT INTO courses (
        title, 
        short_description, 
        full_description, 
        test_type, 
        difficulty, 
        thumbnail_s3_key, 
        language, 
        published, 
        created_by, 
        metadata
      )
      VALUES (
        ${title},
        ${shortDescription || ''},
        ${fullDescription || ''},
        ${testType || ''},
        ${difficulty || ''},
        ${thumbnailS3Key || null},
        ${language},
        ${published},
        ${userId}::uuid,
        ${JSON.stringify(metadata)}::jsonb
      )
      RETURNING id, title, short_description, test_type, difficulty, language, published, created_at, metadata
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Course created: ${title}`,
            userId,
            'create',
            'course',
            newCourse[0].id,
            { title, testType, difficulty }
        );

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course: newCourse[0]
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create course'
        });
    }
});

// Update course
router.put('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            shortDescription,
            fullDescription,
            testType,
            difficulty,
            thumbnailS3Key,
            language,
            published,
            metadata = {}
        } = req.body;

        const userId = req.user.id;

        // Check if course exists
        const existingCourse = await prisma.$queryRaw`
      SELECT id, title, metadata FROM courses WHERE id = ${id}::uuid
    `;

        if (existingCourse.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Prepare updated metadata
        const currentMetadata = existingCourse[0].metadata || {};
        const updatedMetadata = {
            ...currentMetadata,
            ...metadata
        };

        const updatedCourse = await prisma.$queryRaw`
      UPDATE courses 
      SET 
        title = COALESCE(${title}, title),
        short_description = COALESCE(${shortDescription}, short_description),
        full_description = COALESCE(${fullDescription}, full_description),
        test_type = COALESCE(${testType}, test_type),
        difficulty = COALESCE(${difficulty}, difficulty),
        thumbnail_s3_key = COALESCE(${thumbnailS3Key}, thumbnail_s3_key),
        language = COALESCE(${language}, language),
        published = COALESCE(${published}, published),
        metadata = ${JSON.stringify(updatedMetadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, title, short_description, full_description, test_type, difficulty, thumbnail_s3_key, language, published, created_at, updated_at, metadata
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Course updated: ${updatedCourse[0].title}`,
            userId,
            'update',
            'course',
            id,
            { title: updatedCourse[0].title }
        );

        res.json({
            success: true,
            message: 'Course updated successfully',
            course: updatedCourse[0]
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update course'
        });
    }
});

// Delete course
router.delete('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if course exists and get title for logging
        const course = await prisma.$queryRaw`
      SELECT id, title FROM courses WHERE id = ${id}::uuid
    `;

        if (course.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        // Check if course has enrollments
        const enrollments = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM enrollments WHERE course_id = ${id}::uuid
    `;

        if (parseInt(enrollments[0].count) > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete course with existing enrollments. Unpublish it instead.'
            });
        }

        // Delete course (this will cascade to modules, lessons, etc.)
        await prisma.$queryRaw`DELETE FROM courses WHERE id = ${id}::uuid`;

        // Log the action
        await logSystemAction(
            'warning',
            `Course deleted: ${course[0].title}`,
            userId,
            'delete',
            'course',
            id,
            { title: course[0].title }
        );

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete course'
        });
    }
});

// Add module to course
router.post('/:courseId/modules', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { courseId } = req.params;
        const {
            title,
            description,
            orderIndex,
            unlockCondition = {}
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Module title is required'
            });
        }

        // Check if course exists
        const course = await prisma.$queryRaw`
      SELECT id, title FROM courses WHERE id = ${courseId}::uuid
    `;

        if (course.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        const newModule = await prisma.$queryRaw`
      INSERT INTO modules (course_id, title, description, order_index, unlock_condition)
      VALUES (
        ${courseId}::uuid,
        ${title},
        ${description || ''},
        ${orderIndex || 0},
        ${JSON.stringify(unlockCondition)}::jsonb
      )
      RETURNING id, title, description, order_index, created_at, unlock_condition
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Module added to course: ${course[0].title}`,
            userId,
            'create',
            'module',
            newModule[0].id,
            { courseId, courseTitle: course[0].title, moduleTitle: title }
        );

        res.status(201).json({
            success: true,
            message: 'Module added successfully',
            module: newModule[0]
        });
    } catch (error) {
        console.error('Error adding module:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add module'
        });
    }
});

// Update module
router.put('/:courseId/modules/:moduleId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const {
            title,
            description,
            orderIndex,
            unlockCondition
        } = req.body;

        const userId = req.user.id;

        // Check if module exists
        const existingModule = await prisma.$queryRaw`
      SELECT m.id, m.title, c.title as course_title
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = ${moduleId}::uuid AND m.course_id = ${courseId}::uuid
    `;

        if (existingModule.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Module not found'
            });
        }

        const updatedModule = await prisma.$queryRaw`
      UPDATE modules 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        order_index = COALESCE(${orderIndex}, order_index),
        unlock_condition = COALESCE(${unlockCondition ? JSON.stringify(unlockCondition) : null}::jsonb, unlock_condition),
        updated_at = NOW()
      WHERE id = ${moduleId}::uuid
      RETURNING id, title, description, order_index, created_at, updated_at, unlock_condition
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Module updated in course: ${existingModule[0].course_title}`,
            userId,
            'update',
            'module',
            moduleId,
            { courseId, courseTitle: existingModule[0].course_title, moduleTitle: updatedModule[0].title }
        );

        res.json({
            success: true,
            message: 'Module updated successfully',
            module: updatedModule[0]
        });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update module'
        });
    }
});

// Delete module
router.delete('/:courseId/modules/:moduleId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const userId = req.user.id;

        // Check if module exists
        const module = await prisma.$queryRaw`
      SELECT m.id, m.title, c.title as course_title
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = ${moduleId}::uuid AND m.course_id = ${courseId}::uuid
    `;

        if (module.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Module not found'
            });
        }

        // Delete module (this will cascade to lessons)
        await prisma.$queryRaw`DELETE FROM modules WHERE id = ${moduleId}::uuid`;

        // Log the action
        await logSystemAction(
            'warning',
            `Module deleted from course: ${module[0].course_title}`,
            userId,
            'delete',
            'module',
            moduleId,
            { courseId, courseTitle: module[0].course_title, moduleTitle: module[0].title }
        );

        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete module'
        });
    }
});

// Add lesson to module
router.post('/:courseId/modules/:moduleId/lessons', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const {
            title,
            kind,
            description,
            contentS3Key,
            durationSeconds,
            orderIndex,
            extra = {}
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!title || !kind) {
            return res.status(400).json({
                success: false,
                error: 'Lesson title and kind are required'
            });
        }

        // Check if module exists
        const module = await prisma.$queryRaw`
      SELECT m.id, m.title, c.title as course_title
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = ${moduleId}::uuid AND m.course_id = ${courseId}::uuid
    `;

        if (module.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Module not found'
            });
        }

        const newLesson = await prisma.$queryRaw`
      INSERT INTO lessons (module_id, title, kind, description, content_s3_key, duration_seconds, order_index, extra)
      VALUES (
        ${moduleId}::uuid,
        ${title},
        ${kind}::content_kind,
        ${description || ''},
        ${contentS3Key || null},
        ${durationSeconds || null},
        ${orderIndex || 0},
        ${JSON.stringify(extra)}::jsonb
      )
      RETURNING id, title, kind, description, content_s3_key, duration_seconds, order_index, extra, created_at
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Lesson added to module: ${module[0].title}`,
            userId,
            'create',
            'lesson',
            newLesson[0].id,
            {
                courseId,
                moduleId,
                courseTitle: module[0].course_title,
                moduleTitle: module[0].title,
                lessonTitle: title,
                lessonKind: kind
            }
        );

        res.status(201).json({
            success: true,
            message: 'Lesson added successfully',
            lesson: newLesson[0]
        });
    } catch (error) {
        console.error('Error adding lesson:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add lesson'
        });
    }
});

// Update lesson
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { courseId, moduleId, lessonId } = req.params;
        const {
            title,
            kind,
            description,
            contentS3Key,
            durationSeconds,
            orderIndex,
            extra
        } = req.body;

        const userId = req.user.id;

        // Check if lesson exists
        const existingLesson = await prisma.$queryRaw`
      SELECT l.id, l.title, m.title as module_title, c.title as course_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE l.id = ${lessonId}::uuid AND l.module_id = ${moduleId}::uuid AND m.course_id = ${courseId}::uuid
    `;

        if (existingLesson.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        const updatedLesson = await prisma.$queryRaw`
      UPDATE lessons 
      SET 
        title = COALESCE(${title}, title),
        kind = COALESCE(${kind ? kind : null}::content_kind, kind),
        description = COALESCE(${description}, description),
        content_s3_key = COALESCE(${contentS3Key}, content_s3_key),
        duration_seconds = COALESCE(${durationSeconds}, duration_seconds),
        order_index = COALESCE(${orderIndex}, order_index),
        extra = COALESCE(${extra ? JSON.stringify(extra) : null}::jsonb, extra),
        updated_at = NOW()
      WHERE id = ${lessonId}::uuid
      RETURNING id, title, kind, description, content_s3_key, duration_seconds, order_index, extra, created_at, updated_at
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Lesson updated in module: ${existingLesson[0].module_title}`,
            userId,
            'update',
            'lesson',
            lessonId,
            {
                courseId,
                moduleId,
                courseTitle: existingLesson[0].course_title,
                moduleTitle: existingLesson[0].module_title,
                lessonTitle: updatedLesson[0].title
            }
        );

        res.json({
            success: true,
            message: 'Lesson updated successfully',
            lesson: updatedLesson[0]
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update lesson'
        });
    }
});

// Delete lesson (soft delete)
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { courseId, moduleId, lessonId } = req.params;
        const userId = req.user.id;

        // Check if lesson exists
        const lesson = await prisma.$queryRaw`
      SELECT l.id, l.title, m.title as module_title, c.title as course_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE l.id = ${lessonId}::uuid AND l.module_id = ${moduleId}::uuid AND m.course_id = ${courseId}::uuid
    `;

        if (lesson.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        // Soft delete lesson
        await prisma.$queryRaw`
      UPDATE lessons 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${lessonId}::uuid
    `;

        // Log the action
        await logSystemAction(
            'warning',
            `Lesson deleted from module: ${lesson[0].module_title}`,
            userId,
            'delete',
            'lesson',
            lessonId,
            {
                courseId,
                moduleId,
                courseTitle: lesson[0].course_title,
                moduleTitle: lesson[0].module_title,
                lessonTitle: lesson[0].title
            }
        );

        res.json({
            success: true,
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete lesson'
        });
    }
});

// Publish/Unpublish course
router.post('/:id/publish', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;
        const userId = req.user.id;

        // Check if course exists and has content
        const courseInfo = await prisma.$queryRaw`
      SELECT 
        c.id, 
        c.title, 
        COUNT(DISTINCT m.id) as module_count,
        COUNT(DISTINCT l.id) as lesson_count
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id AND l.deleted_at IS NULL
      WHERE c.id = ${id}::uuid
      GROUP BY c.id, c.title
    `;

        if (courseInfo.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        const course = courseInfo[0];

        if (published && (parseInt(course.module_count) === 0 || parseInt(course.lesson_count) === 0)) {
            return res.status(400).json({
                success: false,
                error: 'Cannot publish course without modules and lessons'
            });
        }

        // Update course published status
        await prisma.$queryRaw`
      UPDATE courses 
      SET published = ${published}, updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Course ${published ? 'published' : 'unpublished'}: ${course.title}`,
            userId,
            published ? 'publish' : 'unpublish',
            'course',
            id,
            { title: course.title, published }
        );

        res.json({
            success: true,
            message: `Course ${published ? 'published' : 'unpublished'} successfully`
        });
    } catch (error) {
        console.error('Error publishing course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update course publication status'
        });
    }
});

// Duplicate course
router.post('/:id/duplicate', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userId = req.user.id;

        // Get original course
        const originalCourse = await prisma.$queryRaw`
      SELECT 
        c.title,
        c.short_description,
        c.full_description,
        c.test_type,
        c.difficulty,
        c.thumbnail_s3_key,
        c.language,
        c.metadata
      FROM courses c
      WHERE c.id = ${id}::uuid
    `;

        if (originalCourse.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        const course = originalCourse[0];
        const newTitle = title || `${course.title} (Copy)`;

        // Duplicate course with modules and lessons in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create new course
            const newCourse = await tx.$queryRaw`
        INSERT INTO courses (
          title, short_description, full_description, test_type, difficulty, 
          thumbnail_s3_key, language, published, created_by, metadata
        )
        VALUES (
          ${newTitle},
          ${course.short_description},
          ${course.full_description},
          ${course.test_type},
          ${course.difficulty},
          ${course.thumbnail_s3_key},
          ${course.language},
          false,
          ${userId}::uuid,
          ${JSON.stringify(course.metadata)}::jsonb
        )
        RETURNING id, title, created_at
      `;

            const newCourseId = newCourse[0].id;

            // Get original modules with lessons
            const modules = await tx.$queryRaw`
        SELECT 
          m.title, m.description, m.order_index, m.unlock_condition,
          COALESCE(
            JSON_AGG(
              CASE WHEN l.id IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'title', l.title,
                  'kind', l.kind,
                  'description', l.description,
                  'content_s3_key', l.content_s3_key,
                  'duration_seconds', l.duration_seconds,
                  'order_index', l.order_index,
                  'extra', l.extra
                )
              END ORDER BY l.order_index
            ) FILTER (WHERE l.id IS NOT NULL), 
            '[]'::json
          ) as lessons
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id AND l.deleted_at IS NULL
        WHERE m.course_id = ${id}::uuid
        GROUP BY m.id, m.title, m.description, m.order_index, m.unlock_condition
        ORDER BY m.order_index
      `;

            // Duplicate modules and lessons
            for (const module of modules) {
                const newModule = await tx.$queryRaw`
          INSERT INTO modules (course_id, title, description, order_index, unlock_condition)
          VALUES (
            ${newCourseId}::uuid,
            ${module.title},
            ${module.description},
            ${module.order_index},
            ${JSON.stringify(module.unlock_condition)}::jsonb
          )
          RETURNING id
        `;

                const newModuleId = newModule[0].id;

                // Duplicate lessons
                if (module.lessons && module.lessons.length > 0) {
                    for (const lesson of module.lessons) {
                        await tx.$queryRaw`
              INSERT INTO lessons (module_id, title, kind, description, content_s3_key, duration_seconds, order_index, extra)
              VALUES (
                ${newModuleId}::uuid,
                ${lesson.title},
                ${lesson.kind}::content_kind,
                ${lesson.description},
                ${lesson.content_s3_key},
                ${lesson.duration_seconds},
                ${lesson.order_index},
                ${JSON.stringify(lesson.extra)}::jsonb
              )
            `;
                    }
                }
            }

            return newCourse[0];
        });

        // Log the action
        await logSystemAction(
            'info',
            `Course duplicated: ${newTitle}`,
            userId,
            'duplicate',
            'course',
            result.id,
            { originalCourseId: id, originalTitle: course.title, newTitle }
        );

        res.status(201).json({
            success: true,
            message: 'Course duplicated successfully',
            course: result
        });
    } catch (error) {
        console.error('Error duplicating course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to duplicate course'
        });
    }
});

module.exports = router;
