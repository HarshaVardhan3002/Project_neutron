const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { logSystemAction } = require('../lib/logging.service');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users with comprehensive filtering and analytics
router.get('/', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const {
            role,
            isActive,
            isVerified,
            country,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [];
        let params = [];

        // Build dynamic WHERE conditions
        if (role) {
            whereConditions.push(`p.role = $${params.length + 1}`);
            params.push(role);
        }

        if (isActive !== undefined) {
            whereConditions.push(`(p.deleted_at IS ${isActive === 'true' ? 'NULL' : 'NOT NULL'})`);
        }

        if (isVerified !== undefined) {
            whereConditions.push(`au.email_confirmed_at IS ${isVerified === 'true' ? 'NOT NULL' : 'NULL'}`);
        }

        if (country) {
            whereConditions.push(`p.country = $${params.length + 1}`);
            params.push(country);
        }

        if (search) {
            whereConditions.push(`(
        p.display_name ILIKE $${params.length + 1} OR 
        p.first_name ILIKE $${params.length + 1} OR 
        p.last_name ILIKE $${params.length + 1} OR 
        au.email ILIKE $${params.length + 1}
      )`);
            params.push(`%${search}%`);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Validate sort parameters
        const validSortFields = ['created_at', 'display_name', 'role', 'last_sign_in_at'];
        const validSortOrders = ['asc', 'desc'];
        const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

        // Get users with comprehensive data
        const usersQuery = `
      SELECT 
        p.id,
        p.display_name,
        p.first_name,
        p.last_name,
        p.phone,
        p.role,
        p.locale,
        p.timezone,
        p.bio,
        p.avatar_s3_key,
        p.country,
        p.date_of_birth,
        p.created_at,
        p.updated_at,
        p.deleted_at,
        p.metadata,
        au.email,
        au.email_confirmed_at,
        au.last_sign_in_at,
        au.created_at as auth_created_at,
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT ta.id) as test_attempt_count,
        COUNT(DISTINCT c.id) as courses_created_count,
        COALESCE(SUM(pay.amount_cents), 0) as total_spent_cents,
        AVG(ta.total_score) as average_test_score
      FROM profiles p
      LEFT JOIN auth.users au ON p.id = au.id
      LEFT JOIN enrollments e ON p.id = e.user_id
      LEFT JOIN test_attempts ta ON p.id = ta.user_id AND ta.status = 'completed'
      LEFT JOIN courses c ON p.id = c.created_by
      LEFT JOIN payments pay ON p.id = pay.user_id AND pay.status = 'completed'
      ${whereClause}
      GROUP BY p.id, au.email, au.email_confirmed_at, au.last_sign_in_at, au.created_at
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(parseInt(limit), offset);

        const users = await prisma.$queryRawUnsafe(usersQuery, ...params);

        // Get total count
        const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM profiles p
      LEFT JOIN auth.users au ON p.id = au.id
      ${whereClause}
    `;

        const totalResult = await prisma.$queryRawUnsafe(countQuery, ...params.slice(0, -2));
        const total = parseInt(totalResult[0].total);

        // Format users data
        const formattedUsers = users.map(user => ({
            ...user,
            is_active: !user.deleted_at,
            is_verified: !!user.email_confirmed_at,
            total_spent: user.total_spent_cents ? (user.total_spent_cents / 100).toFixed(2) : '0.00',
            average_score: user.average_test_score ? parseFloat(user.average_test_score).toFixed(1) : null,
            _count: {
                enrollments: parseInt(user.enrollment_count) || 0,
                testAttempts: parseInt(user.test_attempt_count) || 0,
                coursesCreated: parseInt(user.courses_created_count) || 0
            }
        }));

        res.json({
            success: true,
            users: formattedUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// Get user by ID with detailed information
router.get('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.display_name,
        p.first_name,
        p.last_name,
        p.phone,
        p.role,
        p.locale,
        p.timezone,
        p.bio,
        p.avatar_s3_key,
        p.country,
        p.date_of_birth,
        p.created_at,
        p.updated_at,
        p.deleted_at,
        p.metadata,
        au.email,
        au.email_confirmed_at,
        au.last_sign_in_at,
        au.created_at as auth_created_at
      FROM profiles p
      LEFT JOIN auth.users au ON p.id = au.id
      WHERE p.id = ${id}::uuid
    `;

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user's enrollments
        const enrollments = await prisma.$queryRaw`
      SELECT 
        e.id,
        e.plan,
        e.status,
        e.started_at,
        e.ends_at,
        e.progress_percent,
        e.last_accessed_at,
        c.title as course_title,
        c.test_type,
        c.difficulty
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ${id}::uuid
      ORDER BY e.started_at DESC
    `;

        // Get user's test attempts
        const testAttempts = await prisma.$queryRaw`
      SELECT 
        ta.id,
        ta.started_at,
        ta.submitted_at,
        ta.status,
        ta.total_score,
        ta.max_score,
        ta.duration_seconds,
        t.title as test_title,
        t.kind as test_kind,
        c.title as course_title
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      LEFT JOIN courses c ON t.course_id = c.id
      WHERE ta.user_id = ${id}::uuid
      ORDER BY ta.started_at DESC
      LIMIT 10
    `;

        // Get user's activity logs
        const activityLogs = await prisma.$queryRaw`
      SELECT 
        sl.id,
        sl.level,
        sl.message,
        sl.action,
        sl.resource_type,
        sl.created_at,
        sl.metadata
      FROM system_logs sl
      WHERE sl.user_id = ${id}::uuid
      ORDER BY sl.created_at DESC
      LIMIT 20
    `;

        const userData = {
            ...user[0],
            is_active: !user[0].deleted_at,
            is_verified: !!user[0].email_confirmed_at,
            enrollments,
            testAttempts,
            activityLogs
        };

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
});

// Update user profile and role
router.put('/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            displayName,
            firstName,
            lastName,
            phone,
            role,
            locale,
            timezone,
            bio,
            avatarS3Key,
            country,
            dateOfBirth,
            metadata = {}
        } = req.body;

        const userId = req.user.id;

        // Check if user exists
        const existingUser = await prisma.$queryRaw`
      SELECT id, display_name, role FROM profiles WHERE id = ${id}::uuid
    `;

        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Prepare updated metadata
        const currentMetadata = existingUser[0].metadata || {};
        const updatedMetadata = {
            ...currentMetadata,
            ...metadata
        };

        const updatedUser = await prisma.$queryRaw`
      UPDATE profiles 
      SET 
        display_name = COALESCE(${displayName}, display_name),
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
        phone = COALESCE(${phone}, phone),
        role = COALESCE(${role ? role : null}::user_role, role),
        locale = COALESCE(${locale}, locale),
        timezone = COALESCE(${timezone}, timezone),
        bio = COALESCE(${bio}, bio),
        avatar_s3_key = COALESCE(${avatarS3Key}, avatar_s3_key),
        country = COALESCE(${country}, country),
        date_of_birth = COALESCE(${dateOfBirth ? dateOfBirth : null}::date, date_of_birth),
        metadata = ${JSON.stringify(updatedMetadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, display_name, first_name, last_name, phone, role, locale, timezone, bio, avatar_s3_key, country, date_of_birth, updated_at, metadata
    `;

        // Log the action
        await logSystemAction(
            'info',
            `User profile updated: ${updatedUser[0].display_name}`,
            userId,
            'update',
            'user_profile',
            id,
            {
                updatedFields: Object.keys(req.body),
                oldRole: existingUser[0].role,
                newRole: updatedUser[0].role
            }
        );

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
});

// Deactivate/Activate user (soft delete)
router.post('/:id/toggle-status', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        const userId = req.user.id;

        // Check if user exists
        const user = await prisma.$queryRaw`
      SELECT id, display_name, deleted_at FROM profiles WHERE id = ${id}::uuid
    `;

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const isCurrentlyActive = !user[0].deleted_at;
        const newActiveStatus = active !== undefined ? active : !isCurrentlyActive;

        // Update user status
        await prisma.$queryRaw`
      UPDATE profiles 
      SET 
        deleted_at = ${newActiveStatus ? null : 'NOW()'},
        updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

        // Log the action
        await logSystemAction(
            'warning',
            `User ${newActiveStatus ? 'activated' : 'deactivated'}: ${user[0].display_name}`,
            userId,
            newActiveStatus ? 'activate' : 'deactivate',
            'user_profile',
            id,
            { displayName: user[0].display_name, newStatus: newActiveStatus }
        );

        res.json({
            success: true,
            message: `User ${newActiveStatus ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status'
        });
    }
});

// Delete user permanently (super admin only)
router.delete('/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if user exists
        const user = await prisma.$queryRaw`
      SELECT id, display_name, role FROM profiles WHERE id = ${id}::uuid
    `;

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Prevent deletion of super admins
        if (user[0].role === 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete super admin users'
            });
        }

        // Check if user has critical data
        const userDataCheck = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT ta.id) as test_attempt_count,
        COUNT(DISTINCT c.id) as courses_created_count,
        COUNT(DISTINCT pay.id) as payment_count
      FROM profiles p
      LEFT JOIN enrollments e ON p.id = e.user_id
      LEFT JOIN test_attempts ta ON p.id = ta.user_id
      LEFT JOIN courses c ON p.id = c.created_by
      LEFT JOIN payments pay ON p.id = pay.user_id
      WHERE p.id = ${id}::uuid
    `;

        const dataCheck = userDataCheck[0];
        const hasCriticalData =
            parseInt(dataCheck.enrollment_count) > 0 ||
            parseInt(dataCheck.test_attempt_count) > 0 ||
            parseInt(dataCheck.courses_created_count) > 0 ||
            parseInt(dataCheck.payment_count) > 0;

        if (hasCriticalData) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete user with existing enrollments, test attempts, courses, or payments. Deactivate instead.',
                data: {
                    enrollments: parseInt(dataCheck.enrollment_count),
                    testAttempts: parseInt(dataCheck.test_attempt_count),
                    coursesCreated: parseInt(dataCheck.courses_created_count),
                    payments: parseInt(dataCheck.payment_count)
                }
            });
        }

        // Delete user from profiles (auth.users will be handled by Supabase)
        await prisma.$queryRaw`DELETE FROM profiles WHERE id = ${id}::uuid`;

        // Log the action
        await logSystemAction(
            'critical',
            `User permanently deleted: ${user[0].display_name}`,
            userId,
            'delete',
            'user_profile',
            id,
            { displayName: user[0].display_name, role: user[0].role }
        );

        res.json({
            success: true,
            message: 'User deleted permanently'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});

// Bulk operations on users
router.post('/bulk-action', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { action, userIds, data = {} } = req.body;
        const userId = req.user.id;

        if (!action || !userIds || !Array.isArray(userIds)) {
            return res.status(400).json({
                success: false,
                error: 'Action and userIds array are required'
            });
        }

        const validActions = ['activate', 'deactivate', 'update_role', 'send_notification'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid action'
            });
        }

        const results = [];
        const errors = [];

        // Process each user
        for (const targetUserId of userIds) {
            try {
                // Check if user exists
                const user = await prisma.$queryRaw`
          SELECT id, display_name, role FROM profiles WHERE id = ${targetUserId}::uuid
        `;

                if (user.length === 0) {
                    errors.push({ userId: targetUserId, error: 'User not found' });
                    continue;
                }

                const userData = user[0];

                switch (action) {
                    case 'activate':
                        await prisma.$queryRaw`
              UPDATE profiles 
              SET deleted_at = NULL, updated_at = NOW()
              WHERE id = ${targetUserId}::uuid
            `;
                        results.push({ userId: targetUserId, action: 'activated' });
                        break;

                    case 'deactivate':
                        await prisma.$queryRaw`
              UPDATE profiles 
              SET deleted_at = NOW(), updated_at = NOW()
              WHERE id = ${targetUserId}::uuid
            `;
                        results.push({ userId: targetUserId, action: 'deactivated' });
                        break;

                    case 'update_role':
                        if (!data.role) {
                            errors.push({ userId: targetUserId, error: 'Role is required for update_role action' });
                            continue;
                        }
                        await prisma.$queryRaw`
              UPDATE profiles 
              SET role = ${data.role}::user_role, updated_at = NOW()
              WHERE id = ${targetUserId}::uuid
            `;
                        results.push({ userId: targetUserId, action: 'role_updated', newRole: data.role });
                        break;

                    case 'send_notification':
                        if (!data.title || !data.body) {
                            errors.push({ userId: targetUserId, error: 'Title and body are required for notifications' });
                            continue;
                        }
                        await prisma.$queryRaw`
              INSERT INTO notifications (user_id, title, body, type, payload)
              VALUES (
                ${targetUserId}::uuid,
                ${data.title},
                ${data.body},
                ${data.type || 'admin'},
                ${JSON.stringify(data.payload || {})}::jsonb
              )
            `;
                        results.push({ userId: targetUserId, action: 'notification_sent' });
                        break;
                }

                // Log individual action
                await logSystemAction(
                    'info',
                    `Bulk ${action} performed on user: ${userData.display_name}`,
                    userId,
                    `bulk_${action}`,
                    'user_profile',
                    targetUserId,
                    { displayName: userData.display_name, bulkAction: action, data }
                );

            } catch (error) {
                console.error(`Error processing user ${targetUserId}:`, error);
                errors.push({
                    userId: targetUserId,
                    error: error.message || 'Unknown error'
                });
            }
        }

        // Log bulk operation summary
        await logSystemAction(
            'info',
            `Bulk operation completed: ${action}`,
            userId,
            'bulk_operation',
            'user_management',
            null,
            {
                action,
                totalUsers: userIds.length,
                successful: results.length,
                failed: errors.length
            }
        );

        res.json({
            success: true,
            message: `Bulk ${action} completed. ${results.length} successful, ${errors.length} failed.`,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error in bulk operation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform bulk operation'
        });
    }
});

// Get user statistics and analytics
router.get('/analytics/overview', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { timeframe = 'month' } = req.query;

        let interval;
        switch (timeframe) {
            case 'week':
                interval = '7 days';
                break;
            case 'month':
                interval = '30 days';
                break;
            case 'quarter':
                interval = '90 days';
                break;
            case 'year':
                interval = '365 days';
                break;
            default:
                interval = '30 days';
        }

        // Get comprehensive user analytics
        const analytics = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN p.deleted_at IS NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN p.deleted_at IS NOT NULL THEN 1 END) as inactive_users,
        COUNT(CASE WHEN au.email_confirmed_at IS NOT NULL THEN 1 END) as verified_users,
        COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '${interval}' THEN 1 END) as new_users_period,
        COUNT(CASE WHEN au.last_sign_in_at >= NOW() - INTERVAL '${interval}' THEN 1 END) as active_users_period,
        COUNT(CASE WHEN p.role = 'student' THEN 1 END) as student_count,
        COUNT(CASE WHEN p.role = 'instructor' THEN 1 END) as instructor_count,
        COUNT(CASE WHEN p.role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN p.role = 'super_admin' THEN 1 END) as super_admin_count
      FROM profiles p
      LEFT JOIN auth.users au ON p.id = au.id
    `;

        // Get user growth over time
        const growthData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', p.created_at) as date,
        COUNT(*) as new_users,
        COUNT(*) OVER (ORDER BY DATE_TRUNC('day', p.created_at)) as cumulative_users
      FROM profiles p
      WHERE p.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY DATE_TRUNC('day', p.created_at)
      ORDER BY date
    `;

        // Get top countries
        const topCountries = await prisma.$queryRaw`
      SELECT 
        p.country,
        COUNT(*) as user_count
      FROM profiles p
      WHERE p.country IS NOT NULL AND p.deleted_at IS NULL
      GROUP BY p.country
      ORDER BY user_count DESC
      LIMIT 10
    `;

        // Get user activity metrics
        const activityMetrics = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT e.user_id) as users_with_enrollments,
        COUNT(DISTINCT ta.user_id) as users_with_test_attempts,
        AVG(e.progress_percent) as avg_course_progress,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.user_id END) as users_completed_courses
      FROM profiles p
      LEFT JOIN enrollments e ON p.id = e.user_id
      LEFT JOIN test_attempts ta ON p.id = ta.user_id
      WHERE p.deleted_at IS NULL
    `;

        res.json({
            success: true,
            analytics: {
                overview: analytics[0],
                growth: growthData,
                topCountries,
                activity: activityMetrics[0],
                timeframe
            }
        });
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user analytics'
        });
    }
});

// Export users data
router.get('/export/csv', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
        const { role, isActive, country } = req.query;
        const userId = req.user.id;

        let whereConditions = [];
        let params = [];

        if (role) {
            whereConditions.push(`p.role = $${params.length + 1}`);
            params.push(role);
        }

        if (isActive !== undefined) {
            whereConditions.push(`(p.deleted_at IS ${isActive === 'true' ? 'NULL' : 'NOT NULL'})`);
        }

        if (country) {
            whereConditions.push(`p.country = $${params.length + 1}`);
            params.push(country);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const users = await prisma.$queryRawUnsafe(`
      SELECT 
        p.id,
        p.display_name,
        p.first_name,
        p.last_name,
        au.email,
        p.phone,
        p.role,
        p.country,
        p.created_at,
        au.last_sign_in_at,
        CASE WHEN p.deleted_at IS NULL THEN 'Active' ELSE 'Inactive' END as status,
        CASE WHEN au.email_confirmed_at IS NOT NULL THEN 'Verified' ELSE 'Unverified' END as verification_status
      FROM profiles p
      LEFT JOIN auth.users au ON p.id = au.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, ...params);

        // Log export action
        await logSystemAction(
            'info',
            `User data exported (${users.length} users)`,
            userId,
            'export',
            'user_data',
            null,
            { userCount: users.length, filters: { role, isActive, country } }
        );

        res.json({
            success: true,
            users,
            exportedAt: new Date().toISOString(),
            totalRecords: users.length
        });
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export users'
        });
    }
});

module.exports = router;
