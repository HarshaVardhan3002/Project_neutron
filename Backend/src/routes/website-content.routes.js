const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { logSystemAction } = require('../lib/logging.service');

const router = express.Router();
const prisma = new PrismaClient();

// Get all website content sections (public endpoint)
router.get('/', async (req, res) => {
    try {
        const content = await prisma.$queryRaw`
      SELECT id, section, content, is_active, created_at, updated_at
      FROM website_content 
      WHERE is_active = true
      ORDER BY section
    `;

        res.json({
            success: true,
            content: content
        });
    } catch (error) {
        console.error('Error fetching website content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch website content'
        });
    }
});

// Get content by section (public endpoint)
router.get('/section/:section', async (req, res) => {
    try {
        const { section } = req.params;

        const content = await prisma.$queryRaw`
      SELECT id, section, content, is_active, created_at, updated_at
      FROM website_content 
      WHERE section = ${section} AND is_active = true
      LIMIT 1
    `;

        if (content.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Content section not found'
            });
        }

        res.json({
            success: true,
            content: content[0]
        });
    } catch (error) {
        console.error('Error fetching content section:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch content section'
        });
    }
});

// Get all content sections for admin (includes inactive)
router.get('/admin/all', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const content = await prisma.$queryRaw`
      SELECT 
        wc.id, 
        wc.section, 
        wc.content, 
        wc.is_active, 
        wc.created_by, 
        wc.created_at, 
        wc.updated_at,
        p.display_name as created_by_name
      FROM website_content wc
      LEFT JOIN profiles p ON wc.created_by = p.id
      ORDER BY wc.section
    `;

        res.json({
            success: true,
            content: content
        });
    } catch (error) {
        console.error('Error fetching all website content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch website content'
        });
    }
});

// Create or update content section (Super Admin only)
router.post('/section/:section', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { section } = req.params;
        const { content, is_active = true } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Content is required'
            });
        }

        // Validate content is valid JSON
        let contentJson;
        try {
            contentJson = typeof content === 'string' ? JSON.parse(content) : content;
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Content must be valid JSON'
            });
        }

        // Check if section already exists
        const existingContent = await prisma.$queryRaw`
      SELECT id FROM website_content WHERE section = ${section}
    `;

        let result;
        if (existingContent.length > 0) {
            // Update existing content
            result = await prisma.$queryRaw`
        UPDATE website_content 
        SET 
          content = ${JSON.stringify(contentJson)}::jsonb,
          is_active = ${is_active},
          updated_at = NOW()
        WHERE section = ${section}
        RETURNING id, section, content, is_active, created_at, updated_at
      `;

            // Log the action
            await logSystemAction(
                'info',
                `Website content updated: ${section}`,
                userId,
                'update',
                'website_content',
                result[0].id,
                { section, contentKeys: Object.keys(contentJson) }
            );
        } else {
            // Create new content
            result = await prisma.$queryRaw`
        INSERT INTO website_content (section, content, is_active, created_by)
        VALUES (${section}, ${JSON.stringify(contentJson)}::jsonb, ${is_active}, ${userId}::uuid)
        RETURNING id, section, content, is_active, created_at, updated_at
      `;

            // Log the action
            await logSystemAction(
                'info',
                `Website content created: ${section}`,
                userId,
                'create',
                'website_content',
                result[0].id,
                { section, contentKeys: Object.keys(contentJson) }
            );
        }

        res.json({
            success: true,
            message: existingContent.length > 0 ? 'Content updated successfully' : 'Content created successfully',
            content: result[0]
        });
    } catch (error) {
        console.error('Error saving website content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save website content'
        });
    }
});

// Update content section (Super Admin only)
router.put('/section/:section', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { section } = req.params;
        const { content, is_active } = req.body;
        const userId = req.user.id;

        // Check if section exists
        const existingContent = await prisma.$queryRaw`
      SELECT id FROM website_content WHERE section = ${section}
    `;

        if (existingContent.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Content section not found'
            });
        }

        // Validate content if provided
        let contentJson;
        if (content) {
            try {
                contentJson = typeof content === 'string' ? JSON.parse(content) : content;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Content must be valid JSON'
                });
            }
        }

        const updatedContent = await prisma.$queryRaw`
      UPDATE website_content 
      SET 
        content = COALESCE(${content ? JSON.stringify(contentJson) : null}::jsonb, content),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE section = ${section}
      RETURNING id, section, content, is_active, created_at, updated_at
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Website content updated: ${section}`,
            userId,
            'update',
            'website_content',
            updatedContent[0].id,
            { section, hasContent: !!content, hasActiveFlag: is_active !== undefined }
        );

        res.json({
            success: true,
            message: 'Content updated successfully',
            content: updatedContent[0]
        });
    } catch (error) {
        console.error('Error updating website content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update website content'
        });
    }
});

// Delete content section (Super Admin only)
router.delete('/section/:section', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { section } = req.params;
        const userId = req.user.id;

        // Check if section exists
        const existingContent = await prisma.$queryRaw`
      SELECT id, section FROM website_content WHERE section = ${section}
    `;

        if (existingContent.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Content section not found'
            });
        }

        await prisma.$queryRaw`DELETE FROM website_content WHERE section = ${section}`;

        // Log the action
        await logSystemAction(
            'warning',
            `Website content deleted: ${section}`,
            userId,
            'delete',
            'website_content',
            existingContent[0].id,
            { section }
        );

        res.json({
            success: true,
            message: 'Content section deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting website content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete website content'
        });
    }
});

// Toggle content section active status (Super Admin only)
router.post('/section/:section/toggle', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { section } = req.params;
        const userId = req.user.id;

        // Check if section exists
        const existingContent = await prisma.$queryRaw`
      SELECT id, section, is_active FROM website_content WHERE section = ${section}
    `;

        if (existingContent.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Content section not found'
            });
        }

        const newActiveStatus = !existingContent[0].is_active;

        const updatedContent = await prisma.$queryRaw`
      UPDATE website_content 
      SET is_active = ${newActiveStatus}, updated_at = NOW()
      WHERE section = ${section}
      RETURNING id, section, content, is_active, created_at, updated_at
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Website content ${newActiveStatus ? 'activated' : 'deactivated'}: ${section}`,
            userId,
            newActiveStatus ? 'activate' : 'deactivate',
            'website_content',
            updatedContent[0].id,
            { section, newStatus: newActiveStatus }
        );

        res.json({
            success: true,
            message: `Content section ${newActiveStatus ? 'activated' : 'deactivated'} successfully`,
            content: updatedContent[0]
        });
    } catch (error) {
        console.error('Error toggling content section:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle content section'
        });
    }
});

// Bulk update multiple sections (Super Admin only)
router.post('/bulk-update', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { sections } = req.body;
        const userId = req.user.id;

        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({
                success: false,
                error: 'Sections array is required'
            });
        }

        const results = [];
        const errors = [];

        // Process each section in a transaction
        await prisma.$transaction(async (tx) => {
            for (const sectionData of sections) {
                try {
                    const { section, content, is_active } = sectionData;

                    if (!section) {
                        errors.push({ section: 'unknown', error: 'Section name is required' });
                        continue;
                    }

                    // Validate content if provided
                    let contentJson;
                    if (content) {
                        try {
                            contentJson = typeof content === 'string' ? JSON.parse(content) : content;
                        } catch (error) {
                            errors.push({ section, error: 'Invalid JSON content' });
                            continue;
                        }
                    }

                    // Check if section exists
                    const existingContent = await tx.$queryRaw`
            SELECT id FROM website_content WHERE section = ${section}
          `;

                    let result;
                    if (existingContent.length > 0) {
                        // Update existing
                        result = await tx.$queryRaw`
              UPDATE website_content 
              SET 
                content = COALESCE(${content ? JSON.stringify(contentJson) : null}::jsonb, content),
                is_active = COALESCE(${is_active}, is_active),
                updated_at = NOW()
              WHERE section = ${section}
              RETURNING id, section, content, is_active, created_at, updated_at
            `;
                    } else if (content) {
                        // Create new (only if content is provided)
                        result = await tx.$queryRaw`
              INSERT INTO website_content (section, content, is_active, created_by)
              VALUES (${section}, ${JSON.stringify(contentJson)}::jsonb, ${is_active ?? true}, ${userId}::uuid)
              RETURNING id, section, content, is_active, created_at, updated_at
            `;
                    } else {
                        errors.push({ section, error: 'Content is required for new sections' });
                        continue;
                    }

                    results.push(result[0]);

                    // Log the action
                    await logSystemAction(
                        'info',
                        `Website content bulk updated: ${section}`,
                        userId,
                        'bulk_update',
                        'website_content',
                        result[0].id,
                        { section, operation: existingContent.length > 0 ? 'update' : 'create' }
                    );
                } catch (error) {
                    console.error(`Error processing section ${sectionData.section}:`, error);
                    errors.push({
                        section: sectionData.section || 'unknown',
                        error: error.message || 'Unknown error'
                    });
                }
            }
        });

        res.json({
            success: true,
            message: `Bulk update completed. ${results.length} sections processed successfully.`,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform bulk update'
        });
    }
});

// Get content history/versions (Super Admin only)
router.get('/section/:section/history', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { section } = req.params;
        const { limit = 10 } = req.query;

        // Get system logs for this content section
        const history = await prisma.$queryRaw`
      SELECT 
        sl.id,
        sl.level,
        sl.message,
        sl.action,
        sl.created_at,
        sl.metadata,
        p.display_name as user_name
      FROM system_logs sl
      LEFT JOIN profiles p ON sl.user_id = p.id
      WHERE sl.resource_type = 'website_content' 
      AND sl.metadata->>'section' = ${section}
      ORDER BY sl.created_at DESC
      LIMIT ${parseInt(limit)}
    `;

        res.json({
            success: true,
            history,
            section
        });
    } catch (error) {
        console.error('Error fetching content history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch content history'
        });
    }
});

module.exports = router;
