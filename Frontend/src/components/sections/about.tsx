/**
 * @fileoverview The "About Us" section for the homepage.
 * It features a description, an animated timeline, and an image slideshow.
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Rocket, Lightbulb, Handshake, Target, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils.helper';
import { AnimatedDiv } from '../AnimatedDiv';

/**
 * The steps in our learning journey timeline.
 */
const timelineSteps = [
  { text: "Sign Up", icon: <Handshake /> },
  { text: "Choose Course", icon: <Lightbulb /> },
  { text: "Start Learning", icon: <Rocket /> },
  { text: "Track Progress", icon: <Target /> },
  { text: "Get Certified", icon: <CreditCard /> },
];

/**
 * CSS classes for the active state of a timeline step, cycling through chart colors.
 */
const activeStepClasses = [
  "border-chart-1 bg-chart-1 text-primary-foreground shadow-lg shadow-chart-1/50 scale-110",
  "border-chart-4 bg-chart-4 text-primary-foreground shadow-lg shadow-chart-4/50 scale-110",
  "border-chart-3 bg-chart-3 text-primary-foreground shadow-lg shadow-chart-3/50 scale-110",
  "border-chart-2 bg-chart-2 text-primary-foreground shadow-lg shadow-chart-2/50 scale-110",
  "border-chart-5 bg-chart-5 text-primary-foreground shadow-lg shadow-chart-5/50 scale-110",
];

/**
 * Colors for the connectors between timeline steps.
 */
const connectorColors = [
  'bg-chart-1',
  'bg-chart-4',
  'bg-chart-3',
  'bg-chart-2',
];

/**
 * Images for the slideshow.
 */
const slideshowImages = [
  { src: 'https://placehold.co/800x600', alt: 'Students collaborating in a modern classroom', hint: 'students classroom' },
  { src: 'https://placehold.co/800x600', alt: 'A student receiving one-on-one coaching', hint: 'student coaching' },
  { src: 'https://placehold.co/800x600', alt: 'A graduate celebrating with their diploma', hint: 'student graduate' },
  { src: 'https://placehold.co/800x600', alt: 'A professional leading a training session', hint: 'professional training' }
];

/**
 * Renders the "About Us" section of the homepage.
 * @returns {JSX.Element} The About Us section component.
 */
export default function AboutUsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(-1);

  /**
   * Advances to the next slide in the slideshow, looping back to the start.
   */
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slideshowImages.length - 1 ? 0 : prev + 1));
  }, []);

  // Effect for the automatic slideshow transition.
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 4000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  // Effect for the looping timeline animation.
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    /**
     * Runs one cycle of the timeline animation.
     */
    const animateTimeline = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setAnimatedStep(-1);

      const startTimer = setTimeout(() => {
        for (let i = 0; i < timelineSteps.length; i++) {
          const stepTimer = setTimeout(() => {
            setAnimatedStep(i);
          }, i * 600); // Stagger the animation of each step.
          timers.push(stepTimer);
        }
      }, 100);
      timers.push(startTimer);
    };

    animateTimeline();
    const animationCycleDuration = (timelineSteps.length * 600) + 2500; // Total animation time plus a pause.
    const intervalId = setInterval(animateTimeline, animationCycleDuration);

    // Cleanup timers on component unmount.
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section id="about" className="pt-8 sm:pt-12 pb-16 sm:pb-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <AnimatedDiv>
            <h2 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text mb-4 pb-2">
              About Project_Neutron
            </h2>
          </AnimatedDiv>
          <AnimatedDiv delay={100}>
            <p className="text-lg sm:text-xl text-foreground/80 font-medium">
              Next-Generation Learning Management System
            </p>
          </AnimatedDiv>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedDiv delay={200}>
            <p className="text-base sm:text-lg text-foreground/70">
              Project_Neutron was built on the foundation that learning should be intelligent, adaptive, and accessible to everyone. Our advanced LMS platform combines cutting-edge technology with intuitive design to create personalized learning experiences that adapt to each student's unique needs and learning style.
            </p>
          </AnimatedDiv>

          <AnimatedDiv delay={300} className="relative aspect-[4/3] lg:aspect-video rounded-2xl shadow-2xl shadow-primary/10">
            {slideshowImages.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className={cn(
                  "object-cover transition-opacity duration-1000 ease-in-out rounded-2xl",
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                )}
                data-ai-hint={image.hint}
                priority={index === 0}
                unoptimized
              />
            ))}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slideshowImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-all duration-300',
                    currentSlide === index ? 'w-8 bg-primary' : 'bg-white/60 hover:bg-white'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </AnimatedDiv>
        </div>

        <AnimatedDiv className="mt-16 sm:mt-24" delay={200}>
          {/* Mobile timeline: vertical layout */}
          <div className="md:hidden">
            <div className="flow-root">
              <ul className="-mb-8">
                {timelineSteps.map((step, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== timelineSteps.length - 1 ? (
                        <span className="absolute left-6 top-6 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex items-center space-x-4">
                        <div>
                          <span className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background transition-all duration-500",
                            animatedStep >= index
                              ? activeStepClasses[index % activeStepClasses.length]
                              : "border-border bg-card text-muted-foreground"
                          )}>
                            {step.icon && React.cloneElement(step.icon, { className: 'h-6 w-6' })}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-base font-bold transition-colors duration-500",
                            animatedStep >= index ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Desktop timeline: horizontal layout */}
          <div className="hidden md:block">
            <div className="w-full overflow-x-auto pt-4 pb-4">
              <div className="flex items-start min-w-[32rem]">
                {timelineSteps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center w-28 shrink-0">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-500",
                          animatedStep >= index
                            ? activeStepClasses[index % activeStepClasses.length]
                            : "border-border bg-card text-muted-foreground"
                        )}
                      >
                        {step.icon && React.cloneElement(step.icon, { className: 'h-6 w-6' })}
                      </div>
                      <p className={cn(
                        "mt-2 text-sm font-medium transition-colors duration-500",
                        animatedStep >= index ? "text-foreground font-bold" : "text-muted-foreground"
                      )}>
                        {step.text}
                      </p>
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div className="flex-1 h-1 mt-7 bg-border relative overflow-hidden">
                        <div
                          className={cn(
                            "absolute top-0 left-0 h-full origin-left transition-transform duration-500",
                            connectorColors[index % connectorColors.length]
                          )}
                          style={{ transform: animatedStep > index ? 'scaleX(1)' : 'scaleX(0)' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </AnimatedDiv>
      </div>
    </section>
  );
}
