/**
 * @fileoverview Service page for Test Preparation.
 * Displays information about supported tests (IELTS, GRE, etc.) and provides tiered pricing plans for each.
 */
'use client';

import Header from '@/components/Header.component';
import Footer from '@/components/Footer.component';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, UserCheck, BrainCircuit, CheckCircle, FileCheck, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { toast } from 'sonner';
import Link from 'next/link';
import { PricingCard } from '@/components/pricing/pricing-card';

/**
 * Pricing tiers for each test preparation course.
 * Structured by test ID for easy lookup in the Tabs component.
 */
const pricingTiers = {
    ielts: [
        { title: 'AI Tutoring', price: 49, icon: <BrainCircuit className="w-8 h-8 mb-4 text-primary" />, features: ['24/7 AI Chatbot', 'Automated Essay Scoring', 'Unlimited Practice Tests', 'Progress Tracking'], href: '/lms/checkout' },
        { title: 'Hybrid Tutoring', price: 149, icon: <Layers className="w-8 h-8 mb-4 text-accent" />, features: ['All AI Features', '4 Live Group Sessions', 'Personalized Feedback', 'Expert Q&A Forums'], popular: true, href: '/lms/checkout' },
        { title: 'Human Tutoring', price: 299, icon: <UserCheck className="w-8 h-8 mb-4 text-destructive" />, features: ['All Hybrid Features', '8 One-on-One Sessions', 'Dedicated Expert Tutor', 'Custom Study Plan'], href: '/lms/checkout' },
    ],
    gre: [
        { title: 'AI Tutoring', price: 69, icon: <BrainCircuit className="w-8 h-8 mb-4 text-primary" />, features: ['Adaptive Q-Bank', 'AI-Powered Explanations', 'Full-length Mock Tests', 'Performance Analytics'], href: '/lms/checkout' },
        { title: 'Hybrid Tutoring', price: 199, icon: <Layers className="w-8 h-8 mb-4 text-accent" />, features: ['All AI Features', 'Weekly Live Strategy Classes', 'Graded Analytical Writing', 'Doubt Clearing Sessions'], popular: true, href: '/lms/checkout' },
        { title: 'Human Tutoring', price: 399, icon: <UserCheck className="w-8 h-8 mb-4 text-destructive" />, features: ['All Hybrid Features', '12 One-on-One Sessions', 'Personalized Quant & Verbal Coach', 'Application Strategy Call'], href: '/lms/checkout' },
    ],
    toefl: [
        { title: 'AI Tutoring', price: 59, icon: <BrainCircuit className="w-8 h-8 mb-4 text-primary" />, features: ['AI Speaking Practice', 'Automated Writing Feedback', 'Unlimited Sectional Tests', 'Score Prediction'], href: '/lms/checkout' },
        { title: 'Hybrid Tutoring', price: 179, icon: <Layers className="w-8 h-8 mb-4 text-accent" />, features: ['All AI Features', '6 Live Group Classes', 'Detailed Feedback on Speaking', 'Expert-led Workshops'], popular: true, href: '/lms/checkout' },
        { title: 'Human Tutoring', price: 349, icon: <UserCheck className="w-8 h-8 mb-4 text-destructive" />, features: ['All Hybrid Features', '10 One-on-One Sessions', 'Dedicated TOEFL Specialist', 'End-to-End Speaking & Writing Review'], href: '/lms/checkout' },
    ],
    pte: [
        { title: 'AI Tutoring', price: 39, icon: <BrainCircuit className="w-8 h-8 mb-4 text-primary" />, features: ['Real-time AI Scoring', 'Template-based Strategies', 'Full & Sectional Mock Tests', 'Weakness Identifier'], href: '/lms/checkout' },
        { title: 'Hybrid Tutoring', price: 129, icon: <Layers className="w-8 h-8 mb-4 text-accent" />, features: ['All AI Features', '4 Live Masterclasses', 'Expert Review of 2 Mock Tests', 'Strategy Discussion Forums'], popular: true, href: '/lms/checkout' },
        { title: 'Human Tutoring', price: 279, icon: <UserCheck className="w-8 h-8 mb-4 text-destructive" />, features: ['All Hybrid Features', '8 One-on-One Coaching Calls', 'Personalized Error Log', 'Unlimited Expert Doubt Clearing'], href: '/lms/checkout' },
    ],
};

/**
 * Steps outlining the learning process, displayed in the "How It Works" section.
 */
const howItWorksSteps = [
    {
        icon: <FileCheck className="w-10 h-10" />,
        title: 'Diagnostic Assessment',
        description: 'We start with a comprehensive test to pinpoint your strengths and weaknesses.',
    },
    {
        icon: <BrainCircuit className="w-10 h-10" />,
        title: 'Personalized Study Plan',
        description: 'Based on your results, we create a tailored study roadmap focusing on high-impact areas.',
    },
    {
        icon: <CheckCircle className="w-10 h-10" />,
        title: 'Achieve Your Target Score',
        description: 'With expert guidance and targeted practice, you’ll build the confidence and skills to ace your exam.',
    }
];

/**
 * Renders the Test Preparation service page.
 * @returns {JSX.Element} The Test Preparation page component.
 */
export default function TestPreparationPage() {

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 overflow-hidden">
                {/* Hero Section */}
                <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 text-center">
                    <AnimatedDiv>
                        <h1 className="font-headline text-5xl md:text-6xl font-bold animated-gradient-text pb-4">
                            Test Preparation
                        </h1>
                    </AnimatedDiv>
                    <AnimatedDiv delay={200}>
                        <p className="mt-4 container max-w-3xl mx-auto text-lg sm:text-xl text-foreground/80">
                            Achieve your highest potential. Our expert-led and AI-powered courses are designed to help you master every section of your exam.
                        </p>
                    </AnimatedDiv>
                </section>
                
                {/* AI Platform CTA */}
                <section className="py-16 sm:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv>
                            <div className="relative rounded-2xl p-8 md:p-12 border bg-card/50 backdrop-blur-xl overflow-hidden shadow-2xl hover:shadow-primary/20 transition-shadow duration-300">
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-16 -left-12 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
                                <div className="relative z-10 text-center">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1 rounded-full mb-4">
                                        <Zap className="h-5 w-5" /> New AI Platform
                                    </div>
                                    <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                                        Experience the Future of Test Prep
                                    </h2>
                                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
                                        Go beyond traditional learning. Try our new AI-powered platform with gamified lessons, instant feedback, and a personalized study plan that adapts to you.
                                    </p>
                                    <div className="mt-8">
                                        <Button size="lg" asChild className="transform hover:-translate-y-1 transition-transform duration-300">
                                            <Link href="/lms/onboarding">Start Your AI Journey <ArrowRight className="ml-2 h-5 w-5" /></Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </AnimatedDiv>
                    </div>
                </section>


                {/* Pricing Section */}
                <section id="pricing" className="py-20 sm:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center mb-16">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-2">Traditional Tutoring Plans</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                                Flexible tutoring options to match your learning style and budget. Select a test to see pricing.
                            </p>
                        </AnimatedDiv>
                        <AnimatedDiv delay={200}>
                            <Tabs defaultValue="ielts" className="w-full max-w-5xl mx-auto">
                                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-12 h-auto bg-muted/50 backdrop-blur-xl border rounded-lg p-1">
                                    <TabsTrigger value="ielts" className="py-2">IELTS</TabsTrigger>
                                    <TabsTrigger value="gre" className="py-2">GRE</TabsTrigger>
                                    <TabsTrigger value="toefl" className="py-2">TOEFL</TabsTrigger>
                                    <TabsTrigger value="pte" className="py-2">PTE</TabsTrigger>
                                </TabsList>
                                
                                {(Object.keys(pricingTiers) as Array<keyof typeof pricingTiers>).map(testKey => (
                                    <TabsContent key={testKey} value={testKey}>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                            {pricingTiers[testKey].map((tier, index) => (
                                                <AnimatedDiv key={tier.title} delay={100 * index}>
                                                    <PricingCard
                                                        {...tier}
                                                        actionText="Choose Plan"
                                                    />
                                                </AnimatedDiv>
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </AnimatedDiv>
                    </div>
                </section>
                
                {/* How It Works Section */}
                <section className="py-20 sm:py-28 bg-secondary/20 backdrop-blur-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center mb-16">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-4">A Proven Path to Success</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                                Our structured approach ensures you're fully prepared and confident on test day.
                            </p>
                        </AnimatedDiv>
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border hidden md:block" />
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                                {howItWorksSteps.map((step, index) => (
                                    <AnimatedDiv key={step.title} delay={200 + index * 100} className="text-center">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-xl border-2 border-primary text-primary shadow-lg transition-transform hover:scale-105">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <h3 className="font-headline text-xl font-semibold mb-2">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </AnimatedDiv>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            
            <Footer />
        </div>
    );
}
