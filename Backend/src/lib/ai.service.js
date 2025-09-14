const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('../../generated/prisma');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();

class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Rate limiting configuration
        this.rateLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 50, // limit each user to 50 requests per windowMs
            message: 'Too many AI requests, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
    }

    /**
     * Generate AI response with context and chain of thought
     */
    async generateResponse(prompt, context = {}, userId = null) {
        try {
            // Build context-aware prompt
            const contextualPrompt = this.buildContextualPrompt(prompt, context);

            // Generate response
            const result = await this.model.generateContent(contextualPrompt);
            const response = await result.response;
            const text = response.text();

            // Count tokens (approximate)
            const tokensUsed = this.estimateTokens(contextualPrompt + text);

            // Log usage if user provided
            if (userId) {
                await this.logAIUsage(userId, 'gemini-pro', tokensUsed, context);
            }

            return {
                response: text,
                tokensUsed,
                model: 'gemini-pro'
            };
        } catch (error) {
            console.error('AI Service Error:', error);
            throw new Error('Failed to generate AI response');
        }
    }

    /**
     * Build contextual prompt with chain of thought
     */
    buildContextualPrompt(userPrompt, context) {
        let systemPrompt = `You are an AI tutor for an English language learning platform specializing in IELTS, TOEFL, PTE, and GRE preparation. 

CONTEXT INFORMATION:
- Platform: Project Neutron LMS
- Focus: English language proficiency and test preparation
- User Level: ${context.userLevel || 'Intermediate'}
- Test Type: ${context.testType || 'General English'}
- Current Topic: ${context.currentTopic || 'General'}

CHAIN OF THOUGHT APPROACH:
1. First, understand what the user is asking
2. Consider their proficiency level and test goals
3. Provide accurate, helpful information
4. Include practical examples when relevant
5. Suggest next steps or practice activities

RESPONSE GUIDELINES:
- Be encouraging and supportive
- Provide clear, actionable advice
- Use examples relevant to English proficiency tests
- Keep responses concise but comprehensive
- If unsure, ask clarifying questions

`;

        // Add specific context based on type
        if (context.contextType === 'test') {
            systemPrompt += `
TEST CONTEXT:
- Test Name: ${context.testName || 'Unknown'}
- User's Recent Score: ${context.recentScore || 'Not available'}
- Areas for Improvement: ${context.weakAreas?.join(', ') || 'General improvement needed'}
- Strengths: ${context.strengths?.join(', ') || 'To be determined'}

Focus on providing specific feedback and improvement strategies.
`;
        } else if (context.contextType === 'course') {
            systemPrompt += `
COURSE CONTEXT:
- Course: ${context.courseName || 'Unknown'}
- Current Module: ${context.currentModule || 'Unknown'}
- Progress: ${context.progress || 0}%

Help the user with course-related questions and provide guidance on their learning path.
`;
        } else if (context.contextType === 'lesson') {
            systemPrompt += `
LESSON CONTEXT:
- Lesson: ${context.lessonName || 'Unknown'}
- Lesson Type: ${context.lessonType || 'Unknown'}
- Difficulty: ${context.difficulty || 'Intermediate'}

Provide specific help related to this lesson content.
`;
        }

        return `${systemPrompt}

USER QUESTION: ${userPrompt}

Please provide a helpful response following the chain of thought approach outlined above.`;
    }

    /**
     * Analyze test performance and provide improvement suggestions
     */
    async analyzeTestPerformance(testAttemptId, userId) {
        try {
            // Get test attempt details
            const testAttempt = await prisma.$queryRaw`
        SELECT 
          ta.id,
          ta.total_score,
          ta.max_score,
          ta.duration_seconds,
          ta.review,
          t.title as test_title,
          t.kind as test_kind,
          t.metadata as test_metadata,
          c.test_type,
          c.difficulty
        FROM test_attempts ta
        JOIN tests t ON ta.test_id = t.id
        LEFT JOIN courses c ON t.course_id = c.id
        WHERE ta.id = ${testAttemptId}::uuid AND ta.user_id = ${userId}::uuid
      `;

            if (testAttempt.length === 0) {
                throw new Error('Test attempt not found');
            }

            const attempt = testAttempt[0];
            const scorePercentage = (attempt.total_score / attempt.max_score) * 100;

            // Get question responses for detailed analysis
            const responses = await prisma.$queryRaw`
        SELECT 
          qr.question_id,
          qr.answer,
          qr.is_correct,
          qr.points_awarded,
          q.stem,
          q.kind,
          q.points as max_points,
          q.metadata
        FROM question_responses qr
        JOIN questions q ON qr.question_id = q.id
        WHERE qr.attempt_id = ${testAttemptId}::uuid
        ORDER BY q.order_index
      `;

            // Analyze performance by question type
            const performanceByType = this.analyzePerformanceByType(responses);

            // Generate AI analysis
            const analysisPrompt = this.buildTestAnalysisPrompt(attempt, responses, performanceByType, scorePercentage);

            const aiResponse = await this.generateResponse(analysisPrompt, {
                contextType: 'test',
                testName: attempt.test_title,
                recentScore: scorePercentage,
                testType: attempt.test_type,
                weakAreas: performanceByType.weakAreas,
                strengths: performanceByType.strengths
            }, userId);

            // Parse AI response to extract structured data
            const analysisData = this.parseTestAnalysis(aiResponse.response, performanceByType, scorePercentage);

            // Save analysis to database
            const savedAnalysis = await prisma.$queryRaw`
        INSERT INTO ai_test_analysis (
          test_attempt_id, 
          user_id, 
          analysis_type, 
          analysis_content, 
          suggestions, 
          model_used, 
          tokens_used
        )
        VALUES (
          ${testAttemptId}::uuid,
          ${userId}::uuid,
          'performance',
          ${JSON.stringify(analysisData)}::jsonb,
          ${JSON.stringify(analysisData.suggestions)}::jsonb,
          'gemini-pro',
          ${aiResponse.tokensUsed}
        )
        RETURNING id
      `;

            return {
                analysisId: savedAnalysis[0].id,
                analysis: analysisData,
                aiResponse: aiResponse.response,
                tokensUsed: aiResponse.tokensUsed
            };

        } catch (error) {
            console.error('Test Analysis Error:', error);
            throw new Error('Failed to analyze test performance');
        }
    }

    /**
     * Create or continue AI chat session
     */
    async handleChatMessage(userId, message, sessionId = null, context = {}) {
        try {
            let session;

            if (sessionId) {
                // Get existing session
                const existingSession = await prisma.$queryRaw`
          SELECT id, title, context_type, context_id, metadata
          FROM ai_chat_sessions 
          WHERE id = ${sessionId}::uuid AND user_id = ${userId}::uuid
        `;

                if (existingSession.length === 0) {
                    throw new Error('Chat session not found');
                }
                session = existingSession[0];
            } else {
                // Create new session
                const newSession = await prisma.$queryRaw`
          INSERT INTO ai_chat_sessions (user_id, title, context_type, context_id, metadata)
          VALUES (
            ${userId}::uuid,
            ${this.generateSessionTitle(message)},
            ${context.contextType || 'general'},
            ${context.contextId || null}::uuid,
            ${JSON.stringify(context)}::jsonb
          )
          RETURNING id, title, context_type, context_id, metadata
        `;
                session = newSession[0];
                sessionId = session.id;
            }

            // Save user message
            await prisma.$queryRaw`
        INSERT INTO ai_chat_messages (session_id, role, content)
        VALUES (${sessionId}::uuid, 'user', ${message})
      `;

            // Get recent conversation history for context
            const recentMessages = await prisma.$queryRaw`
        SELECT role, content, created_at
        FROM ai_chat_messages
        WHERE session_id = ${sessionId}::uuid
        ORDER BY created_at DESC
        LIMIT 10
      `;

            // Build conversation context
            const conversationContext = this.buildConversationContext(recentMessages.reverse(), session);

            // Generate AI response
            const aiResponse = await this.generateResponse(message, conversationContext, userId);

            // Save AI response
            await prisma.$queryRaw`
        INSERT INTO ai_chat_messages (session_id, role, content, tokens_used, model_used)
        VALUES (
          ${sessionId}::uuid, 
          'assistant', 
          ${aiResponse.response},
          ${aiResponse.tokensUsed},
          'gemini-pro'
        )
      `;

            // Update session timestamp
            await prisma.$queryRaw`
        UPDATE ai_chat_sessions 
        SET updated_at = NOW()
        WHERE id = ${sessionId}::uuid
      `;

            return {
                sessionId,
                message: aiResponse.response,
                tokensUsed: aiResponse.tokensUsed
            };

        } catch (error) {
            console.error('Chat Message Error:', error);
            throw new Error('Failed to process chat message');
        }
    }

    /**
     * Helper methods
     */
    analyzePerformanceByType(responses) {
        const typeStats = {};
        const weakAreas = [];
        const strengths = [];

        responses.forEach(response => {
            const type = response.kind;
            if (!typeStats[type]) {
                typeStats[type] = { correct: 0, total: 0, points: 0, maxPoints: 0 };
            }

            typeStats[type].total++;
            typeStats[type].maxPoints += response.max_points;
            typeStats[type].points += response.points_awarded;

            if (response.is_correct) {
                typeStats[type].correct++;
            }
        });

        // Identify weak areas and strengths
        Object.entries(typeStats).forEach(([type, stats]) => {
            const accuracy = stats.correct / stats.total;
            const scorePercentage = stats.points / stats.maxPoints;

            if (accuracy < 0.6 || scorePercentage < 0.6) {
                weakAreas.push(type);
            } else if (accuracy > 0.8 && scorePercentage > 0.8) {
                strengths.push(type);
            }
        });

        return { typeStats, weakAreas, strengths };
    }

    buildTestAnalysisPrompt(attempt, responses, performanceByType, scorePercentage) {
        return `Analyze this test performance and provide detailed feedback:

TEST DETAILS:
- Test: ${attempt.test_title}
- Type: ${attempt.test_type || 'General'}
- Score: ${attempt.total_score}/${attempt.max_score} (${scorePercentage.toFixed(1)}%)
- Duration: ${Math.round(attempt.duration_seconds / 60)} minutes
- Total Questions: ${responses.length}

PERFORMANCE BY QUESTION TYPE:
${Object.entries(performanceByType.typeStats).map(([type, stats]) =>
            `- ${type}: ${stats.correct}/${stats.total} correct (${((stats.correct / stats.total) * 100).toFixed(1)}%)`
        ).join('\n')}

WEAK AREAS: ${performanceByType.weakAreas.join(', ') || 'None identified'}
STRENGTHS: ${performanceByType.strengths.join(', ') || 'None identified'}

Please provide:
1. Overall performance assessment
2. Specific areas for improvement
3. Actionable study recommendations
4. Practice suggestions
5. Motivational feedback

Format your response as a comprehensive analysis that will help the student improve.`;
    }

    parseTestAnalysis(aiResponse, performanceByType, scorePercentage) {
        // Extract structured data from AI response
        // This is a simplified version - you might want to use more sophisticated parsing

        const suggestions = [];
        const lines = aiResponse.split('\n');

        lines.forEach(line => {
            if (line.includes('practice') || line.includes('study') || line.includes('improve')) {
                suggestions.push(line.trim());
            }
        });

        return {
            overallScore: scorePercentage,
            performanceByType: performanceByType.typeStats,
            weakAreas: performanceByType.weakAreas,
            strengths: performanceByType.strengths,
            aiAnalysis: aiResponse,
            suggestions: suggestions.slice(0, 5), // Top 5 suggestions
            generatedAt: new Date().toISOString()
        };
    }

    buildConversationContext(messages, session) {
        const context = {
            contextType: session.context_type,
            conversationHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
            ...session.metadata
        };

        return context;
    }

    generateSessionTitle(firstMessage) {
        // Generate a title from the first message (first 50 characters)
        return firstMessage.length > 50
            ? firstMessage.substring(0, 47) + '...'
            : firstMessage;
    }

    estimateTokens(text) {
        // Rough estimation: 1 token ≈ 4 characters for English
        return Math.ceil(text.length / 4);
    }

    async logAIUsage(userId, model, tokensUsed, context) {
        try {
            await prisma.$queryRaw`
        INSERT INTO ai_usage (user_id, model, tokens_used, cost_cents, metadata)
        VALUES (
          ${userId}::uuid,
          ${model},
          ${tokensUsed},
          ${Math.ceil(tokensUsed * 0.001)}, -- Rough cost estimation
          ${JSON.stringify(context)}::jsonb
        )
      `;
        } catch (error) {
            console.error('Failed to log AI usage:', error);
        }
    }
}

module.exports = new AIService();
