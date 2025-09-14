/**
 * @fileoverview Service page for Visa Processing.
 * Features an interactive country selector and a clear outline of the application process.
 */
'use client';

import React from 'react';
import Header from '@/components/Header.component';
import Footer from '@/components/Footer.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Plane, Briefcase, GraduationCap, FileCheck, Files, PlaneTakeoff, PartyPopper } from 'lucide-react';
import { AnimatedDiv } from '@/components/AnimatedDiv';
import { toast } from 'sonner';

/**
 * Defines the structure for a country's information.
 */
type Country = {
    name: string;
    flag: string;
    description: string;
    visaTypes: string[];
};

/**
 * List of countries and their available visa types, used to populate the filterable grid.
 */
const countries: Country[] = [
    { name: 'Australia', flag: '🇦🇺', description: 'World-class education and vibrant multicultural cities.', visaTypes: ['Student', 'Professional', 'Visit'] },
    { name: 'Ireland', flag: '🇮🇪', description: 'The tech hub of Europe with rich history and culture.', visaTypes: ['Student', 'Professional'] },
    { name: 'France', flag: '🇫🇷', description: 'Affordable tuition in a global center for art and science.', visaTypes: ['Student', 'Professional'] },
    { name: 'USA', flag: '🇺🇸', description: 'Home to world-leading universities and diverse career opportunities.', visaTypes: ['Student', 'Professional', 'Visit'] },
    { name: 'United Kingdom', flag: '🇬🇧', description: 'A globally respected destination for academic and professional growth.', visaTypes: ['Student', 'Professional', 'Visit'] },
    { name: 'Canada', flag: '🇨🇦', description: 'Welcoming immigration policies and a high quality of life.', visaTypes: ['Student', 'Professional', 'Visit'] },
    { name: 'Schengen Area', flag: '🇪🇺', description: 'Explore 27 European countries with a single unified visa.', visaTypes: ['Visit'] },
];

/**
 * Steps outlining the visa application process.
 */
const processSteps = [
    { icon: <FileCheck className="h-10 w-10" />, title: 'Initial Consultation & Eligibility Check', description: 'We assess your profile against the latest immigration rules to determine your best visa options.'},
    { icon: <Files className="h-10 w-10" />, title: 'Document Preparation', description: 'Our experts guide you in gathering and verifying all necessary documents for a flawless submission.'},
    { icon: <PlaneTakeoff className="h-10 w-10" />, title: 'Application Submission', description: 'We manage the entire application process, from filling forms to booking appointments, ensuring accuracy.'},
    { icon: <PartyPopper className="h-10 w-10" />, title: 'Approval & Pre-Departure', description: 'Congratulations! We provide post-visa guidance to prepare you for your exciting new journey.'},
];

/**
 * Renders the Visa Processing service page.
 * @returns {JSX.Element} The Visa Processing page component.
 */
export default function VisaProcessingPage() {
    const [filter, setFilter] = React.useState('Student');

    /**
     * Handles the "Start Application" button click, showing a toast notification for the prototype.
     */
    const handleEnquiryClick = () => {
        toast.info('Prototype Feature', {
            description: 'Enquiry submission is not implemented in this prototype.',
        });
    };

    const filteredCountries = countries.filter(c => c.visaTypes.includes(filter));

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 overflow-hidden">
                {/* Hero Section */}
                <section className="pt-28 pb-20 sm:pt-36 sm:pb-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <AnimatedDiv>
                            <h1 className="font-headline text-5xl md:text-6xl font-bold animated-gradient-text pb-4">
                                Visa Processing Services
                            </h1>
                        </AnimatedDiv>
                        <AnimatedDiv delay={200}>
                            <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-foreground/80">
                                Your gateway to the world. We provide expert, end-to-end guidance for a smooth and successful visa application.
                            </p>
                        </AnimatedDiv>
                    </div>
                </section>
                
                {/* Visa Types Section */}
                <section id="destinations" className="py-20 sm:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center mb-16">
                             <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-2">Destinations We Cover</h2>
                             <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                                Select a visa type to see the countries where we can support your application.
                            </p>
                        </AnimatedDiv>
                        
                        <AnimatedDiv delay={200}>
                            <div className="flex justify-center mb-12">
                                <div className="flex flex-wrap justify-center h-auto items-center rounded-md bg-muted/50 backdrop-blur-xl border p-1 text-muted-foreground">
                                    <Button variant={filter === 'Student' ? 'default' : 'ghost'} onClick={() => setFilter('Student')} className="px-6 py-2.5 flex-grow sm:flex-grow-0"><GraduationCap className="h-4 w-4 mr-2" />Student</Button>
                                    <Button variant={filter === 'Professional' ? 'default' : 'ghost'} onClick={() => setFilter('Professional')} className="px-6 py-2.5 flex-grow sm:flex-grow-0"><Briefcase className="h-4 w-4 mr-2" />Professional</Button>
                                    <Button variant={filter === 'Visit' ? 'default' : 'ghost'} onClick={() => setFilter('Visit')} className="px-6 py-2.5 flex-grow sm:flex-grow-0"><Plane className="h-4 w-4 mr-2" />Visit</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredCountries.map((country, index) => (
                                    <AnimatedDiv key={country.name + filter} delay={index * 100}>
                                        <Card className="flex flex-col group bg-background/50 backdrop-blur-xl border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all h-full text-center">
                                            <CardHeader>
                                                <div className="mx-auto text-5xl mb-2">{country.flag}</div>
                                                <CardTitle className="font-headline text-2xl">{country.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-muted-foreground">{country.description}</p>
                                            </CardContent>
                                            <CardFooter className="justify-center">
                                                <Button className="w-full" onClick={handleEnquiryClick}>
                                                    Start Application <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </AnimatedDiv>
                                ))}
                            </div>
                        </AnimatedDiv>
                    </div>
                </section>
                
                 {/* Our Visa Process Section */}
                 <section className="py-20 sm:py-28 bg-secondary/20 backdrop-blur-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedDiv className="text-center mb-16">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold animated-gradient-text pb-4">Our Simple 4-Step Visa Process</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                                We've streamlined the complexities of visa applications into a clear and manageable process.
                            </p>
                        </AnimatedDiv>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {processSteps.map((step, index) => (
                                <AnimatedDiv key={step.title} delay={200 + index * 100}>
                                    <div className="text-center p-6 h-full">
                                        <div className="flex justify-center mb-4 text-primary">{step.icon}</div>
                                        <h3 className="font-headline text-xl font-semibold mb-2">{step.title}</h3>
                                        <p className="text-muted-foreground text-sm">{step.description}</p>
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
