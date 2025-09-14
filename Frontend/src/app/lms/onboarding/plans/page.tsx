/**
 * @fileoverview A page to display learning plans after the user's assessment.
 * This is the primary monetization step in the onboarding flow, presenting paid and free options.
 */
'use client';

import { Button } from '@/components/ui/button';
import { Check, Layers, UserCheck, BrainCircuit, ChevronDown, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { cn } from '@/lib/utils.helper';
import Link from 'next/link';
import { PricingCard } from '@/components/pricing/pricing-card';

/**
 * Features included (or not) in the free tier, used for comparison.
 */
const freeTierFeatures = [
    { text: 'Access to First Learning Module', included: true },
    { text: 'Limited AI Chatbot Queries', included: true },
    { text: 'Personalized Study Plan Outline', included: true },
    { text: '4 One-on-One Tutoring Sessions', included: false },
    { text: 'In-depth Essay Reviews', included: false },
    { text: 'Priority Support', included: false },
];

/**
 * Data for the paid pricing tiers.
 */
const paidTiers = [
    { title: 'AI Tutoring', price: 49, icon: <BrainCircuit className="w-8 h-8 mb-4 text-primary" />, features: ['24/7 AI Chatbot', 'Automated Essay Scoring', 'Unlimited Practice Tests', 'Progress Tracking'], href: '/lms/checkout', actionText: 'Choose Plan' },
    { title: 'Hybrid Tutoring', price: 149, icon: <Layers className="w-8 h-8 mb-4 text-accent" />, features: ['All AI Features', '4 Live Group Sessions', 'Personalized Feedback', 'Expert Q&A Forums'], popular: true, href: '/lms/checkout', actionText: 'Choose Plan' },
    { title: 'Human Tutoring', price: 299, icon: <UserCheck className="w-8 h-8 mb-4 text-destructive" />, features: ['All Hybrid Features', '8 One-on-One Sessions', 'Dedicated Expert Tutor', 'Custom Study Plan'], href: '/lms/checkout', actionText: 'Choose Plan' },
];

/**
 * Renders the page for selecting a learning plan after the initial assessment.
 * @returns {JSX.Element} The plans page component.
 */
export default function OnboardingPlansPage() {
    return (
        <div className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <AnimatedDiv className="text-center mb-16">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text pb-2">Your Path to a 7.5+ Band Score</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-muted-foreground text-lg">
                        Based on your assessment score of <span className="font-bold text-foreground">6.5</span>, here are the plans we recommend to help you improve.
                    </p>
                </AnimatedDiv>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
                    {/* Paid Tiers */}
                    {paidTiers.map((tier, index) => (
                        <AnimatedDiv key={tier.title} delay={100 + 100 * index}>
                            <PricingCard {...tier} />
                        </AnimatedDiv>
                    ))}
                </div>

                {/* Scroll Down Indicator to hint at the free tier option below */}
                <AnimatedDiv delay={400} className="mt-16 text-center">
                    <div className="inline-flex flex-col items-center text-muted-foreground animate-bounce">
                        <span className="text-sm font-medium">Or continue with our free plan</span>
                        <ChevronDown className="h-8 w-8" />
                    </div>
                </AnimatedDiv>

                {/* Free Tier Callout */}
                <AnimatedDiv delay={500}>
                    <Card className="max-w-3xl mx-auto mt-8 bg-card/50 backdrop-blur-xl border animated-border-card">
                        <CardHeader>
                            <CardTitle>Continue with the Free Plan</CardTitle>
                            <CardDescription>You can start learning with our basic features and upgrade anytime.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-3 text-sm">
                                {freeTierFeatures.map(feature => (
                                    <li key={feature.text} className="flex items-center gap-3">
                                        {feature.included 
                                            ? <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            : <X className="h-5 w-5 text-destructive flex-shrink-0" />
                                        }
                                        <span className={cn(!feature.included && 'text-muted-foreground line-through')}>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" asChild>
                                <Link href="/lms/dashboard">Start Learning for Free</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </AnimatedDiv>

            </div>
        </div>
    );
}
