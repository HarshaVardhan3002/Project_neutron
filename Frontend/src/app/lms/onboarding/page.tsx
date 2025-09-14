/**
 * @fileoverview The first step in the LMS onboarding flow: test selection.
 * Displays a grid of available tests for the user to choose from.
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { ArrowRight, BookText, GraduationCap, PenTool, Globe, Sparkles, Calendar, Target, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader.component';
import { cn } from '@/lib/utils.helper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { useAuth } from '@/contexts/AuthContext.context';
import { toast } from 'sonner';

const testTypes = [
    {
        id: 'ielts',
        name: 'IELTS',
        description: 'International English Language Testing System',
        duration: '2h 45m',
        sections: ['Listening', 'Reading', 'Writing', 'Speaking'],
        difficulty: 'Intermediate',
        popular: true,
        icon: <BookText className="w-8 h-8" />,
        color: "text-blue-500"
    },
    {
        id: 'toefl',
        name: 'TOEFL',
        description: 'Test of English as a Foreign Language',
        duration: '3h',
        sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
        difficulty: 'Advanced',
        icon: <PenTool className="w-8 h-8" />,
        color: "text-green-500"
    },
    {
        id: 'pte',
        name: 'PTE Academic',
        description: 'Pearson Test of English Academic',
        duration: '2h',
        sections: ['Speaking & Writing', 'Reading', 'Listening'],
        difficulty: 'Intermediate',
        icon: <Globe className="w-8 h-8" />,
        color: "text-orange-500"
    },
    {
        id: 'gre',
        name: 'GRE',
        description: 'Graduate Record Examinations',
        duration: '3h 45m',
        sections: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'],
        difficulty: 'Advanced',
        icon: <GraduationCap className="w-8 h-8" />,
        color: "text-red-500"
    }
];

/**
 * Renders the LMS onboarding page with test selection and goal setting.
 * @returns {JSX.Element} The onboarding page component.
 */
export default function OnboardingPage() {
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    const [targetDate, setTargetDate] = useState<string>('');
    const [currentLevel, setCurrentLevel] = useState<string>('');
    const { user } = useAuth();
    const router = useRouter();

    const handleContinue = () => {
        if (!selectedTest) {
            toast.error('Please select a test type');
            return;
        }
        if (!targetDate) {
            toast.error('Please set your target date');
            return;
        }
        if (!currentLevel) {
            toast.error('Please select your current level');
            return;
        }

        // Store onboarding data in localStorage for now
        localStorage.setItem('onboarding_data', JSON.stringify({
            testType: selectedTest,
            targetDate,
            currentLevel,
            userId: user?.id
        }));

        router.push('/lms/onboarding/assessment');
    };

    return (
        <div className="space-y-8">
            <AnimatedDiv>
                <PageHeader
                    title="Welcome to Your Learning Journey"
                    description="Let's personalize your experience by understanding your goals and preferences."
                />
            </AnimatedDiv>

            {/* Test Selection */}
            <AnimatedDiv delay={100}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookText className="h-5 w-5" />
                            Choose Your Test
                        </CardTitle>
                        <CardDescription>
                            Select the test you want to prepare for
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {testTypes.map((test) => (
                                <div
                                    key={test.id}
                                    className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedTest === test.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                    onClick={() => setSelectedTest(test.id)}
                                >
                                    {test.popular && (
                                        <Badge className="absolute -top-2 -right-2" variant="default">
                                            Popular
                                        </Badge>
                                    )}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('transition-transform duration-300', test.color)}>
                                                {test.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{test.name}</h3>
                                                <p className="text-sm text-muted-foreground">{test.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {test.duration}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {test.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {test.sections.map((section) => (
                                                <Badge key={section} variant="secondary" className="text-xs">
                                                    {section}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </AnimatedDiv>

            {/* Goal Setting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnimatedDiv delay={200}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Target Date
                            </CardTitle>
                            <CardDescription>
                                When do you plan to take the test?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </CardContent>
                    </Card>
                </AnimatedDiv>

                <AnimatedDiv delay={300}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Current Level
                            </CardTitle>
                            <CardDescription>
                                How would you rate your current proficiency?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[
                                    { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
                                    { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
                                    { id: 'advanced', label: 'Advanced', description: 'Confident in most areas' }
                                ].map((level) => (
                                    <div
                                        key={level.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${currentLevel === level.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => setCurrentLevel(level.id)}
                                    >
                                        <div className="font-medium">{level.label}</div>
                                        <div className="text-sm text-muted-foreground">{level.description}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </AnimatedDiv>
            </div>

            <AnimatedDiv delay={400} className="flex justify-center">
                <Button onClick={handleContinue} size="lg" className="px-8">
                    Continue to Assessment
                </Button>
            </AnimatedDiv>

            <AnimatedDiv className="text-center pt-8" delay={500}>
                <div className="inline-block p-6 rounded-2xl bg-muted/50 border">
                    <div className="flex items-center gap-4">
                        <Sparkles className="h-8 w-8 text-accent" />
                        <div>
                            <h3 className="font-semibold text-lg text-left">Why take the assessment?</h3>
                            <p className="text-muted-foreground text-sm text-left">It's the first step to a smarter, faster way to prepare for your exam.</p>
                        </div>
                    </div>
                </div>
            </AnimatedDiv>
        </div>
    );
}