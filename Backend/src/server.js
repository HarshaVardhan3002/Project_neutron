/**
 * Project_Neutron LMS Backend API
 * Main server entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const coursesRoutes = require('./routes/courses.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');
const testsRoutes = require('./routes/tests.routes');
const progressRoutes = require('./routes/progress.routes');
const profileRoutes = require('./routes/profile.routes');
const adminRoutes = require('./routes/admin.routes');
const themesRoutes = require('./routes/themes.routes');
const websiteContentRoutes = require('./routes/website-content.routes');
const testBuilderRoutes = require('./routes/test-builder.routes');
const courseBuilderRoutes = require('./routes/course-builder.routes');
const userManagementRoutes = require('./routes/user-management.routes');
const aiRoutes = require('./routes/ai.routes');
const healthRoutes = require('./routes/health.routes');

// Import middleware
const { authenticateToken } = require('./middleware/auth.middleware');
const { errorHandler } = require('./middleware/error-handler.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Project_Neutron LMS API'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', authenticateToken, enrollmentsRoutes);
app.use('/api/tests', authenticateToken, testsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/website-content', websiteContentRoutes);
app.use('/api/test-builder', testBuilderRoutes);
app.use('/api/course-builder', courseBuilderRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Project_Neutron LMS API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;