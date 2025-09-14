/**
 * @fileoverview The first step in the LMS onboarding flow: test selection.
 * Displays a grid of available tests for the user to choose from.
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, BookText, GraduationCap, PenTool, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader.component';
import type { Test } from '@/lib/types';
import { cn } from '@/lib/utils.helper';
import { Button } from '@/components/ui/button';
import { AnimatedDiv } from '@/components/AnimatedDiv';

// Mock data for available tests
const tests: Test[] = [
    { id: 'ielts', name: 'IELTS', description: 'International English Language Testing System', icon: <BookText className="w-10 h-10" />, color: "text-blue-500", href: '/lms/onboarding/assessment' },
    { id: 'gre', name: 'GRE', description: 'Graduate Record Examinations', icon: <GraduationCap className="w-10 h-10" />, color: "text-red-500", href: '#' },
    { id: 'toefl', name: 'TOEFL', description: 'Test of English as a Foreign Language', icon: <PenTool className="w-10 h-10" />, color: "text-green-500", href: '#' },
    { id: 'pte', name: 'PTE', description: 'Pearson Test of English', icon: <Globe className="w-10 h-10" />, color: "text-orange-500", href: '#' },
];

/**
 * Renders the test selection page with a professional design.
 * @returns {JSX.Element} The test selection component.
 */
export default function OnboardingPage() {
    return (
        <div className="space-y-8">
             <AnimatedDiv>
                <PageHeader
                    title="Let's Find Your Starting Point"
                    description="Take a short, free diagnostic test. Your results will unlock a personalized study plan, tailored just for you."
                />
            </AnimatedDiv>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {tests.map((test, index) => {
                    const isAvailable = test.href !== '#';
                    return (
                        <AnimatedDiv key={test.id} delay={100 + index * 100}>
                            <Card className={cn(
                                'flex flex-col h-full bg-card/50 backdrop-blur-lg border text-center transition-all duration-300',
                                isAvailable 
                                    ? 'animated-border-card transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10'
                                    : 'opacity-60'
                            )}>
                                {!isAvailable && (
                                    <div className="absolute top-2 right-2 bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full z-10">
                                        Coming Soon
                                    </div>
                                )}
                                <CardHeader className="items-center flex-grow">
                                    <div className={cn('mb-4 transition-transform duration-300 group-hover:scale-110', test.color)}>
                                        {test.icon}
                                    </div>
                                    <CardTitle className="font-headline text-xl">{test.name}</CardTitle>
                                    <CardDescription className="pt-2 text-sm">{test.description}</CardDescription>
                                </CardHeader>
                                <CardFooter className="p-4">
                                    <Button asChild className="w-full" disabled={!isAvailable}>
                                        <Link href={isAvailable ? test.href : '#'}>
                                            Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </AnimatedDiv>
                    )
                })}
            </div>

            <AnimatedDiv className="text-center pt-12" delay={600}>
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
