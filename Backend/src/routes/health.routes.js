const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
const prisma = new PrismaClient();

// Basic health check
router.get('/', async (req, res) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                api: 'healthy',
                database: 'unknown',
                supabase: 'unknown',
                ai: 'unknown'
            },
            version: '1.0.0'
        };

        // Test database connection
        try {
            await prisma.$queryRaw`SELECT 1 as test`;
            healthStatus.services.database = 'healthy';
        } catch (error) {
            healthStatus.services.database = 'unhealthy';
            healthStatus.status = 'degraded';
        }

        // Test Supabase connection
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
            const { data, error } = await supabase.auth.getSession();
            if (error && error.message !== 'Auth session missing!') {
                throw error;
            }
            healthStatus.services.supabase = 'healthy';
        } catch (error) {
            healthStatus.services.supabase = 'unhealthy';
            healthStatus.status = 'degraded';
        }

        // Test AI service
        try {
            if (process.env.GEMINI_API_KEY) {
                healthStatus.services.ai = 'configured';
            } else {
                healthStatus.services.ai = 'not_configured';
            }
        } catch (error) {
            healthStatus.services.ai = 'unhealthy';
        }

        res.json(healthStatus);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
    res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
        server: 'Project Neutron LMS Backend',
        status: 'online'
    });
});

// Detailed system info (for debugging)
router.get('/detailed', async (req, res) => {
    try {
        const systemInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: {
                status: 'unknown',
                tables: []
            },
            supabase: {
                status: 'unknown',
                buckets: []
            },
            configuration: {
                hasJwtSecret: !!process.env.JWT_SECRET,
                hasSupabaseUrl: !!process.env.SUPABASE_URL,
                hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
                hasGeminiKey: !!process.env.GEMINI_API_KEY,
                port: process.env.PORT || 3001,
                frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
            }
        };

        // Get database table info
        try {
            const tables = await prisma.$queryRaw`
                SELECT table_name, table_type 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            `;
            systemInfo.database.status = 'connected';
            systemInfo.database.tables = tables.map(t => t.table_name);
        } catch (error) {
            systemInfo.database.status = 'error';
            systemInfo.database.error = error.message;
        }

        // Get Supabase storage info
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
            const { data: buckets, error } = await supabase.storage.listBuckets();
            if (error) throw error;
            systemInfo.supabase.status = 'connected';
            systemInfo.supabase.buckets = buckets.map(b => ({
                name: b.name,
                public: b.public,
                created_at: b.created_at
            }));
        } catch (error) {
            systemInfo.supabase.status = 'error';
            systemInfo.supabase.error = error.message;
        }

        res.json(systemInfo);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get system information',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
