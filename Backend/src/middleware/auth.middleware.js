/**
 * Authentication Middleware for Project_Neutron LMS
 */

const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../lib/supabase.service');
const prisma = require('../lib/database.service');

/**
 * Middleware to authenticate JWT tokens
 */
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Access token required',
                message: 'Please provide a valid authentication token'
            });
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({
                error: 'Invalid token',
                message: 'The provided token is invalid or expired'
            });
        }

        // Get user profile from our database
        const profile = await prisma.profiles.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                display_name: true,
                first_name: true,
                last_name: true,
                role: true,
                phone: true,
                country: true,
                created_at: true,
                updated_at: true
            }
        });

        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found',
                message: 'User profile does not exist in our system'
            });
        }

        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email,
            emailConfirmed: user.email_confirmed_at !== null,
            createdAt: user.created_at,
            profile
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Authentication failed',
            message: 'An error occurred during authentication'
        });
    }
}

/**
 * Middleware to check if user has required role
 */
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.profile) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please authenticate to access this resource'
            });
        }

        const userRole = req.user.profile.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
}

/**
 * Middleware to check if user is admin or super_admin
 */
const requireAdmin = requireRole(['admin', 'super_admin']);

/**
 * Middleware to check if user is instructor, admin, or super_admin
 */
const requireInstructor = requireRole(['instructor', 'admin', 'super_admin']);

/**
 * Middleware to check if user is super_admin
 */
const requireSuperAdmin = requireRole(['super_admin']);

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireInstructor,
    requireSuperAdmin
};
