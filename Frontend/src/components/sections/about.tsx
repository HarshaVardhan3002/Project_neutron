/**
 * @fileoverview The "About Us" section for the homepage.
 * It features a description, an animated timeline, and an image slideshow.
 * This component now fetches its content from the backend.
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Rocket, Lightbulb, Handshake, Target, CreditCard, Icon as LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils.helper';
import { AnimatedDiv } from '../AnimatedDiv';
import { apiClient } from '@/lib/api.service';
import { Skeleton } from '@/components/ui/skeleton';

// --- Type Definitions ---

interface TimelineStep {
  text: string;
  icon: string; // Icon name as a string
}

interface SlideshowImage {
  src: string;
  alt: string;
  hint?: string;
}

interface AboutSectionData {
  title: string;
  subtitle: string;
  description: string;
  timelineSteps: TimelineStep[];
  slideshowImages: SlideshowImage[];
}

// --- Icon Mapping ---

const iconMap: { [key: string]: LucideIcon } = {
  Handshake,
  Lightbulb,
  Rocket,
  Target,
  CreditCard,
};

// --- Default/Placeholder Data ---

const defaultData: AboutSectionData = {
  title: "About Project_Neutron",
  subtitle: "Next-Generation Learning Management System",
  description: "Project_Neutron was built on the foundation that learning should be intelligent, adaptive, and accessible to everyone. Our advanced LMS platform combines cutting-edge technology with intuitive design to create personalized learning experiences that adapt to each student's unique needs and learning style.",
  timelineSteps: [
    { text: "Sign Up", icon: "Handshake" },
    { text: "Choose Course", icon: "Lightbulb" },
    { text: "Start Learning", icon: "Rocket" },
    { text: "Track Progress", icon: "Target" },
    { text: "Get Certified", icon: "CreditCard" },
  ],
  slideshowImages: [
    { src: 'https://placehold.co/800x600', alt: 'Placeholder image 1' },
    { src: 'https://placehold.co/800x600', alt: 'Placeholder image 2' },
    { src: 'https://placehold.co/800x600', alt: 'Placeholder image 3' },
  ]
};

// --- Timeline Visuals ---

const activeStepClasses = [
  "border-chart-1 bg-chart-1 text-primary-foreground shadow-lg shadow-chart-1/50 scale-110",
  "border-chart-4 bg-chart-4 text-primary-foreground shadow-lg shadow-chart-4/50 scale-110",
  "border-chart-3 bg-chart-3 text-primary-foreground shadow-lg shadow-chart-3/50 scale-110",
  "border-chart-2 bg-chart-2 text-primary-foreground shadow-lg shadow-chart-2/50 scale-110",
  "border-chart-5 bg-chart-5 text-primary-foreground shadow-lg shadow-chart-5/50 scale-110",
];

const connectorColors = ['bg-chart-1', 'bg-chart-4', 'bg-chart-3', 'bg-chart-2'];


/**
 * Renders the "About Us" section of the homepage.
 * @returns {JSX.Element} The About Us section component.
 */
export default function AboutUsSection() {
  const [data, setData] = useState<AboutSectionData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(-1);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getWebsiteSection('about');
        if (response.data && response.data.content) {
          setData(response.data.content);
        } else {
          // If no content is found from the API, we'll just use the default data
          console.warn("No 'about' section content found in API response. Using default data.");
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch 'about' section content:", err);
        setError("Could not load content at this time.");
        // In case of error, we still have the default data to display
      } finally {
        setIsLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const nextSlide = useCallback(() => {
    if (data.slideshowImages.length === 0) return;
    setCurrentSlide((prev) => (prev === data.slideshowImages.length - 1 ? 0 : prev + 1));
  }, [data.slideshowImages.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 4000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    const animateTimeline = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setAnimatedStep(-1);
      const startTimer = setTimeout(() => {
        for (let i = 0; i < data.timelineSteps.length; i++) {
          const stepTimer = setTimeout(() => setAnimatedStep(i), i * 600);
          timers.push(stepTimer);
        }
      }, 100);
      timers.push(startTimer);
    };
    animateTimeline();
    const animationCycleDuration = (data.timelineSteps.length * 600) + 2500;
    const intervalId = setInterval(animateTimeline, animationCycleDuration);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(intervalId);
    };
  }, [data.timelineSteps.length]);

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />;
  };

  return (
    <section id="about" className="pt-8 sm:pt-12 pb-16 sm:pb-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <AnimatedDiv>
            <h2 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text mb-4 pb-2">
              {isLoading ? <Skeleton className="h-12 w-3/4 mx-auto" /> : data.title}
            </h2>
          </AnimatedDiv>
          <AnimatedDiv delay={100}>
            <p className="text-lg sm:text-xl text-foreground/80 font-medium">
              {isLoading ? <Skeleton className="h-6 w-1/2 mx-auto" /> : data.subtitle}
            </p>
          </AnimatedDiv>
        </div>

        {error && <div className="text-center text-red-500 mb-8">{error}</div>}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedDiv delay={200}>
            <p className="text-base sm:text-lg text-foreground/70">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : (
                data.description
              )}
            </p>
          </AnimatedDiv>

          <AnimatedDiv delay={300} className="relative aspect-[4/3] lg:aspect-video rounded-2xl shadow-2xl shadow-primary/10">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              data.slideshowImages.map((image, index) => (
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
              ))
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {data.slideshowImages.map((_, index) => (
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
                {data.timelineSteps.map((step, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== data.timelineSteps.length - 1 ? (
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
                            {renderIcon(step.icon)}
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
                {data.timelineSteps.map((step, index) => (
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
                        {renderIcon(step.icon)}
                      </div>
                      <p className={cn(
                        "mt-2 text-sm font-medium transition-colors duration-500",
                        animatedStep >= index ? "text-foreground font-bold" : "text-muted-foreground"
                      )}>
                        {step.text}
                      </p>
                    </div>
                    {index < data.timelineSteps.length - 1 && (
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
