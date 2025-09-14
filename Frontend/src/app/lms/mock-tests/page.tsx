/**
 * @fileoverview Mock Tests page for the LMS.
 * Allows users to start or review mock tests, with some tests locked behind a subscription.
 */
'use client';

import React from 'react';
import { PageHeader } from '@/components/PageHeader.component';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Clock, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { MockTest } from '@/lib/types';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { cn } from '@/lib/utils.helper';
import Link from 'next/link';

/**
 * Mock data for available mock tests.
 * The 'Locked' status is used to encourage users to upgrade their plan.
 */
const mockTests: MockTest[] = [
    { id: 'mt1', title: 'IELTS Academic - Diagnostic Test', type: 'Full Test', duration: 180, status: 'Not Started' },
    { id: 'mt2', title: 'IELTS Listening Sectional', type: 'Sectional', section: 'Listening', duration: 30, status: 'Completed', score: 8.5 },
    { id: 'mt3', title: 'IELTS Reading Sectional', section: 'Reading', type: 'Sectional', duration: 60, status: 'In Progress' },
    { id: 'mt4', title: 'IELTS Writing Task 2 Practice', type: 'Sectional', section: 'Writing', duration: 60, status: 'Not Started' },
    { id: 'mt5', title: 'GRE Quant Sectional Test', type: 'Sectional', section: 'GRE Quant', duration: 45, status: 'Locked' },
    { id: 'mt6', title: 'Full IELTS Mock Test 2', type: 'Full Test', duration: 180, status: 'Locked' },
    { id: 'mt7', title: 'Full IELTS Mock Test 3', type: 'Full Test', duration: 180, status: 'Locked' },
    { id: 'mt8', title: 'TOEFL Speaking Practice', type: 'Sectional', section: 'TOEFL Speaking', duration: 20, status: 'Locked' },
];

/**
 * Renders the Mock Tests page, displaying a grid of available tests.
 * @returns {JSX.Element} The mock tests component.
 */
export default function MockTestsPage() {

    /**
     * Handles the action when a user tries to start a test.
     * Shows a toast notification for locked tests or prototype functionality.
     * @param {MockTest} test - The test object the user clicked on.
     */
    const handleStartTest = (test: MockTest) => {
        if (test.status === 'Locked') {
            toast.info('This test is locked.', {
                description: 'Upgrade your plan to access all mock tests.',
                action: {
                    label: 'Upgrade',
                    onClick: () => console.log('Navigate to plans'), // This would navigate to the pricing page
                },
            });
            return;
        }
        toast.info(`Starting "${test.title}"`, {
            description: 'This is a prototype. The test interface is not yet implemented.',
        });
    };

    return (
        <div className="space-y-8">
            <AnimatedDiv>
                <PageHeader
                    title="Mock Tests"
                    description="Practice under exam conditions to benchmark your skills and track your improvement."
                />
            </AnimatedDiv>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTests.map((test, index) => {
                    const isLocked = test.status === 'Locked';
                    return (
                        <AnimatedDiv key={test.id} delay={100 + index * 50}>
                             <Card className={cn(
                                "flex flex-col h-full bg-card/50 backdrop-blur-lg",
                                isLocked 
                                    ? "border-dashed" 
                                    : "animated-border-card transform transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
                            )}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className={cn("pr-2", isLocked && 'text-muted-foreground')}>{test.title}</CardTitle>
                                        {isLocked ? (
                                            <Lock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                        ) : (
                                            <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground pt-2">
                                        <Badge variant="outline">{test.type}</Badge>
                                        {test.section && <Badge variant="secondary">{test.section}</Badge>}
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" /> {test.duration} min
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    {test.status === 'Completed' && (
                                        <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 text-green-700">
                                            <CheckCircle className="h-5 w-5" />
                                            <div>
                                                <p className="font-bold">Completed</p>
                                                <p className="text-sm">Your band score: {test.score?.toFixed(1)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {test.status === 'In Progress' && (
                                        <p className="text-sm text-yellow-600 font-medium">You have already started this test.</p>
                                    )}
                                    {test.status === 'Not Started' && (
                                        <p className="text-sm text-muted-foreground">Ready when you are. Find a quiet place to begin.</p>
                                    )}
                                     {isLocked && (
                                        <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold text-muted-foreground">Locked</p>
                                                <p className="text-sm text-muted-foreground">Requires an active subscription.</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                     {test.status === 'Completed' ? (
                                         <Button variant="secondary" className="w-full">Review Answers</Button>
                                    ) : (
                                         <Button className="w-full" onClick={() => handleStartTest(test)} variant={isLocked ? 'secondary' : 'default'} disabled={isLocked}>
                                            {isLocked ? (
                                                <Link href="/lms/onboarding/plans">Upgrade to Unlock</Link>
                                            ) : (
                                                <>
                                                 {test.status === 'In Progress' ? 'Continue Test' : 'Start Test'} <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </AnimatedDiv>
                    );
                })}
            </div>
        </div>
    );
}
