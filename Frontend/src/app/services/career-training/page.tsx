/**
 * @fileoverview Service page for Career Training & Upskilling.
 * Details the benefits and provides tiered pricing for different program levels.
 */
'use client';

import Header from '@/components/Header.component';
import Footer from '@/components/Footer.component';
import { Briefcase, Lightbulb, TrendingUp, UserRoundCheck, Layers, BrainCircuit, UserCheck } from 'lucide-react';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { toast } from 'sonner';
import { PricingCard } from '@/components/pricing/pricing-card';

/**
 * Key features of the Career Training service, highlighted in the "Why Upskill" section.
 */
const features = [
    {
        icon: <Briefcase className="h-10 w-10 text-primary" />,
        title: 'Industry-Relevant Curriculum',
        description: 'Our courses are designed with industry experts to teach you the most in-demand skills.',
    },
    {
        icon: <UserRoundCheck className="h-10 w-10 text-accent" />,
        title: 'Expert-Led Training',
        description: 'Learn from seasoned professionals with real-world experience in their respective fields.',
    },
    {
        icon: <TrendingUp className="h-10 w-10 text-destructive" />,
        title: 'Career Advancement',
        description: 'Gain a competitive edge, unlock new career opportunities, and increase your earning potential.',
    },
    {
        icon: <Lightbulb className="h-10 w-10 text-chart-4" />,
        title: 'Personalized Learning Paths',
        description: 'We help you identify skill gaps and tailor a learning journey that aligns with your career goals.',
    },
];

/**
 * Pricing tiers for the career training programs.
 */
const pricingTiers = [
    { title: 'Career Kickstarter', price: 99, icon: <BrainCircuit className="w-8 h-8 mb-4 text-primary" />, features: ['Professional Resume & CV Writing', 'LinkedIn Profile Optimization', '1 Career Strategy Session', 'Email Support'] },
    { title: 'Career Accelerator', price: 249, icon: <Layers className="w-8 h-8 mb-4 text-accent" />, features: ['All Kickstarter Features', 'Mock Interview Sessions (x3)', 'Job Application Strategy', 'Priority Email & Chat Support'], popular: true },
    { title: 'Total Transformation', price: 499, icon: <UserCheck className="w-8 h-8 mb-4 text-destructive" />, features: ['All Accelerator Features', 'Personal Branding Coaching', 'Salary Negotiation Training', 'Direct Referrals (where applicable)'] },
];

/**
 * Renders the Career Training & Upskilling service page.
 * @returns {JSX.Element} The Career Training page component.
 */
export default function CareerTrainingPage() {

    /**
     * Handles the "Enroll Now" button click, showing a toast notification for the prototype.
     */
    const handleEnquiryClick = () => {
        toast.info('Prototype Feature', {
            description: 'Plan subscriptions are not implemented in this prototype.',
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />

            <main className="flex-1 overflow-hidden">
                {/* Hero Section */}
                <section className="pt-28 pb-20 sm:pt-36 sm:pb-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <AnimatedDiv>
                            <h1 className="font-headline text-5xl md:text-6xl font-bold animated-gradient-text pb-4">
                                Career Training & Upskilling
                            </h1>
                        </AnimatedDiv>
                        <AnimatedDiv delay={200}>
                            <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-foreground/80">
                                Invest in yourself. Elevate your skills to meet the demands of the modern global workforce and accelerate your career.
                            </p>
                        </AnimatedDiv>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 sm:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center mb-16">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-2">Our Programs</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                                Transparent pricing for programs designed to deliver real results for your career.
                            </p>
                        </AnimatedDiv>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
                            {pricingTiers.map((tier, index) => (
                                <AnimatedDiv key={tier.title} delay={200 + 100 * index}>
                                    <PricingCard 
                                        {...tier}
                                        priceSuffix="/one-time"
                                        onActionClick={handleEnquiryClick}
                                        actionText="Enroll Now"
                                    />
                                </AnimatedDiv>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Why Upskill Section */}
                <section className="py-20 sm:py-28 bg-secondary/20 backdrop-blur-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center max-w-4xl mx-auto mb-16">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-4">
                                Why Upskilling is Your Smartest Career Move
                            </h2>
                            <p className="text-foreground/70 text-base sm:text-lg">
                                In a rapidly evolving job market, continuous learning isn't just an advantage—it's a necessity. Upskilling bridges the gap between your current abilities and the skills required for your next career move, whether that's a promotion, a new role, or a different industry altogether. We empower you to become a driver of change in your professional life.
                            </p>
                        </AnimatedDiv>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => (
                                <AnimatedDiv key={feature.title} delay={200 + index * 100}>
                                    <div className="text-center p-6 h-full">
                                        <div className="flex justify-center mb-4">{feature.icon}</div>
                                        <h3 className="font-headline text-xl font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm">{feature.description}</p>
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
