/**
 * @fileoverview The Hero section for the homepage.
 * This is the first thing users see, featuring a bold headline and call-to-action buttons.
 */
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AnimatedDiv } from '../AnimatedDiv';

/**
 * Renders the hero section of the homepage.
 * @returns {JSX.Element} The Hero section component.
 */
export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent"></div>
      </div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <AnimatedDiv>
          <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight !leading-snug animated-gradient-text">
            Learn smarter, not harder.
            <br />
            Master any subject.
            <br />
            <span className="text-foreground/80">Your learning journey starts here.</span>
          </h1>
        </AnimatedDiv>
        <AnimatedDiv delay={200}>
          <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80 font-medium">
            Project_Neutron is an advanced Learning Management System designed to revolutionize how you learn, track progress, and achieve your educational goals.
          </p>
        </AnimatedDiv>
        <AnimatedDiv delay={400}>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/lms/onboarding">Start Learning</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </AnimatedDiv>
      </div>
    </section>
  );
}
