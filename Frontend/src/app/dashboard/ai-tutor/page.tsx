'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Brain,
    MessageSquare,
    Target,
    BookOpen,
    TrendingUp,
    Zap
} from 'lucide-react';
import AIChat from '@/components/ai/AIChat';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const AI_FEATURES = [
    {
        icon: MessageSquare,
        title: 'General Q&A',
        description: 'Ask any questions about English learning, grammar, vocabulary, or test strategies.',
        color: 'bg-blue-500'
    },
    {
        icon: Target,
        title: 'Test Analysis',
        description: 'Get detailed analysis of your test performance with personalized improvement suggestions.',
        color: 'bg-green-500'
    },
    {
        icon: BookOpen,
        title: 'Study Guidance',
        description: 'Receive customized study plans and learning recommendations based on your progress.',
        color: 'bg-purple-500'
    },
    {
        icon: TrendingUp,
        title: 'Progress Tracking',
        description: 'Monitor your improvement over time with AI-powered insights and analytics.',
        color: 'bg-orange-500'
    }
];

const QUICK_PROMPTS = [
    "How can I improve my IELTS writing score?",
    "What are the best strategies for TOEFL reading section?",
    "Explain the difference between present perfect and past simple",
    "Give me tips for PTE speaking section",
    "How to manage time during GRE verbal reasoning?",
    "What are common grammar mistakes to avoid?",
    "Help me with essay structure for academic writing",
    "Suggest vocabulary building techniques"
];

function AITutorContent() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Tutor</h1>
                        <p className="text-muted-foreground">
                            Your personal AI assistant for English learning and test preparation
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Powered by Gemini AI
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Features */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">AI Capabilities</CardTitle>
                            <CardDescription>
                                What your AI tutor can help you with
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {AI_FEATURES.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={`${feature.color} p-2 rounded-lg flex-shrink-0`}>
                                        <feature.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">{feature.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Start</CardTitle>
                            <CardDescription>
                                Try these popular questions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {QUICK_PROMPTS.slice(0, 6).map((prompt, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left p-2 text-xs rounded-lg border hover:bg-muted/50 transition-colors"
                                        onClick={() => {
                                            // This would trigger the chat with the prompt
                                            // Implementation would depend on how you want to handle this
                                            console.log('Quick prompt:', prompt);
                                        }}
                                    >
                                        "{prompt}"
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Smart Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Remembers your conversation history</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Adapts to your learning level</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Provides personalized feedback</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Suggests improvement strategies</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* AI Chat Interface */}
                <div className="lg:col-span-2">
                    <AIChat
                        context={{
                            contextType: 'general',
                            userLevel: 'intermediate', // This could be dynamic based on user data
                            testType: 'IELTS' // This could be based on user's current course/goal
                        }}
                        className="h-[600px]"
                    />
                </div>
            </div>

            {/* Usage Tips */}
            <Card>
                <CardHeader>
                    <CardTitle>Tips for Better AI Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Be Specific</h4>
                            <p className="text-xs text-muted-foreground">
                                Ask detailed questions about specific topics or problems you're facing.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Provide Context</h4>
                            <p className="text-xs text-muted-foreground">
                                Mention your target test, current level, or specific areas you want to improve.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Ask Follow-ups</h4>
                            <p className="text-xs text-muted-foreground">
                                Don't hesitate to ask for clarification or more examples if needed.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Practice Together</h4>
                            <p className="text-xs text-muted-foreground">
                                Use the AI to practice conversations, get feedback on writing, or test your knowledge.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AITutorPage() {
    return (
        <ProtectedRoute>
            <AITutorContent />
        </ProtectedRoute>
    );
}