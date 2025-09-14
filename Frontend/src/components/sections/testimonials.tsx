/**
 * @fileoverview The "Testimonials" section for the homepage.
 * It displays quotes from satisfied students or clients.
 */
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedDiv } from '../AnimatedDiv';

/**
 * An array of testimonial data.
 * In a real application, this would be fetched from a CMS or database.
 */
const testimonials = [
  {
    quote: "Project_Neutron completely transformed my learning experience. The interactive courses and progress tracking helped me master complex topics faster than I ever thought possible.",
    name: "Sarah Chen",
    title: "Computer Science Student",
    avatar: "https://placehold.co/100x100"
  },
  {
    quote: "The adaptive learning system is incredible. It identified my weak areas and provided personalized content that helped me improve significantly. Best LMS I've ever used!",
    name: "Michael Rodriguez",
    title: "Data Science Learner",
    avatar: "https://placehold.co/100x100"
  },
];

/**
 * Renders the Testimonials section of the homepage.
 * @returns {JSX.Element} The Testimonials section component.
 */
export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="pt-10 sm:pt-16 pb-20 sm:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <AnimatedDiv>
            <h2 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text">What Our Students Say</h2>
          </AnimatedDiv>
          <AnimatedDiv delay={200}>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-foreground/80">
              Hear from learners who have transformed their educational journey with Project_Neutron.
            </p>
          </AnimatedDiv>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedDiv key={index} delay={200 + index * 100}>
              <Card className="bg-card p-6 border h-full">
                <CardContent className="p-0 flex flex-col h-full">
                  <blockquote className="text-base sm:text-lg text-foreground/90 mb-6 flex-grow font-medium">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-semibold font-headline text-sm sm:text-base">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
