const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { logSystemAction } = require('../lib/logging.service');

const router = express.Router();
const prisma = new PrismaClient();

// Get all themes (public endpoint for theme selection)
router.get('/', async (req, res) => {
    try {
        const themes = await prisma.$queryRaw`
      SELECT id, name, description, occasion, colors, is_active, created_at
      FROM themes 
      ORDER BY is_active DESC, created_at DESC
    `;

        res.json({
            success: true,
            themes: themes
        });
    } catch (error) {
        console.error('Error fetching themes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch themes'
        });
    }
});

// Get active theme (public endpoint)
router.get('/active', async (req, res) => {
    try {
        const activeTheme = await prisma.$queryRaw`
      SELECT id, name, description, occasion, colors, created_at
      FROM themes 
      WHERE is_active = true 
      LIMIT 1
    `;

        if (activeTheme.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No active theme found'
            });
        }

        res.json({
            success: true,
            theme: activeTheme[0]
        });
    } catch (error) {
        console.error('Error fetching active theme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch active theme'
        });
    }
});

// Get theme by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const theme = await prisma.$queryRaw`
      SELECT id, name, description, occasion, colors, is_active, created_by, created_at, updated_at, metadata
      FROM themes 
      WHERE id = ${id}::uuid
    `;

        if (theme.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Theme not found'
            });
        }

        res.json({
            success: true,
            theme: theme[0]
        });
    } catch (error) {
        console.error('Error fetching theme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch theme'
        });
    }
});

// Create new theme (Super Admin only)
router.post('/', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { name, description, occasion, colors, metadata = {} } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!name || !colors) {
            return res.status(400).json({
                success: false,
                error: 'Name and colors are required'
            });
        }

        // Validate colors object structure
        const requiredColorKeys = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'border'];
        const colorKeys = Object.keys(colors);
        const missingKeys = requiredColorKeys.filter(key => !colorKeys.includes(key));

        if (missingKeys.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required color keys: ${missingKeys.join(', ')}`
            });
        }

        const newTheme = await prisma.$queryRaw`
      INSERT INTO themes (name, description, occasion, colors, created_by, metadata)
      VALUES (${name}, ${description || ''}, ${occasion || 'default'}, ${JSON.stringify(colors)}::jsonb, ${userId}::uuid, ${JSON.stringify(metadata)}::jsonb)
      RETURNING id, name, description, occasion, colors, is_active, created_at
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Theme created: ${name}`,
            userId,
            'create',
            'theme',
            newTheme[0].id,
            { themeName: name, occasion }
        );

        res.status(201).json({
            success: true,
            message: 'Theme created successfully',
            theme: newTheme[0]
        });
    } catch (error) {
        console.error('Error creating theme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create theme'
        });
    }
});

// Update theme (Super Admin only)
router.put('/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, occasion, colors, metadata = {} } = req.body;
        const userId = req.user.id;

        // Check if theme exists
        const existingTheme = await prisma.$queryRaw`
      SELECT id, name FROM themes WHERE id = ${id}::uuid
    `;

        if (existingTheme.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Theme not found'
            });
        }

        // Validate colors if provided
        if (colors) {
            const requiredColorKeys = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'border'];
            const colorKeys = Object.keys(colors);
            const missingKeys = requiredColorKeys.filter(key => !colorKeys.includes(key));

            if (missingKeys.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required color keys: ${missingKeys.join(', ')}`
                });
            }
        }

        const updatedTheme = await prisma.$queryRaw`
      UPDATE themes 
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        occasion = COALESCE(${occasion}, occasion),
        colors = COALESCE(${colors ? JSON.stringify(colors) : null}::jsonb, colors),
        metadata = COALESCE(${JSON.stringify(metadata)}::jsonb, metadata),
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, name, description, occasion, colors, is_active, created_at, updated_at
    `;

        // Log the action
        await logSystemAction(
            'info',
            `Theme updated: ${updatedTheme[0].name}`,
            userId,
            'update',
            'theme',
            id,
            { themeName: updatedTheme[0].name }
        );

        res.json({
            success: true,
            message: 'Theme updated successfully',
            theme: updatedTheme[0]
        });
    } catch (error) {
        console.error('Error updating theme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update theme'
        });
    }
});

// Activate theme (Super Admin only)
router.post('/:id/activate', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if theme exists
        const theme = await prisma.$queryRaw`
      SELECT id, name FROM themes WHERE id = ${id}::uuid
    `;

        if (theme.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Theme not found'
            });
        }

        // Deactivate all themes and activate the selected one
        await prisma.$transaction(async (tx) => {
            // Deactivate all themes
            await tx.$queryRaw`UPDATE themes SET is_active = false`;

            // Activate selected theme
            await tx.$queryRaw`
        UPDATE themes 
        SET is_active = true, updated_at = NOW() 
        WHERE id = ${id}::uuid
      `;
        });

        // Log the action
        await logSystemAction(
            'info',
            `Theme activated: ${theme[0].name}`,
            userId,
            'activate',
            'theme',
            id,
            { themeName: theme[0].name }
        );

        res.json({
            success: true,
            message: 'Theme activated successfully'
        });
    } catch (error) {
        console.error('Error activating theme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate theme'
        });
    }
});

// Delete theme (Super Admin only)
router.delete('/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if theme exists and is not active
        const theme = await prisma.$queryRaw`
      SELECT id, name, is_active FROM themes WHERE id = ${id}::uuid
    `;

        if (theme.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Theme not found'
            });
        }

        if (theme[0].is_active) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete active theme. Please activate another theme first.'
            });
        }

        await prisma.$queryRaw`DELETE FROM themes WHERE id = ${id}::uuid`;

        // Log the action
        await logSystemAction(
            'warning',
            `Theme deleted: ${theme[0].name}`,
            userId,
            'delete',
            'theme',
            id,
            { themeName: theme[0].name }
        );

        res.json({
            success: true,
            message: 'Theme deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting theme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete theme'
        });
    }
});

// Preview theme (Super Admin only) - Returns theme without activating
router.get('/:id/preview', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const theme = await prisma.$queryRaw`
      SELECT id, name, description, occasion, colors, metadata
      FROM themes 
      WHERE id = ${id}::uuid
    `;

        if (theme.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Theme not found'
            });
        }

        res.json({
            success: true,
            theme: theme[0],
            preview: true
        });
    } catch (error) {
        console.error('Error previewing theme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to preview theme'
        });
    }
});

module.exports = router;
