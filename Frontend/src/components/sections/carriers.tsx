/**
 * @fileoverview The "Carriers" (Careers) section for the homepage.
 * A simple call-to-action for users interested in joining the team.
 */
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AnimatedDiv } from '../AnimatedDiv';

/**
 * Renders the Carriers section of the homepage.
 * @returns {JSX.Element} The Carriers section component.
 */
export default function CarriersSection() {
  return (
    <section id="carriers" className="py-20 sm:py-32 bg-transparent overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <AnimatedDiv>
            <h2 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text">Join Our Community</h2>
          </AnimatedDiv>
          <AnimatedDiv delay={200}>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-foreground/80">
              Be part of a growing community of learners and educators. Contribute to the future of education technology with Project_Neutron.
            </p>
          </AnimatedDiv>
          <AnimatedDiv className="mt-8" delay={400}>
            <Button asChild size="lg" variant="outline">
              <Link href="/lms/community">Join Community</Link>
            </Button>
          </AnimatedDiv>
        </div>
      </div>
    </section>
  );
}
