/**
 * @fileoverview The "Our Services" section for the homepage.
 * It displays a grid of cards, each representing a key service offered.
 */
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Users, Stamp, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { AnimatedDiv } from '../AnimatedDiv';

/**
 * An array of LMS features, including icons, titles, descriptions, and links.
 */
const services = [
  {
    icon: <ClipboardCheck />,
    title: 'Interactive Assessments',
    description: 'Comprehensive quizzes, tests, and assignments with instant feedback to track your learning progress effectively.',
    href: '/lms/mock-tests',
  },
  {
    icon: <Users />,
    title: 'Collaborative Learning',
    description: 'Connect with peers, join study groups, and participate in discussions to enhance your learning experience.',
    href: '/lms/community',
  },
  {
    icon: <Stamp />,
    title: 'Progress Tracking',
    description: 'Advanced analytics and reporting tools to monitor your learning journey and identify areas for improvement.',
    href: '/lms/profile',
  },
  {
    icon: <GraduationCap />,
    title: 'Course Marketplace',
    description: 'Access a vast library of courses across multiple subjects with expert-created content and structured learning paths.',
    href: '/lms/marketplace',
  },
];

/**
 * Color and glow styles for the service cards, cycled through using the map index.
 */
const serviceColors = ['bg-primary/10 text-primary', 'bg-accent/10 text-accent', 'bg-destructive/10 text-destructive', 'bg-chart-4/10 text-chart-4'];
const serviceGlow = ['hover:shadow-primary/20', 'hover:shadow-accent/20', 'hover:shadow-destructive/20', 'hover:shadow-chart-4/20'];

/**
 * Renders the Services section of the homepage.
 * @returns {JSX.Element} The Services section component.
 */
export default function ServicesSection() {
  return (
    <section id="features" className="pt-10 sm:pt-16 pb-20 sm:pb-32 bg-background/70 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <AnimatedDiv>
            <h2 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text">Platform Features</h2>
          </AnimatedDiv>
          <AnimatedDiv delay={200}>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-foreground/80">
              Discover powerful features designed to enhance your learning experience and help you achieve your educational goals.
            </p>
          </AnimatedDiv>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <AnimatedDiv key={index} delay={200 + index * 100}>
              <Card
                className={`group flex flex-col text-center bg-card border transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${serviceGlow[index % serviceGlow.length]} h-full`}
              >
                <CardHeader className="items-center flex-shrink-0 pt-8">
                  <div className={`mb-4 p-4 rounded-full transition-transform duration-300 group-hover:scale-110 ${serviceColors[index % serviceColors.length]}`}>
                    {React.cloneElement(service.icon, { className: 'w-10 h-10' })}
                  </div>
                  <CardTitle className="font-headline text-xl sm:text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-foreground/70 text-sm sm:text-base">{service.description}</p>
                </CardContent>
                <CardFooter className="justify-center pt-4 pb-6">
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Link href={service.href}>
                      Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
