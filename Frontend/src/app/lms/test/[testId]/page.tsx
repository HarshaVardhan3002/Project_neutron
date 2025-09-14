'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Flag,
    Loader2,
    Timer,
    Save,
    BookOpen,
    Target,
    Users,
    Calendar,
    Info,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Send,
    Eye,
    EyeOff,
    Pause,
    Play
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.context';
import { apiClient } from '@/lib/api.service';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface Question {
    id: string;
    stem: string;
    kind: 'mcq' | 'msq' | 'short_text' | 'essay' | 'speaking' | 'listening';
    points: number;
    orderIndex: number;
    options?: Array<{
        id: string;
        optionText: string;
        orderIndex: number;
    }>;
}

interface TestAttempt {
    id: string;
    testId: string;
    status: 'in_progress' | 'completed' | 'graded';
    startedAt: string;
    timeLimit?: number;
}

interface TestData {
    id: string;
    title: string;
    description: string;
    kind: string;
    timeLimit?: number;
    allowedAttempts?: number;
    passingScore: number;
    questions: Question[];
    course?: {
        title: string;
        instructor: string;
    };
}

function TestTakingContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const testId = params.testId as string;

    // Core state
    const [test, setTest] = useState<TestData | null>(null);
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

    // UI state
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showNavigator, setShowNavigator] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Timer effect with warning states
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }

                // Show warnings at different intervals
                if (prev === 300) { // 5 minutes
                    toast.warning('⏰ 5 minutes remaining!', {
                        duration: 5000,
                    });
                } else if (prev === 60) { // 1 minute
                    toast.error('🚨 Only 1 minute left!', {
                        duration: 10000,
                    });
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Auto-save effect
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (Object.keys(answers).length > 0) {
                handleAutoSave();
            }
        }, 30000); // Auto-save every 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [answers]);

    // Load test and create attempt
    useEffect(() => {
        if (testId && user) {
            loadTestAndCreateAttempt();
        }
    }, [testId, user]);

    const loadTestAndCreateAttempt = async () => {
        try {
            setLoading(true);

            // Get test details
            const testResponse = await apiClient.getTest(testId);
            if (testResponse.error) {
                throw new Error(testResponse.error);
            }

            const testData = (testResponse.data as any)?.test;
            if (!testData) {
                throw new Error('Test not found');
            }

            setTest(testData);

            // Create test attempt
            const attemptResponse = await apiClient.createTestAttempt(testId);
            if (attemptResponse.error) {
                throw new Error(attemptResponse.error);
            }

            const attemptData = (attemptResponse.data as any)?.attempt;
            if (!attemptData) {
                throw new Error('Failed to create test attempt');
            }

            setAttempt(attemptData);

            // Set timer if test has time limit
            if (testData.timeLimit) {
                setTimeRemaining(testData.timeLimit * 60); // Convert minutes to seconds
            }

            toast.success('Test loaded successfully. Good luck!');
        } catch (error) {
            console.error('Error loading test:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load test');
            router.push('/lms/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = async (questionId: string, answer: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));

        // Immediate save for important answers
        if (attempt) {
            try {
                setAutoSaving(true);
                await apiClient.submitQuestionResponse(testId, attempt.id, questionId, answer);
                setLastSaved(new Date());
            } catch (error) {
                console.error('Error saving answer:', error);
                toast.error('Failed to save answer. Please try again.');
            } finally {
                setAutoSaving(false);
            }
        }
    };

    const handleAutoSave = async () => {
        if (!attempt || Object.keys(answers).length === 0) return;

        try {
            setAutoSaving(true);
            // Save all current answers
            for (const [questionId, answer] of Object.entries(answers)) {
                await apiClient.submitQuestionResponse(testId, attempt.id, questionId, answer);
            }
            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setAutoSaving(false);
        }
    };

    const handleFlagQuestion = (questionId: string) => {
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
                toast.info('Question unflagged');
            } else {
                newSet.add(questionId);
                toast.info('Question flagged for review');
            }
            return newSet;
        });
    };

    const handleNextQuestion = () => {
        if (test && currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleQuestionNavigation = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const handleAutoSubmit = async () => {
        toast.error('⏰ Time\'s up! Submitting your test automatically...');
        await handleSubmitTest();
    };

    const handleSubmitTest = async () => {
        if (!attempt || !test) return;

        try {
            setSubmitting(true);

            // Final auto-save before submission
            await handleAutoSave();

            const response = await apiClient.submitTestAttempt(testId, attempt.id);
            if (response.error) {
                throw new Error(response.error);
            }

            toast.success('🎉 Test submitted successfully!');
            router.push(`/lms/test/${testId}/results/${attempt.id}`);
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit test');
        } finally {
            setSubmitting(false);
            setShowSubmitDialog(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = (seconds: number) => {
        if (seconds > 300) return 'text-green-600'; // > 5 minutes
        if (seconds > 60) return 'text-yellow-600';  // > 1 minute
        return 'text-red-600'; // < 1 minute
    };

    const renderQuestion = (question: Question) => {
        const answer = answers[question.id];

        switch (question.kind) {
            case 'mcq':
                return (
                    <div className="space-y-4">
                        <RadioGroup
                            value={answer || ''}
                            onValueChange={(value) => handleAnswerChange(question.id, value)}
                            className="space-y-3"
                        >
                            {question.options?.map((option, index) => (
                                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                                    <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm leading-relaxed">
                                        <span className="font-medium mr-2">({String.fromCharCode(65 + index)})</span>
                                        {option.optionText}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                );

            case 'msq':
                return (
                    <div className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Select all correct answers. Multiple selections are allowed.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-3">
                            {question.options?.map((option, index) => (
                                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                        id={option.id}
                                        checked={Array.isArray(answer) && answer.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                            const currentAnswers = Array.isArray(answer) ? answer : [];
                                            if (checked) {
                                                handleAnswerChange(question.id, [...currentAnswers, option.id]);
                                            } else {
                                                handleAnswerChange(question.id, currentAnswers.filter(id => id !== option.id));
                                            }
                                        }}
                                        className="mt-1"
                                    />
                                    <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm leading-relaxed">
                                        <span className="font-medium mr-2">({String.fromCharCode(65 + index)})</span>
                                        {option.optionText}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'short_text':
                return (
                    <div className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Provide a brief, concise answer. Aim for 1-2 sentences.
                            </AlertDescription>
                        </Alert>
                        <Textarea
                            value={answer || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Enter your answer here..."
                            rows={4}
                            className="resize-none"
                        />
                        <div className="text-xs text-muted-foreground">
                            Characters: {(answer || '').length}
                        </div>
                    </div>
                );

            case 'essay':
                return (
                    <div className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Provide a detailed, well-structured response. Support your answer with examples and explanations.
                            </AlertDescription>
                        </Alert>
                        <Textarea
                            value={answer || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Write your essay here..."
                            rows={12}
                            className="resize-none"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Characters: {(answer || '').length}</span>
                            <span>Words: {(answer || '').split(/\s+/).filter((word: string) => word.length > 0).length}</span>
                        </div>
                    </div>
                );

            default:
                return (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This question type ({question.kind}) is not yet supported in the interface.
                            Please contact your instructor for assistance.
                        </AlertDescription>
                    </Alert>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-96">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Loading Test</h3>
                                <p className="text-muted-foreground">Please wait while we prepare your test...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!test || !attempt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <Card className="w-96">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold mb-2">Test Not Available</h2>
                            <p className="text-muted-foreground mb-6">
                                The test you're looking for is not available or you don't have permission to access it.
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

    const currentQuestion = test.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
    const answeredQuestions = Object.keys(answers).length;
    const isLastQuestion = currentQuestionIndex === test.questions.length - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Fixed Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/lms/dashboard">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Exit Test
                                </Link>
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <div>
                                <h1 className="text-lg font-semibold">{test.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <Badge variant="outline">{test.kind}</Badge>
                                    {test.course && (
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            {test.course.title}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        {test.passingScore}% to pass
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Auto-save indicator */}
                            <div className="flex items-center gap-2 text-sm">
                                {autoSaving ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span className="text-blue-600">Saving...</span>
                                    </>
                                ) : lastSaved ? (
                                    <>
                                        <Save className="h-3 w-3 text-green-600" />
                                        <span className="text-green-600">Saved {lastSaved.toLocaleTimeString()}</span>
                                    </>
                                ) : null}
                            </div>

                            {/* Timer */}
                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-2 font-mono text-lg px-3 py-1 rounded-lg border ${timeRemaining < 60 ? 'bg-red-50 border-red-200' :
                                    timeRemaining < 300 ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-green-50 border-green-200'
                                    }`}>
                                    <Timer className={`h-5 w-5 ${getTimeColor(timeRemaining)}`} />
                                    <span className={getTimeColor(timeRemaining)}>
                                        {formatTime(timeRemaining)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
                            <span>{answeredQuestions} answered • {test.questions.length - answeredQuestions} remaining</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Content */}
                    <div className="lg:col-span-3">
                        <Card className="shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant="secondary">Question {currentQuestionIndex + 1}</Badge>
                                            <Badge variant="outline">{currentQuestion.kind.toUpperCase()}</Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl leading-relaxed">
                                            {currentQuestion.stem}
                                        </CardTitle>
                                    </div>
                                    <Button
                                        variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => handleFlagQuestion(currentQuestion.id)}
                                        className={flaggedQuestions.has(currentQuestion.id) ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                                    >
                                        <Flag className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {renderQuestion(currentQuestion)}

                                <Separator />

                                {/* Navigation Controls */}
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex gap-2">
                                        {isLastQuestion ? (
                                            <Button
                                                onClick={() => setShowSubmitDialog(true)}
                                                disabled={submitting}
                                                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        Submit Test
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleNextQuestion}
                                                disabled={currentQuestionIndex === test.questions.length - 1}
                                                className="flex items-center gap-2"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Question Navigator */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-32 shadow-lg">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Navigator</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowNavigator(!showNavigator)}
                                    >
                                        {showNavigator ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <CardDescription>
                                    {answeredQuestions} of {test.questions.length} answered
                                </CardDescription>
                            </CardHeader>

                            {showNavigator && (
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-5 gap-2">
                                        {test.questions.map((question, index) => {
                                            const isAnswered = answers[question.id] !== undefined;
                                            const isFlagged = flaggedQuestions.has(question.id);
                                            const isCurrent = index === currentQuestionIndex;

                                            return (
                                                <Button
                                                    key={question.id}
                                                    variant={isCurrent ? "default" : "outline"}
                                                    size="sm"
                                                    className={`relative h-10 ${isAnswered && !isCurrent ? 'bg-green-50 border-green-300 hover:bg-green-100' : ''
                                                        } ${isFlagged && !isCurrent ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100' : ''}`}
                                                    onClick={() => handleQuestionNavigation(index)}
                                                >
                                                    {index + 1}
                                                    {isFlagged && (
                                                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-600" />
                                                    )}
                                                    {isAnswered && !isCurrent && (
                                                        <CheckCircle2 className="absolute -bottom-1 -right-1 h-3 w-3 text-green-600" />
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
                                            <span>Answered</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-50 border border-yellow-300 rounded"></div>
                                            <span>Flagged</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border border-gray-300 rounded"></div>
                                            <span>Not answered</span>
                                        </div>
                                    </div>

                                    {/* Quick Submit */}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setShowSubmitDialog(true)}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Test'
                                        )}
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Test?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to submit your test? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total Questions:</span>
                                    <span className="font-medium">{test.questions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Answered:</span>
                                    <span className="font-medium text-green-600">{answeredQuestions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Unanswered:</span>
                                    <span className="font-medium text-red-600">{test.questions.length - answeredQuestions}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Flagged:</span>
                                    <span className="font-medium text-yellow-600">{flaggedQuestions.size}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Passing Score:</span>
                                    <span className="font-medium">{test.passingScore}%</span>
                                </div>
                                {timeRemaining && (
                                    <div className="flex justify-between">
                                        <span>Time Remaining:</span>
                                        <span className={`font-medium ${getTimeColor(timeRemaining)}`}>
                                            {formatTime(timeRemaining)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {test.questions.length - answeredQuestions > 0 && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    You have {test.questions.length - answeredQuestions} unanswered question(s).
                                    These will be marked as incorrect.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                            Continue Test
                        </Button>
                        <Button onClick={handleSubmitTest} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Test'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function TestTakingPage() {
    return (
        <ProtectedRoute>
            <TestTakingContent />
        </ProtectedRoute>
    );
}