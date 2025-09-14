const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticateToken } = require('../middleware/auth.middleware');
const aiService = require('../lib/ai.service');
const { logSystemAction } = require('../lib/logging.service');

const router = express.Router();
const prisma = new PrismaClient();

// Apply rate limiting to all AI routes
router.use(aiService.rateLimiter);

// Start new chat session or send message
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, sessionId, context = {} } = req.body;
        const userId = req.user.id;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                success: false,
                error: 'Message too long. Please keep it under 2000 characters.'
            });
        }

        const result = await aiService.handleChatMessage(userId, message, sessionId, context);

        // Log the interaction
        await logSystemAction(
            'info',
            'AI chat interaction',
            userId,
            'ai_chat',
            'ai_chat_session',
            result.sessionId,
            { tokensUsed: result.tokensUsed, hasContext: !!sessionId }
        );

        res.json({
            success: true,
            sessionId: result.sessionId,
            message: result.message,
            tokensUsed: result.tokensUsed
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message'
        });
    }
});

// Get user's chat sessions
router.get('/chat/sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const sessions = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.title,
        s.context_type,
        s.context_id,
        s.created_at,
        s.updated_at,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at
      FROM ai_chat_sessions s
      LEFT JOIN ai_chat_messages m ON s.id = m.session_id
      WHERE s.user_id = ${userId}::uuid
      GROUP BY s.id, s.title, s.context_type, s.context_id, s.created_at, s.updated_at
      ORDER BY s.updated_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

        const totalResult = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM ai_chat_sessions
      WHERE user_id = ${userId}::uuid
    `;

        res.json({
            success: true,
            sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(totalResult[0].total),
                totalPages: Math.ceil(parseInt(totalResult[0].total) / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chat sessions'
        });
    }
});

// Get messages from a specific chat session
router.get('/chat/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Verify session belongs to user
        const session = await prisma.$queryRaw`
      SELECT id FROM ai_chat_sessions 
      WHERE id = ${sessionId}::uuid AND user_id = ${userId}::uuid
    `;

        if (session.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Chat session not found'
            });
        }

        const messages = await prisma.$queryRaw`
      SELECT 
        id,
        role,
        content,
        tokens_used,
        model_used,
        created_at
      FROM ai_chat_messages
      WHERE session_id = ${sessionId}::uuid
      ORDER BY created_at ASC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chat messages'
        });
    }
});

// Delete chat session
router.delete('/chat/sessions/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Verify session belongs to user
        const session = await prisma.$queryRaw`
      SELECT id, title FROM ai_chat_sessions 
      WHERE id = ${sessionId}::uuid AND user_id = ${userId}::uuid
    `;

        if (session.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Chat session not found'
            });
        }

        // Delete session (messages will be cascade deleted)
        await prisma.$queryRaw`
      DELETE FROM ai_chat_sessions WHERE id = ${sessionId}::uuid
    `;

        // Log the action
        await logSystemAction(
            'info',
            `AI chat session deleted: ${session[0].title}`,
            userId,
            'delete',
            'ai_chat_session',
            sessionId,
            { sessionTitle: session[0].title }
        );

        res.json({
            success: true,
            message: 'Chat session deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete chat session'
        });
    }
});

// Analyze test performance
router.post('/analyze-test/:testAttemptId', authenticateToken, async (req, res) => {
    try {
        const { testAttemptId } = req.params;
        const userId = req.user.id;

        // Check if analysis already exists
        const existingAnalysis = await prisma.$queryRaw`
      SELECT id, analysis_content, suggestions, created_at
      FROM ai_test_analysis
      WHERE test_attempt_id = ${testAttemptId}::uuid AND user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT 1
    `;

        if (existingAnalysis.length > 0) {
            // Return existing analysis if it's less than 24 hours old
            const analysisAge = Date.now() - new Date(existingAnalysis[0].created_at).getTime();
            if (analysisAge < 24 * 60 * 60 * 1000) { // 24 hours
                return res.json({
                    success: true,
                    analysis: existingAnalysis[0].analysis_content,
                    suggestions: existingAnalysis[0].suggestions,
                    cached: true,
                    createdAt: existingAnalysis[0].created_at
                });
            }
        }

        // Generate new analysis
        const result = await aiService.analyzeTestPerformance(testAttemptId, userId);

        // Log the action
        await logSystemAction(
            'info',
            'AI test analysis generated',
            userId,
            'ai_analysis',
            'test_attempt',
            testAttemptId,
            { analysisId: result.analysisId, tokensUsed: result.tokensUsed }
        );

        res.json({
            success: true,
            analysisId: result.analysisId,
            analysis: result.analysis,
            aiResponse: result.aiResponse,
            tokensUsed: result.tokensUsed,
            cached: false
        });
    } catch (error) {
        console.error('Test Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze test performance'
        });
    }
});

// Get user's test analyses
router.get('/test-analyses', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const analyses = await prisma.$queryRaw`
      SELECT 
        ata.id,
        ata.analysis_type,
        ata.analysis_content,
        ata.suggestions,
        ata.created_at,
        ta.total_score,
        ta.max_score,
        t.title as test_title,
        t.kind as test_kind
      FROM ai_test_analysis ata
      JOIN test_attempts ta ON ata.test_attempt_id = ta.id
      JOIN tests t ON ta.test_id = t.id
      WHERE ata.user_id = ${userId}::uuid
      ORDER BY ata.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

        const totalResult = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM ai_test_analysis
      WHERE user_id = ${userId}::uuid
    `;

        res.json({
            success: true,
            analyses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(totalResult[0].total),
                totalPages: Math.ceil(parseInt(totalResult[0].total) / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching test analyses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch test analyses'
        });
    }
});

// Get AI usage statistics (for admins)
router.get('/usage-stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { timeframe = 'month' } = req.query;

        // Check if user is admin
        const user = await prisma.$queryRaw`
      SELECT role FROM profiles WHERE id = ${userId}::uuid
    `;

        const isAdmin = user[0]?.role === 'admin' || user[0]?.role === 'super_admin';

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
            default:
                interval = '30 days';
        }

        let whereClause = '';
        let params = [];

        if (!isAdmin) {
            whereClause = 'WHERE user_id = $1';
            params.push(userId);
        }

        const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(tokens_used) as total_tokens,
        SUM(cost_cents) as total_cost_cents,
        AVG(tokens_used) as avg_tokens_per_request,
        COUNT(DISTINCT user_id) as unique_users,
        model,
        DATE_TRUNC('day', recorded_at) as date
      FROM ai_usage
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} recorded_at >= NOW() - INTERVAL '${interval}'
      GROUP BY model, DATE_TRUNC('day', recorded_at)
      ORDER BY date DESC
    `, ...params);

        res.json({
            success: true,
            stats,
            timeframe,
            isAdmin
        });
    } catch (error) {
        console.error('Error fetching AI usage stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch AI usage statistics'
        });
    }
});

module.exports = router;
