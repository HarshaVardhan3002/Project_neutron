/**
 * @fileoverview The "Testimonials" section for the homepage.
 * It displays quotes from satisfied students or clients, fetched from the backend.
 */
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedDiv } from '../AnimatedDiv';
import { apiClient } from '@/lib/api.service';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the type for a single testimonial
interface Testimonial {
  quote: string;
  name: string;
  title: string;
  avatar: string;
}

/**
 * Renders the Testimonials section of the homepage.
 * This component now fetches its data from the backend API.
 * @returns {JSX.Element} The Testimonials section component.
 */
export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getWebsiteSection('testimonials');

        // The API returns the whole section object. The actual testimonials are in the 'content' property.
        if (response.data && response.data.content) {
          setTestimonials(response.data.content);
        } else {
          // If no content is found, set to empty array to avoid errors
          setTestimonials([]);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
        setError("Could not load testimonials at this time. Please try again later.");
        // In case of error, we can still show some placeholder or nothing
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const renderSkeletons = () => (
    Array.from({ length: 2 }).map((_, index) => (
      <Card key={index} className="bg-card p-6 border h-full">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="space-y-2 flex-grow mb-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  );

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
          {isLoading ? (
            renderSkeletons()
          ) : error ? (
            <div className="col-span-2 text-center text-red-500">{error}</div>
          ) : testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
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
            ))
          ) : (
            <div className="col-span-2 text-center text-muted-foreground">No testimonials available at the moment.</div>
          )}
        </div>
      </div>
    </section>
  );
}
