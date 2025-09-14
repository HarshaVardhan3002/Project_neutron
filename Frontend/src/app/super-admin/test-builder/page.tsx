'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Plus,
    Trash2,
    Save,
    Eye,
    FileText,
    Mic,
    Headphones,
    PenTool,
    BookOpen,
    Clock,
    Target,
    Settings,
    Copy,
    Move,
    Edit,
    CheckCircle,
    AlertCircle,
    Volume2,
    Image,
    Video,
    Upload
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Question {
    id: string;
    type: 'mcq' | 'msq' | 'short_text' | 'essay' | 'speaking' | 'listening' | 'reading_comprehension' | 'fill_blanks';
    stem: string;
    points: number;
    timeLimit?: number;
    options?: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
    }>;
    correctAnswer?: string;
    explanation?: string;
    audioUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    passage?: string;
    blanks?: Array<{
        id: string;
        correctAnswers: string[];
    }>;
}

interface TestSection {
    id: string;
    name: string;
    description: string;
    timeLimit: number;
    questions: Question[];
    instructions: string;
}

interface Test {
    id?: string;
    title: string;
    description: string;
    testType: 'ielts' | 'toefl' | 'gre' | 'pte' | 'custom';
    totalTimeLimit: number;
    passingScore: number;
    sections: TestSection[];
    instructions: string;
    published: boolean;
}

const TEST_TYPES = {
    ielts: {
        name: 'IELTS',
        sections: ['Listening', 'Reading', 'Writing', 'Speaking'],
        description: 'International English Language Testing System'
    },
    toefl: {
        name: 'TOEFL',
        sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
        description: 'Test of English as a Foreign Language'
    },
    gre: {
        name: 'GRE',
        sections: ['Verbal Reasoning', 'Quantitative Reasoning'],
        description: 'Graduate Record Examinations'
    },
    pte: {
        name: 'PTE',
        sections: ['Speaking & Writing', 'Reading', 'Listening'],
        description: 'Pearson Test of English'
    },
    custom: {
        name: 'Custom Test',
        sections: ['Section 1'],
        description: 'Create your own test structure'
    }
};

const QUESTION_TYPES = [
    { value: 'mcq', label: 'Multiple Choice (Single)', icon: Target },
    { value: 'msq', label: 'Multiple Choice (Multiple)', icon: CheckCircle },
    { value: 'short_text', label: 'Short Text Answer', icon: PenTool },
    { value: 'essay', label: 'Essay Writing', icon: FileText },
    { value: 'speaking', label: 'Speaking Response', icon: Mic },
    { value: 'listening', label: 'Listening Comprehension', icon: Headphones },
    { value: 'reading_comprehension', label: 'Reading Comprehension', icon: BookOpen },
    { value: 'fill_blanks', label: 'Fill in the Blanks', icon: Edit }
];

function TestBuilderContent() {
    const [test, setTest] = useState<Test>({
        title: '',
        description: '',
        testType: 'ielts',
        totalTimeLimit: 180,
        passingScore: 70,
        sections: [],
        instructions: '',
        published: false
    });

    const [currentSection, setCurrentSection] = useState<string>('');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (test.testType && test.sections.length === 0) {
            initializeTestSections();
        }
    }, [test.testType]);

    const initializeTestSections = () => {
        const testTypeConfig = TEST_TYPES[test.testType];
        const sections: TestSection[] = testTypeConfig.sections.map((sectionName, index) => ({
            id: `section-${index + 1}`,
            name: sectionName,
            description: `${sectionName} section for ${testTypeConfig.name}`,
            timeLimit: Math.floor(test.totalTimeLimit / testTypeConfig.sections.length),
            questions: [],
            instructions: `Instructions for ${sectionName} section will be provided here.`
        }));

        setTest(prev => ({ ...prev, sections }));
        if (sections.length > 0) {
            setCurrentSection(sections[0].id);
        }
    };

    const addQuestion = (sectionId: string) => {
        const newQuestion: Question = {
            id: `question-${Date.now()}`,
            type: 'mcq',
            stem: '',
            points: 1,
            options: [
                { id: 'opt-1', text: '', isCorrect: false },
                { id: 'opt-2', text: '', isCorrect: false },
                { id: 'opt-3', text: '', isCorrect: false },
                { id: 'opt-4', text: '', isCorrect: false }
            ]
        };

        setTest(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? { ...section, questions: [...section.questions, newQuestion] }
                    : section
            )
        }));

        setCurrentQuestion(newQuestion);
    };

    const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
        setTest(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        questions: section.questions.map(q =>
                            q.id === questionId ? { ...q, ...updates } : q
                        )
                    }
                    : section
            )
        }));

        if (currentQuestion?.id === questionId) {
            setCurrentQuestion(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const deleteQuestion = (sectionId: string, questionId: string) => {
        setTest(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        questions: section.questions.filter(q => q.id !== questionId)
                    }
                    : section
            )
        }));

        if (currentQuestion?.id === questionId) {
            setCurrentQuestion(null);
        }
    };

    const addOption = (questionId: string) => {
        if (!currentQuestion || currentQuestion.id !== questionId) return;

        const newOption = {
            id: `opt-${Date.now()}`,
            text: '',
            isCorrect: false
        };

        const updatedQuestion = {
            ...currentQuestion,
            options: [...(currentQuestion.options || []), newOption]
        };

        setCurrentQuestion(updatedQuestion);

        const sectionId = getCurrentSectionId();
        if (sectionId) {
            updateQuestion(sectionId, questionId, { options: updatedQuestion.options });
        }
    };

    const updateOption = (questionId: string, optionId: string, updates: Partial<{ text: string; isCorrect: boolean }>) => {
        if (!currentQuestion || currentQuestion.id !== questionId) return;

        const updatedOptions = currentQuestion.options?.map(opt =>
            opt.id === optionId ? { ...opt, ...updates } : opt
        ) || [];

        const updatedQuestion = { ...currentQuestion, options: updatedOptions };
        setCurrentQuestion(updatedQuestion);

        const sectionId = getCurrentSectionId();
        if (sectionId) {
            updateQuestion(sectionId, questionId, { options: updatedOptions });
        }
    };

    const getCurrentSectionId = () => {
        return currentSection || test.sections[0]?.id;
    };

    const getCurrentSection = () => {
        return test.sections.find(s => s.id === currentSection) || test.sections[0];
    };

    const saveTest = async () => {
        try {
            setSaving(true);

            // Validate test
            if (!test.title.trim()) {
                toast.error('Please enter a test title');
                return;
            }

            if (test.sections.length === 0) {
                toast.error('Please add at least one section');
                return;
            }

            // API call to save test
            const response = await fetch('/api/super-admin/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test)
            });

            if (response.ok) {
                toast.success('Test saved successfully');
            } else {
                throw new Error('Failed to save test');
            }
        } catch (error) {
            console.error('Error saving test:', error);
            toast.error('Failed to save test');
        } finally {
            setSaving(false);
        }
    };

    const publishTest = async () => {
        try {
            setSaving(true);
            await saveTest();

            setTest(prev => ({ ...prev, published: true }));
            toast.success('Test published successfully');
        } catch (error) {
            console.error('Error publishing test:', error);
            toast.error('Failed to publish test');
        } finally {
            setSaving(false);
        }
    };

    const renderQuestionEditor = () => {
        if (!currentQuestion) {
            return (
                <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Question Selected</h3>
                    <p className="text-muted-foreground">
                        Select a question from the left panel or create a new one to start editing.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Question Type Selection */}
                <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                        value={currentQuestion.type}
                        onValueChange={(value: any) => {
                            const sectionId = getCurrentSectionId();
                            if (sectionId) {
                                updateQuestion(sectionId, currentQuestion.id, { type: value });
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {QUESTION_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                        <type.icon className="h-4 w-4" />
                                        {type.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Question Stem */}
                <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                        value={currentQuestion.stem}
                        onChange={(e) => {
                            const sectionId = getCurrentSectionId();
                            if (sectionId) {
                                updateQuestion(sectionId, currentQuestion.id, { stem: e.target.value });
                            }
                        }}
                        placeholder="Enter your question here..."
                        rows={4}
                    />
                </div>

                {/* Question Settings */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                            type="number"
                            value={currentQuestion.points}
                            onChange={(e) => {
                                const sectionId = getCurrentSectionId();
                                if (sectionId) {
                                    updateQuestion(sectionId, currentQuestion.id, { points: parseInt(e.target.value) || 1 });
                                }
                            }}
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Time Limit (seconds)</Label>
                        <Input
                            type="number"
                            value={currentQuestion.timeLimit || ''}
                            onChange={(e) => {
                                const sectionId = getCurrentSectionId();
                                if (sectionId) {
                                    updateQuestion(sectionId, currentQuestion.id, {
                                        timeLimit: e.target.value ? parseInt(e.target.value) : undefined
                                    });
                                }
                            }}
                            placeholder="Optional"
                        />
                    </div>
                </div>

                {/* Media Upload Section */}
                <div className="space-y-4">
                    <Label>Media Attachments</Label>
                    <div className="grid grid-cols-3 gap-4">
                        <Button variant="outline" className="h-24 flex flex-col gap-2">
                            <Image className="h-6 w-6" />
                            <span className="text-sm">Add Image</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2">
                            <Volume2 className="h-6 w-6" />
                            <span className="text-sm">Add Audio</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2">
                            <Video className="h-6 w-6" />
                            <span className="text-sm">Add Video</span>
                        </Button>
                    </div>
                </div>

                {/* Question Type Specific Fields */}
                {(currentQuestion.type === 'mcq' || currentQuestion.type === 'msq') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Answer Options</Label>
                            <Button size="sm" onClick={() => addOption(currentQuestion.id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, index) => (
                                <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium w-8">{String.fromCharCode(65 + index)}</span>
                                        {currentQuestion.type === 'mcq' ? (
                                            <input
                                                type="radio"
                                                name={`correct-${currentQuestion.id}`}
                                                checked={option.isCorrect}
                                                onChange={() => {
                                                    // For MCQ, only one option can be correct
                                                    const updatedOptions = currentQuestion.options?.map(opt => ({
                                                        ...opt,
                                                        isCorrect: opt.id === option.id
                                                    })) || [];

                                                    const sectionId = getCurrentSectionId();
                                                    if (sectionId) {
                                                        updateQuestion(sectionId, currentQuestion.id, { options: updatedOptions });
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={(e) => updateOption(currentQuestion.id, option.id, { isCorrect: e.target.checked })}
                                            />
                                        )}
                                    </div>
                                    <Input
                                        value={option.text}
                                        onChange={(e) => updateOption(currentQuestion.id, option.id, { text: e.target.value })}
                                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                        className="flex-1"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            const updatedOptions = currentQuestion.options?.filter(opt => opt.id !== option.id) || [];
                                            const sectionId = getCurrentSectionId();
                                            if (sectionId) {
                                                updateQuestion(sectionId, currentQuestion.id, { options: updatedOptions });
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(currentQuestion.type === 'short_text' || currentQuestion.type === 'essay') && (
                    <div className="space-y-2">
                        <Label>Sample/Expected Answer</Label>
                        <Textarea
                            value={currentQuestion.correctAnswer || ''}
                            onChange={(e) => {
                                const sectionId = getCurrentSectionId();
                                if (sectionId) {
                                    updateQuestion(sectionId, currentQuestion.id, { correctAnswer: e.target.value });
                                }
                            }}
                            placeholder="Enter the expected answer or key points..."
                            rows={3}
                        />
                    </div>
                )}

                {currentQuestion.type === 'reading_comprehension' && (
                    <div className="space-y-2">
                        <Label>Reading Passage</Label>
                        <Textarea
                            value={currentQuestion.passage || ''}
                            onChange={(e) => {
                                const sectionId = getCurrentSectionId();
                                if (sectionId) {
                                    updateQuestion(sectionId, currentQuestion.id, { passage: e.target.value });
                                }
                            }}
                            placeholder="Enter the reading passage here..."
                            rows={8}
                        />
                    </div>
                )}

                {/* Explanation */}
                <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                        value={currentQuestion.explanation || ''}
                        onChange={(e) => {
                            const sectionId = getCurrentSectionId();
                            if (sectionId) {
                                updateQuestion(sectionId, currentQuestion.id, { explanation: e.target.value });
                            }
                        }}
                        placeholder="Provide an explanation for the correct answer..."
                        rows={3}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Advanced Test Builder</h1>
                    <p className="text-muted-foreground">
                        Create comprehensive tests for IELTS, TOEFL, GRE, PTE and custom assessments
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {previewMode ? 'Edit Mode' : 'Preview'}
                    </Button>
                    <Button variant="outline" onClick={saveTest} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button onClick={publishTest} disabled={saving}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish Test
                    </Button>
                </div>
            </div>

            {/* Test Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Configuration</CardTitle>
                    <CardDescription>
                        Configure the basic settings for your test
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Test Title</Label>
                            <Input
                                value={test.title}
                                onChange={(e) => setTest(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter test title..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Test Type</Label>
                            <Select value={test.testType} onValueChange={(value: any) => setTest(prev => ({ ...prev, testType: value, sections: [] }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TEST_TYPES).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            <div>
                                                <div className="font-medium">{config.name}</div>
                                                <div className="text-xs text-muted-foreground">{config.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Test Description</Label>
                        <Textarea
                            value={test.description}
                            onChange={(e) => setTest(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the test purpose and content..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Total Time Limit (minutes)</Label>
                            <Input
                                type="number"
                                value={test.totalTimeLimit}
                                onChange={(e) => setTest(prev => ({ ...prev, totalTimeLimit: parseInt(e.target.value) || 180 }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Passing Score (%)</Label>
                            <Input
                                type="number"
                                value={test.passingScore}
                                onChange={(e) => setTest(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Builder Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sections Panel */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Test Sections</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {test.sections.map((section) => (
                                <div key={section.id} className="space-y-3">
                                    <div
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${currentSection === section.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => setCurrentSection(section.id)}
                                    >
                                        <div className="font-medium">{section.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    {currentSection === section.id && (
                                        <div className="space-y-2 ml-4">
                                            {section.questions.map((question, index) => (
                                                <div
                                                    key={question.id}
                                                    className={`p-2 text-sm border rounded cursor-pointer transition-colors ${currentQuestion?.id === question.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                                        }`}
                                                    onClick={() => setCurrentQuestion(question)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>Q{index + 1}: {question.type.toUpperCase()}</span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteQuestion(section.id, question.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-muted-foreground truncate">
                                                        {question.stem || 'No question text'}
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => addQuestion(section.id)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Question
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Question Editor */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Question Editor</CardTitle>
                            <CardDescription>
                                {currentQuestion
                                    ? `Editing ${currentQuestion.type.toUpperCase()} question`
                                    : 'Select or create a question to start editing'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderQuestionEditor()}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Test Status */}
            {test.sections.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Test Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{test.sections.length}</div>
                                <div className="text-sm text-muted-foreground">Sections</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {test.sections.reduce((total, section) => total + section.questions.length, 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Questions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{test.totalTimeLimit}</div>
                                <div className="text-sm text-muted-foreground">Minutes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{test.passingScore}%</div>
                                <div className="text-sm text-muted-foreground">Passing Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function TestBuilderPage() {
    return (
        <ProtectedRoute requiredRole="super_admin">
            <TestBuilderContent />
        </ProtectedRoute>
    );
}