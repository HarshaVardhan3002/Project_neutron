/**
 * Authentication Routes for Project_Neutron LMS
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { supabaseAdmin, supabasePublic } = require('../lib/supabase.service');
const prisma = require('../lib/database.service');
const { asyncHandler, AppError } = require('../middleware/error-handler.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', asyncHandler(async (req, res) => {
    const { email, password, displayName, phone } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (authError) {
        throw new AppError(authError.message, 400);
    }

    try {
        // Create user profile in our database
        const profile = await prisma.profiles.create({
            data: {
                id: authData.user.id,
                email,
                display_name: displayName || null,
                phone: phone || null,
                role: 'student',
                created_at: new Date(),
                updated_at: new Date()
            },
            select: {
                id: true,
                email: true,
                display_name: true,
                role: true,
                created_at: true
            }
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                profile
            }
        });
    } catch (error) {
        // If profile creation fails, clean up the auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw error;
    }
}));

/**
 * POST /api/auth/signin
 * Sign in user
 */
router.post('/signin', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    // Sign in with Supabase
    const { data, error } = await supabasePublic.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new AppError('Invalid credentials', 401);
    }

    // Get user profile
    const profile = await prisma.profiles.findUnique({
        where: { id: data.user.id },
        select: {
            id: true,
            email: true,
            display_name: true,
            role: true,
            created_at: true
        }
    });

    if (!profile) {
        throw new AppError('User profile not found', 404);
    }

    res.json({
        message: 'Sign in successful',
        user: data.user,
        profile,
        session: data.session
    });
}));

/**
 * POST /api/auth/signout
 * Sign out user
 */
router.post('/signout', authenticateToken, asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin.auth.admin.signOut(req.user.id);

    if (error) {
        throw new AppError('Sign out failed', 500);
    }

    res.json({ message: 'Signed out successfully' });
}));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
    const profile = await prisma.profiles.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            displayName: true,
            phone: true,
            role: true,
            locale: true,
            timezone: true,
            bio: true,
            avatarS3Key: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!profile) {
        throw new AppError('Profile not found', 404);
    }

    res.json({ profile });
}));

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError('Email is required', 400);
    }

    const { error } = await supabasePublic.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`
    });

    if (error) {
        throw new AppError('Failed to send reset email', 500);
    }

    res.json({ message: 'Password reset email sent' });
}));

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new AppError('Token and new password are required', 400);
    }

    if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Verify and update password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        token, // This would need to be extracted from the reset token
        { password }
    );

    if (error) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    res.json({ message: 'Password reset successful' });
}));

/**
 * PUT /api/auth/update-profile
 * Update user profile
 */
router.put('/update-profile', authenticateToken, asyncHandler(async (req, res) => {
    const { displayName, phone, bio, timezone, locale } = req.body;

    const updatedProfile = await prisma.profiles.update({
        where: { id: req.user.id },
        data: {
            displayName: displayName || undefined,
            phone: phone || undefined,
            bio: bio || undefined,
            timezone: timezone || undefined,
            locale: locale || undefined,
            updatedAt: new Date()
        },
        select: {
            id: true,
            email: true,
            displayName: true,
            phone: true,
            role: true,
            locale: true,
            timezone: true,
            bio: true,
            avatarS3Key: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile
    });
}));

module.exports = router;
