/**
 * @fileoverview Service page for Recruitment Training.
 * Details the soft and professional skills offerings and provides tiered pricing.
 */
'use client';

import Header from '@/components/Header.component';
import Footer from '@/components/Footer.component';
import { ArrowRight, Sparkles, Wrench, MessageSquareQuote, Users, Presentation, Layers, BrainCircuit, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { toast } from 'sonner';
import { PricingCard } from '@/components/pricing/pricing-card';

/**
 * Data for skills you will master, displayed in the skills section.
 */
const skillsToMaster = [
    { icon: <MessageSquareQuote className="w-6 h-6" />, title: 'Communication Mastery' },
    { icon: <Users className="w-6 h-6" />, title: 'Teamwork & Collaboration' },
    { icon: <Presentation className="w-6 h-6" />, title: 'Leadership & Influence' },
    { icon: <Wrench className="w-6 h-6" />, title: 'Advanced Resume Writing' },
    { icon: <Sparkles className="w-6 h-6" />, title: 'Behavioral Interview Simulation' },
    { icon: <ArrowRight className="w-6 h-6" />, title: 'Targeted Job Application Strategy' },
];

/**
 * Pricing tiers for the recruitment training programs.
 */
const pricingTiers = [
    { title: 'Interview Essentials', price: 129, icon: <BrainCircuit className="w-8 h-8 mb-4 text-primary" />, features: ['Resume & Cover Letter Review', '1-on-1 Mock Interview', 'Common Questions Guide', 'Email Support'] },
    { title: 'Job Search Pro', price: 299, icon: <Layers className="w-8 h-8 mb-4 text-accent" />, features: ['All Essentials Features', '3 Mock Interview Sessions', 'LinkedIn Profile Makeover', 'Targeted Job Search Strategy'], popular: true },
    { title: 'Elite Career Placement', price: 599, icon: <UserCheck className="w-8 h-8 mb-4 text-destructive" />, features: ['All Pro Features', 'Unlimited Mock Interviews', 'Personal Branding Course', 'Networking Assistance'] },
];

/**
 * Renders the Recruitment Training service page.
 * @returns {JSX.Element} The Recruitment Training page component.
 */
export default function RecruitmentTrainingPage() {

    /**
     * Handles the "Enroll Now" button click, showing a toast notification for the prototype.
     */
    const handleContactClick = () => {
        toast.info('Prototype Feature', {
            description: 'Plan subscriptions are not implemented in this prototype.',
        });
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />

            <main className="flex-1 overflow-hidden">
                {/* Hero Section */}
                <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-20">
                     <div className="absolute inset-0 bg-secondary/20 backdrop-blur-sm">
                        <Image src="https://placehold.co/1920x1080" alt="Recruitment background" fill className="object-cover opacity-10" data-ai-hint="business presentation" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
                    </div>
                    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <AnimatedDiv>
                            <h1 className="font-headline text-5xl md:text-6xl font-bold animated-gradient-text pb-4">
                                Recruitment Training
                            </h1>
                        </AnimatedDiv>
                        <AnimatedDiv delay={200}>
                            <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-foreground/80">
                                Navigate the global job market with confidence. We equip you with the essential skills to stand out and secure your dream role.
                            </p>
                        </AnimatedDiv>
                    </div>
                </section>
                
                {/* Pricing Section */}
                <section id="pricing" className="py-20 sm:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center mb-16">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-2">Training Programs</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                                Choose a program that fits your needs and get ready to land your next job.
                            </p>
                        </AnimatedDiv>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
                            {pricingTiers.map((tier, index) => (
                                <AnimatedDiv key={tier.title} delay={200 + 100 * index}>
                                    <PricingCard 
                                        {...tier}
                                        priceSuffix="/one-time"
                                        onActionClick={handleContactClick}
                                        actionText="Enroll Now"
                                    />
                                </AnimatedDiv>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Skills Section */}
                <section className="py-20 sm:py-28 bg-secondary/20 backdrop-blur-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center mb-16">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-4">What You'll Master</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                                From crafting the perfect application to acing the interview, we cover every skill you need to succeed.
                            </p>
                        </AnimatedDiv>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {skillsToMaster.map((skill, index) => (
                                <AnimatedDiv key={skill.title} delay={200 + index * 100}>
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="p-3 bg-primary/10 rounded-lg text-primary">{skill.icon}</div>
                                        <h3 className="font-medium text-lg">{skill.title}</h3>
                                    </div>
                                </AnimatedDiv>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
}
