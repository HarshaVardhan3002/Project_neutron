const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

/**
 * Log system actions to the database
 * @param {string} level - Log level: 'info', 'warning', 'error', 'critical'
 * @param {string} message - Log message
 * @param {string} userId - User ID who performed the action (optional)
 * @param {string} action - Action performed (optional)
 * @param {string} resourceType - Type of resource affected (optional)
 * @param {string} resourceId - ID of resource affected (optional)
 * @param {object} metadata - Additional metadata (optional)
 * @returns {Promise<string>} - Returns the log ID
 */
async function logSystemAction(
    level,
    message,
    userId = null,
    action = null,
    resourceType = null,
    resourceId = null,
    metadata = {}
) {
    try {
        const logEntry = await prisma.$queryRaw`
      INSERT INTO system_logs (level, message, user_id, action, resource_type, resource_id, metadata)
      VALUES (
        ${level}, 
        ${message}, 
        ${userId ? userId : null}::uuid, 
        ${action}, 
        ${resourceType}, 
        ${resourceId ? resourceId : null}::uuid, 
        ${JSON.stringify(metadata)}::jsonb
      )
      RETURNING id
    `;

        return logEntry[0].id;
    } catch (error) {
        console.error('Error logging system action:', error);
        // Don't throw error to avoid breaking the main operation
        return null;
    }
}

/**
 * Get system logs with filtering and pagination
 * @param {object} filters - Filter options
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 50)
 * @returns {Promise<object>} - Returns logs and pagination info
 */
async function getSystemLogs(filters = {}, page = 1, limit = 50) {
    try {
        const offset = (page - 1) * limit;
        const {
            level,
            userId,
            action,
            resourceType,
            startDate,
            endDate
        } = filters;

        let whereConditions = [];
        let params = [];

        if (level) {
            whereConditions.push(`level = $${params.length + 1}`);
            params.push(level);
        }

        if (userId) {
            whereConditions.push(`user_id = $${params.length + 1}::uuid`);
            params.push(userId);
        }

        if (action) {
            whereConditions.push(`action = $${params.length + 1}`);
            params.push(action);
        }

        if (resourceType) {
            whereConditions.push(`resource_type = $${params.length + 1}`);
            params.push(resourceType);
        }

        if (startDate) {
            whereConditions.push(`created_at >= $${params.length + 1}::timestamptz`);
            params.push(startDate);
        }

        if (endDate) {
            whereConditions.push(`created_at <= $${params.length + 1}::timestamptz`);
            params.push(endDate);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM system_logs sl
      LEFT JOIN profiles p ON sl.user_id = p.id
      ${whereClause}
    `;

        const totalResult = await prisma.$queryRawUnsafe(countQuery, ...params);
        const total = parseInt(totalResult[0].total);

        // Get logs with user information
        const logsQuery = `
      SELECT 
        sl.id,
        sl.level,
        sl.message,
        sl.user_id,
        sl.action,
        sl.resource_type,
        sl.resource_id,
        sl.ip_address,
        sl.user_agent,
        sl.created_at,
        sl.metadata,
        p.display_name as user_name,
        p.role as user_role
      FROM system_logs sl
      LEFT JOIN profiles p ON sl.user_id = p.id
      ${whereClause}
      ORDER BY sl.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(limit, offset);
        const logs = await prisma.$queryRawUnsafe(logsQuery, ...params);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        console.error('Error fetching system logs:', error);
        throw error;
    }
}

/**
 * Get log statistics for dashboard
 * @param {string} timeframe - 'day', 'week', 'month'
 * @returns {Promise<object>} - Returns log statistics
 */
async function getLogStatistics(timeframe = 'week') {
    try {
        let interval;
        switch (timeframe) {
            case 'day':
                interval = '1 day';
                break;
            case 'week':
                interval = '7 days';
                break;
            case 'month':
                interval = '30 days';
                break;
            default:
                interval = '7 days';
        }

        const stats = await prisma.$queryRaw`
      SELECT 
        level,
        COUNT(*) as count
      FROM system_logs 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY level
      ORDER BY count DESC
    `;

        const recentActivity = await prisma.$queryRaw`
      SELECT 
        sl.level,
        sl.message,
        sl.action,
        sl.resource_type,
        sl.created_at,
        p.display_name as user_name
      FROM system_logs sl
      LEFT JOIN profiles p ON sl.user_id = p.id
      WHERE sl.created_at >= NOW() - INTERVAL '${interval}'
      ORDER BY sl.created_at DESC
      LIMIT 10
    `;

        const errorCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM system_logs 
      WHERE level IN ('error', 'critical') 
      AND created_at >= NOW() - INTERVAL '${interval}'
    `;

        return {
            levelStats: stats,
            recentActivity,
            errorCount: parseInt(errorCount[0].count),
            timeframe
        };
    } catch (error) {
        console.error('Error fetching log statistics:', error);
        throw error;
    }
}

module.exports = {
    logSystemAction,
    getSystemLogs,
    getLogStatistics
};
