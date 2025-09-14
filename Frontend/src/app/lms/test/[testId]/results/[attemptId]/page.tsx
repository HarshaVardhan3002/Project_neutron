'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Award,
    ArrowLeft,
    BarChart3,
    Loader2,
    Trophy,
    Target,
    TrendingUp,
    TrendingDown,
    Medal,
    Star,
    BookOpen,
    RotateCcw,
    Share2,
    Download,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Info,
    AlertTriangle,
    Lightbulb
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface QuestionResult {
    question: {
        id: string;
        stem: string;
        kind: string;
        points: number;
        correctOptions?: Array<{
            id: string;
            optionText: string;
        }>;
        explanation?: string;
    };
    response: {
        answer: any;
        isCorrect: boolean | null;
        pointsAwarded: number;
    } | null;
}

interface TestResults {
    attempt: {
        id: string;
        startedAt: string;
        submittedAt: string;
        totalScore: number;
        maxScore: number;
        percentage: number;
        passed: boolean;
        durationSeconds: number;
        rank?: number;
        percentile?: number;
    };
    test: {
        title: string;
        description: string;
        passingScore: number;
        course?: {
            title: string;
            instructor: string;
        };
    };
    questionResults: QuestionResult[];
    aiFeedback?: {
        overallFeedback: string;
        strengths: string[];
        improvements: string[];
        recommendations: string[];
        scoreBreakdown: {
            category: string;
            score: number;
            maxScore: number;
        }[];
    };
    classStats?: {
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        totalAttempts: number;
    };
}

function TestResultsContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const testId = params.testId as string;
    const attemptId = params.attemptId as string;

    const [results, setResults] = useState<TestResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDetailedReview, setShowDetailedReview] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (testId && attemptId && user) {
            loadTestResults();
        }
    }, [testId, attemptId, user]);

    const loadTestResults = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getTestResults(testId, attemptId);
            if (response.error) {
                throw new Error(response.error);
            }
            setResults(response.data as TestResults);
        } catch (error) {
            console.error('Error loading test results:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load test results');
            router.push('/lms/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        return `${minutes}m ${secs}s`;
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        if (percentage >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBadgeVariant = (percentage: number) => {
        if (percentage >= 90) return 'default';
        if (percentage >= 70) return 'secondary';
        return 'destructive';
    };

    const getPerformanceLevel = (percentage: number) => {
        if (percentage >= 95) return { level: 'Exceptional', icon: Trophy, color: 'text-yellow-500' };
        if (percentage >= 90) return { level: 'Excellent', icon: Medal, color: 'text-green-600' };
        if (percentage >= 80) return { level: 'Good', icon: Star, color: 'text-blue-600' };
        if (percentage >= 70) return { level: 'Satisfactory', icon: Target, color: 'text-yellow-600' };
        if (percentage >= 60) return { level: 'Needs Improvement', icon: TrendingUp, color: 'text-orange-600' };
        return { level: 'Unsatisfactory', icon: TrendingDown, color: 'text-red-600' };
    };

    const toggleQuestionExpansion = (questionId: string) => {
        setExpandedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-96">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Loading Results</h3>
                                <p className="text-muted-foreground">Please wait while we prepare your test results...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <Card className="w-96">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold mb-2">Results Not Found</h2>
                            <p className="text-muted-foreground mb-6">
                                The test results you're looking for are not available.
                            </p>
                            <Button asChild>
                                <Link href="/lms/dashboard">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const correctAnswers = results.questionResults.filter(q => q.response?.isCorrect === true).length;
    const incorrectAnswers = results.questionResults.filter(q => q.response?.isCorrect === false).length;
    const unanswered = results.questionResults.filter(q => !q.response).length;
    const performance = getPerformanceLevel(results.attempt.percentage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/lms/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    {/* Results Hero Section */}
                    <Card className="shadow-xl bg-gradient-to-r from-white to-blue-50">
                        <CardContent className="p-8">
                            <div className="text-center space-y-6">
                                <div className="flex items-center justify-center gap-3">
                                    <performance.icon className={`h-12 w-12 ${performance.color}`} />
                                    <div>
                                        <h1 className="text-3xl font-bold">
                                            {results.attempt.passed ? 'Congratulations!' : 'Test Completed'}
                                        </h1>
                                        <p className="text-xl text-muted-foreground">{results.test.title}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <Badge
                                        variant={getScoreBadgeVariant(results.attempt.percentage)}
                                        className="text-2xl px-6 py-3 font-bold"
                                    >
                                        {results.attempt.percentage}%
                                    </Badge>
                                    <Badge variant="outline" className="text-lg px-4 py-2">
                                        {performance.level}
                                    </Badge>
                                    {results.attempt.passed && (
                                        <Badge className="text-lg px-4 py-2 bg-green-600">
                                            PASSED
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600">
                                            {results.attempt.totalScore}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            out of {results.attempt.maxScore} points
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600">
                                            {correctAnswers}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            correct answers
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-600">
                                            {formatDuration(results.attempt.durationSeconds)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            time taken
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-600">
                                            {results.attempt.percentile || 'N/A'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            percentile rank
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Results Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                        <TabsTrigger value="review">Question Review</TabsTrigger>
                        <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Performance Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Performance Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Overall Score</span>
                                            <span className={`font-bold ${getScoreColor(results.attempt.percentage)}`}>
                                                {results.attempt.percentage}%
                                            </span>
                                        </div>
                                        <Progress value={results.attempt.percentage} className="h-3" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                                            <div className="text-xs text-muted-foreground">Correct</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                                            <div className="text-xs text-muted-foreground">Incorrect</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-600">{unanswered}</div>
                                            <div className="text-xs text-muted-foreground">Unanswered</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Passing Score Required:</span>
                                            <span className="font-medium">{results.test.passingScore}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Time Taken:</span>
                                            <span className="font-medium">{formatDuration(results.attempt.durationSeconds)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Submitted:</span>
                                            <span className="font-medium">
                                                {new Date(results.attempt.submittedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Class Statistics */}
                            {results.classStats && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Class Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {results.classStats.averageScore}%
                                                </div>
                                                <div className="text-xs text-muted-foreground">Class Average</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {results.classStats.highestScore}%
                                                </div>
                                                <div className="text-xs text-muted-foreground">Highest Score</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Your Performance vs Class</span>
                                                <span className={`font-medium ${results.attempt.percentage >= results.classStats.averageScore
                                                        ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {results.attempt.percentage >= results.classStats.averageScore
                                                        ? `+${(results.attempt.percentage - results.classStats.averageScore).toFixed(1)}%`
                                                        : `${(results.attempt.percentage - results.classStats.averageScore).toFixed(1)}%`
                                                    } vs average
                                                </span>
                                            </div>
                                            <Progress
                                                value={(results.attempt.percentage / results.classStats.highestScore) * 100}
                                                className="h-2"
                                            />
                                        </div>

                                        <div className="text-xs text-muted-foreground text-center">
                                            Based on {results.classStats.totalAttempts} total attempts
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    <Button asChild>
                                        <Link href="/lms/dashboard">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Continue Learning
                                        </Link>
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowDetailedReview(true)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Review Answers
                                    </Button>
                                    <Button variant="outline">
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share Results
                                    </Button>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Certificate
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Breakdown Tab */}
                    <TabsContent value="breakdown" className="space-y-6">
                        {results.aiFeedback?.scoreBreakdown && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Score Breakdown by Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {results.aiFeedback.scoreBreakdown.map((category, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{category.category}</span>
                                                    <span className="text-sm font-medium">
                                                        {category.score}/{category.maxScore} ({Math.round((category.score / category.maxScore) * 100)}%)
                                                    </span>
                                                </div>
                                                <Progress value={(category.score / category.maxScore) * 100} className="h-2" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Question Review Tab */}
                    <TabsContent value="review" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Question by Question Review</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDetailedReview(!showDetailedReview)}
                            >
                                {showDetailedReview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                {showDetailedReview ? 'Hide Details' : 'Show Details'}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {results.questionResults.map((result, index) => (
                                <Card key={result.question.id} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">Q{index + 1}</Badge>
                                                <Badge variant="outline">{result.question.kind.toUpperCase()}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {result.question.points} point{result.question.points !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {result.response?.isCorrect === true && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                )}
                                                {result.response?.isCorrect === false && (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {result.response?.pointsAwarded || 0}/{result.question.points}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleQuestionExpansion(result.question.id)}
                                                >
                                                    {expandedQuestions.has(result.question.id) ?
                                                        <ChevronUp className="h-4 w-4" /> :
                                                        <ChevronDown className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="font-medium">{result.question.stem}</div>

                                        {expandedQuestions.has(result.question.id) && (
                                            <div className="space-y-4 pt-4 border-t">
                                                {result.response && (
                                                    <div className="bg-muted p-4 rounded-lg">
                                                        <div className="text-sm font-medium mb-2">Your Answer:</div>
                                                        <div className="text-sm">
                                                            {typeof result.response.answer === 'string'
                                                                ? result.response.answer
                                                                : JSON.stringify(result.response.answer)
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                                {result.question.correctOptions && result.question.correctOptions.length > 0 && (
                                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                        <div className="text-sm font-medium mb-2 text-green-800">Correct Answer:</div>
                                                        <div className="text-sm text-green-700 space-y-1">
                                                            {result.question.correctOptions.map(option => (
                                                                <div key={option.id}>• {option.optionText}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {result.question.explanation && (
                                                    <Alert>
                                                        <Lightbulb className="h-4 w-4" />
                                                        <AlertDescription>
                                                            <strong>Explanation:</strong> {result.question.explanation}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* AI Feedback Tab */}
                    <TabsContent value="feedback" className="space-y-6">
                        {results.aiFeedback ? (
                            <div className="space-y-6">
                                {/* Overall Feedback */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lightbulb className="h-5 w-5" />
                                            AI Analysis & Feedback
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {results.aiFeedback.overallFeedback}
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Strengths */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-green-600">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Strengths
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {results.aiFeedback.strengths.map((strength, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span className="text-sm">{strength}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    {/* Areas for Improvement */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-orange-600">
                                                <TrendingUp className="h-5 w-5" />
                                                Areas for Improvement
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {results.aiFeedback.improvements.map((improvement, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                                        <span className="text-sm">{improvement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recommendations */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-blue-600">
                                            <BookOpen className="h-5 w-5" />
                                            Recommended Next Steps
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {results.aiFeedback.recommendations.map((recommendation, index) => (
                                                <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm">{recommendation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">AI Feedback Coming Soon</h3>
                                    <p className="text-muted-foreground">
                                        Detailed AI analysis and personalized feedback will be available shortly.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default function TestResultsPage() {
    return (
        <ProtectedRoute>
            <TestResultsContent />
        </ProtectedRoute>
    );
}